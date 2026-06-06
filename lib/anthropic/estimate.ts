import Anthropic from "@anthropic-ai/sdk";
import {
  EstimateSchema,
  mapApiEstimateToMeals,
  type MealEstimate,
} from "./schemas";
import { SYSTEM_PROMPT } from "./system-prompt";

// maxRetries:1 keeps the SDK's own exponential-backoff retries (on 429 /
// overloaded / 5xx) from silently eating our latency budget. We add our own
// fast no-tools fallback below instead.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 1,
});

// Per-request ceiling so a single hung turn can't run past the route's
// maxDuration. The caller's AbortSignal (client disconnect) still wins if it
// fires earlier.
const REQUEST_TIMEOUT_MS = 40_000;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

/**
 * Pulls the first {...} block out of the model's response.
 * The system prompt asks for raw JSON only, but we still strip code fences /
 * leading commentary defensively so a stray preamble doesn't fail the parse.
 */
function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    // Log the actual text so server logs can diagnose future failures.
    const preview = raw.slice(0, 300).replace(/\n/g, "\\n");
    console.error("extractJsonObject: no JSON in model text", {
      length: raw.length,
      preview,
    });
    throw new Error(
      `No JSON object found in model response (got ${raw.length} chars: "${preview}")`
    );
  }
  return candidate.slice(start, end + 1);
}

function parseEstimateJson(raw: string): MealEstimate[] {
  const json = extractJsonObject(raw);
  const parsed = JSON.parse(json);
  const validated = EstimateSchema.parse(parsed);
  for (const meal of validated.meals) {
    const breakdownSum = meal.breakdown.reduce(
      (sum, item) => sum + item.calories,
      0
    );
    if (Math.abs(breakdownSum - meal.calories) > 1) {
      console.warn("Calorie mismatch", {
        item: meal.text_he,
        total: meal.calories,
        breakdownSum,
      });
    }
  }
  return mapApiEstimateToMeals(validated);
}

async function callModel(
  mealText: string,
  signal?: AbortSignal,
  useTools = true
): Promise<MealEstimate[]> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: mealText },
  ];

  // Web search is unrestricted (whole web) so the model can verify uncertain
  // brand/restaurant items; the prompt steers it toward authoritative sources.
  // max_uses caps latency, and we loop turns until end_turn.
  const tools: Anthropic.Tool[] | undefined = useTools
    ? [
        {
          type: "web_search_20260209",
          name: "web_search",
          max_uses: 3,
        } as unknown as Anthropic.Tool,
      ]
    : undefined;

  // web_search_20260209 is server-side but still emits stop_reason:"tool_use"
  // turns, requiring the client to loop until end_turn.
  for (let turn = 0; turn < 6; turn++) {
    const response = await client.messages.create(
      {
        model: "claude-sonnet-4-6",
        // Splitting can yield several meals, each with its own breakdown, so we
        // give more headroom than a single-meal response needed.
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        ...(tools ? { tools } : {}),
        messages,
      },
      { signal, timeout: REQUEST_TIMEOUT_MS }
    );

    const blockTypes = response.content.map((b) => b.type).join(",");
    console.log(`callModel turn=${turn} stop=${response.stop_reason} blocks=[${blockTypes}]`);

    if (response.stop_reason === "end_turn") {
      return parseEstimateJson(extractText(response));
    }

    if (response.stop_reason === "tool_use") {
      // Advance the conversation; Anthropic fills in search results server-side.
      messages.push({ role: "assistant", content: response.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = response.content
        .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
        .map((b) => ({
          type: "tool_result" as const,
          tool_use_id: b.id,
          content: [],
        }));
      if (toolResults.length) {
        messages.push({ role: "user", content: toolResults });
      }
      continue;
    }

    // max_tokens or other unexpected stop — try to salvage any text already emitted.
    const fallback = extractText(response);
    if (fallback) return parseEstimateJson(fallback);
    throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);
  }

  throw new Error("web_search loop exceeded max turns");
}

export async function estimateCalories(
  mealText: string,
  signal?: AbortSignal
): Promise<MealEstimate[]> {
  try {
    return await callModel(mealText, signal);
  } catch (firstError) {
    // Don't re-run the whole web-search loop (that's what doubled the worst
    // case past the timeout). Most retryable failures are malformed JSON, which
    // a fast no-tools pass resolves. If the client already disconnected, bail.
    if (signal?.aborted) throw firstError;
    console.warn("Estimate parse failed, retrying once (no tools)", firstError);
    try {
      return await callModel(mealText, signal, false);
    } catch (secondError) {
      console.error("Estimate failed after retry", secondError);
      throw secondError;
    }
  }
}
