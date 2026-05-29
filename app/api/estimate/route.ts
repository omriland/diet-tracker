import { NextResponse } from "next/server";
import { z } from "zod";
import { estimateCalories } from "@/lib/anthropic/estimate";

// Web search + model turns legitimately need more than the platform default
// (10s Hobby / short on some hosts). Cap it explicitly so the function isn't
// killed mid-estimate before our own timeouts fire.
export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  text: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = RequestSchema.parse(body);
    // Propagate client disconnect (its 55s abort) down to the Anthropic call so
    // we stop burning tokens/time once the user is no longer waiting.
    const estimate = await estimateCalories(text, request.signal);
    return NextResponse.json(estimate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("Estimate API error", error);
    // Surface the underlying error so the client can show it and the user can
    // copy/paste a useful report. We're a single-user app with no PII in
    // error messages, so passing the SDK error through is fine.
    const detail =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown error";
    const name = error instanceof Error ? error.name : "Error";
    return NextResponse.json(
      { error: "Failed to estimate calories", detail, name },
      { status: 502 }
    );
  }
}
