"use client";

import Link from "next/link";
import { useWeights } from "@/hooks/use-weights";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";
import { getWeightDelta } from "@/lib/firestore/weights";
import { cn } from "@/lib/utils";

interface WeightTodayCardProps {
  uid: string;
}

export function WeightTodayCard({ uid }: WeightTodayCardProps) {
  const { entries, loading } = useWeights(uid);
  const today = getJerusalemDateString();
  const latest = entries.find((e) => e.date <= today);

  if (loading || !latest) return null;

  const delta7 = getWeightDelta(entries, 7, today);
  const dropping = delta7 != null && delta7 < 0;

  return (
    <Link
      href="/weight"
      className="border-hairline group flex items-center justify-between border-y py-3 transition-colors hover:border-border"
    >
      <span className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase">
        Weight
      </span>
      <span className="flex items-baseline gap-2">
        <span
          className="tabular-nums text-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {latest.weightKg.toFixed(1)} kg
        </span>
        {delta7 != null && delta7 !== 0 && (
          <span
            className={cn(
              "text-xs tabular-nums",
              dropping ? "text-success" : "text-muted-foreground"
            )}
          >
            {dropping ? "▼" : "▲"} {Math.abs(delta7).toFixed(1)} · 7d
          </span>
        )}
      </span>
    </Link>
  );
}
