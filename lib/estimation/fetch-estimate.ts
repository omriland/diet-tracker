import type { MealEstimate } from "@/lib/anthropic/schemas";
import { getCachedEstimate, saveCachedEstimate, touchCache } from "./cache";

const ESTIMATE_TIMEOUT_MS = 15_000;

export async function fetchMealEstimate(
  uid: string,
  text: string
): Promise<{ estimate: MealEstimate; source: "AI" | "AI_CACHED" }> {
  const cached = await getCachedEstimate(uid, text);
  if (cached) {
    void touchCache(uid, text);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hitCount, lastUsedAt, ...estimate } = cached;
    return { estimate, source: "AI_CACHED" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ESTIMATE_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Estimate timed out after 15 seconds");
    }
    throw err;
  }
  clearTimeout(timer);

  if (!response.ok) {
    throw new Error(`Estimate failed (${response.status})`);
  }

  const estimate = (await response.json()) as MealEstimate;
  void saveCachedEstimate(uid, text, estimate);
  return { estimate, source: "AI" };
}
