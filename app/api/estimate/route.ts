import { NextResponse } from "next/server";
import { z } from "zod";
import { estimateCalories } from "@/lib/anthropic/estimate";

const RequestSchema = z.object({
  text: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = RequestSchema.parse(body);
    const estimate = await estimateCalories(text);
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
