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
    return NextResponse.json(
      { error: "Failed to estimate calories" },
      { status: 502 }
    );
  }
}
