import Anthropic from "@anthropic-ai/sdk";
import {
  EstimateSchema,
  mapApiEstimateToMeal,
  type MealEstimate,
} from "./schemas";
import { SYSTEM_PROMPT, WEB_SEARCH_ALLOWED_DOMAINS } from "./system-prompt";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function parseEstimateJson(raw: string): MealEstimate {
  const parsed = JSON.parse(raw);
  const validated = EstimateSchema.parse(parsed);
  const breakdownSum = validated.breakdown.reduce(
    (sum, item) => sum + item.calories,
    0
  );
  if (Math.abs(breakdownSum - validated.calories) > 1) {
    console.warn("Calorie mismatch", {
      total: validated.calories,
      breakdownSum,
    });
  }
  return mapApiEstimateToMeal(validated);
}

async function callModel(mealText: string): Promise<MealEstimate> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 3,
        allowed_domains: WEB_SEARCH_ALLOWED_DOMAINS,
        user_location: { type: "approximate", country: "IL" },
      },
    ],
    messages: [
      { role: "user", content: mealText },
      { role: "assistant", content: "{" },
    ],
  });

  const modelText = extractText(response);
  const raw = `{${modelText}`;
  return parseEstimateJson(raw);
}

export async function estimateCalories(mealText: string): Promise<MealEstimate> {
  try {
    return await callModel(mealText);
  } catch (firstError) {
    console.warn("Estimate parse failed, retrying once", firstError);
    try {
      return await callModel(mealText);
    } catch (secondError) {
      console.error("Estimate failed after retry", secondError);
      throw secondError;
    }
  }
}
