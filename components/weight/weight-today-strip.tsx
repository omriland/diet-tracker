"use client";

import Link from "next/link";
import { useWeights } from "@/hooks/use-weights";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";
import { getWeightDelta } from "@/lib/firestore/weights";
import { cn } from "@/lib/utils";

interface WeightTodayStripProps {
  uid: string;
}

export function WeightTodayStrip({ uid }: WeightTodayStripProps) {
  const { entries, loading } = useWeights(uid);
  const today = getJerusalemDateString();
  const latest = entries.find((e) => e.date <= today);

  if (loading || !latest) return null;

  const delta7 = getWeightDelta(entries, 7, today);
  const showDelta = delta7 != null && delta7 !== 0;
  const dropping = delta7 != null && delta7 < 0;

  return (
    <Link
      href="/weight"
      className="flex items-center justify-between border-b border-hairline py-3"
    >
      <span className="text-sm text-muted-foreground">Weight:</span>
      <span className="flex items-baseline gap-2">
        <span className="text-[15px] font-bold tabular-nums text-foreground">
          {latest.weightKg.toFixed(1)} kg
        </span>
        {showDelta && (
          <span className={cn("text-sm tabular-nums", dropping ? "text-accent" : "text-destructive")}>
            {dropping ? "" : "+"}
            {delta7!.toFixed(1)} kg (7d)
          </span>
        )}
      </span>
    </Link>
  );
}
