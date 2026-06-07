import { NextResponse } from "next/server";
import { BUILD_ID } from "@/lib/version";

// Always reflect the live deployment's build id; never cache the response so an
// old tab polling this endpoint sees the new version immediately after a deploy.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { buildId: BUILD_ID },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
