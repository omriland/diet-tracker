import type { MealEstimate } from "@/lib/anthropic/schemas";
import { getCachedEstimate, saveCachedEstimate, touchCache } from "./cache";

const ESTIMATE_TIMEOUT_MS = 30_000;

export class EstimateCancelledError extends Error {
  constructor() {
    super("Estimate cancelled");
    this.name = "EstimateCancelledError";
  }
}

/**
 * Looks up the local Firestore cache first; on miss, calls /api/estimate.
 *
 * @param externalSignal optional AbortSignal — when aborted from the caller
 *   (e.g. sheet closed mid-flight) we throw `EstimateCancelledError` so the
 *   UI can swallow it silently rather than showing a real error.
 */
export async function fetchMealEstimate(
  uid: string,
  text: string,
  externalSignal?: AbortSignal
): Promise<{ estimate: MealEstimate; source: "AI" | "AI_CACHED" }> {
  if (externalSignal?.aborted) throw new EstimateCancelledError();

  // Cache is best-effort. A failed lookup (network blip, transient rules
  // hiccup) should not block the whole flow — fall through to the API.
  try {
    const cached = await getCachedEstimate(uid, text);
    if (cached) {
      void touchCache(uid, text);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hitCount, lastUsedAt, ...estimate } = cached;
      return { estimate, source: "AI_CACHED" };
    }
  } catch (err) {
    console.warn("Estimate cache lookup failed; falling through to API", err);
  }

  // Combine an internal timeout with the caller's signal — whichever fires
  // first aborts the fetch.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), ESTIMATE_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort("external");
  externalSignal?.addEventListener("abort", onExternalAbort, { once: true });

  let response: Response;
  try {
    response = await fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      if (externalSignal?.aborted) throw new EstimateCancelledError();
      throw new Error("Estimate timed out — try again or enter calories manually");
    }
    throw err;
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }

  if (!response.ok) {
    // Pull through the route's detail/name fields so the failed panel can
    // show something actionable.
    let detail = "";
    try {
      const body = (await response.json()) as {
        error?: string;
        detail?: string;
        name?: string;
      };
      const parts = [
        body.name && body.name !== "Error" ? body.name : null,
        body.detail || body.error,
      ].filter(Boolean);
      detail = parts.length ? `: ${parts.join(" — ")}` : "";
    } catch {
      // body wasn't JSON
    }
    throw new Error(`Estimate failed (${response.status})${detail}`);
  }

  const estimate = (await response.json()) as MealEstimate;
  void saveCachedEstimate(uid, text, estimate);
  return { estimate, source: "AI" };
}
