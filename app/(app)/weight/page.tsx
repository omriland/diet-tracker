"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/weight/weight-chart";
import { WeightEntryList } from "@/components/weight/weight-entry-list";
import { LogWeightSheet } from "@/components/weight/log-weight-sheet";
import { useAuth } from "@/components/providers/auth-provider";
import { useWeights } from "@/hooks/use-weights";
import {
  deleteWeight,
  filterWeightsByRange,
  getWeightDelta,
  upsertWeight,
} from "@/lib/firestore/weights";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";
import type { WeightEntry } from "@/types/weight";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: null as number | null },
] as const;

function deltaText(value: number | null): string {
  if (value == null) return "—";
  if (value === 0) return "0 kg";
  const sign = value < 0 ? "-" : "+";
  return `${sign}${Math.abs(value).toFixed(1)} kg`;
}

function DeltaChip({ label, value }: { label: string; value: number | null }) {
  const tone =
    value == null || value === 0
      ? "text-muted-foreground"
      : value < 0
        ? "text-accent"
        : "text-destructive";
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-pill bg-subtle px-3 py-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-[13px] font-bold tabular-nums", tone)}>
        {deltaText(value)}
      </span>
    </span>
  );
}

export default function WeightPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const { entries, loading } = useWeights(uid);
  const today = getJerusalemDateString();

  const [rangeDays, setRangeDays] = useState<number | null>(30);
  const [logOpen, setLogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<WeightEntry | null>(null);

  const chartData = useMemo(() => filterWeightsByRange(entries, rangeDays), [entries, rangeDays]);

  const latest = entries.find((e) => e.date <= today);
  const delta7 = latest ? getWeightDelta(entries, 7, today) : null;
  const delta30 = latest ? getWeightDelta(entries, 30, today) : null;

  return (
    <div className="editorial-in">
      <header className="border-b border-hairline py-4">
        <h1 className="text-[22px] font-bold text-foreground">Weight</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="pulse-dot text-2xl text-muted-foreground">·</span>
        </div>
      ) : (
        <>
          <section className="border-b border-hairline py-5">
            <p className="text-sm text-muted-foreground">Current</p>
            {latest ? (
              <>
                <p className="mt-1 flex items-baseline gap-1.5 text-[44px] font-extrabold leading-none tabular-nums text-foreground">
                  {latest.weightKg.toFixed(1)}
                  <span className="text-[15px] font-semibold text-muted-foreground">kg</span>
                </p>
                <div className="mt-3 flex gap-2">
                  <DeltaChip label="7d" value={delta7} />
                  <DeltaChip label="30d" value={delta30} />
                </div>
              </>
            ) : (
              <p className="mt-1 text-[24px] text-muted-foreground">No weight logged yet</p>
            )}
          </section>

          <section className="border-b border-hairline py-4">
            <div className="flex gap-2">
              {RANGES.map(({ label, days }) => {
                const active = rangeDays === days;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setRangeDays(days)}
                    className={cn(
                      "rounded-pill px-3.5 py-1.5 text-[13px] font-bold tabular-nums transition-all active:scale-95",
                      active ? "bg-accent text-accent-foreground" : "bg-subtle text-foreground"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2">
              <WeightChart data={chartData} />
            </div>
          </section>

          <div className="pt-5">
            <Button variant="accent" size="lg" className="w-full" onClick={() => setLogOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Log weight
            </Button>
          </div>

          <WeightEntryList
            entries={entries}
            onEdit={(entry) => {
              setEditEntry(entry);
              setLogOpen(true);
            }}
            onDelete={async (entry) => {
              if (!uid) return;
              await deleteWeight(uid, entry.date);
            }}
          />
        </>
      )}

      <LogWeightSheet
        open={logOpen}
        onOpenChange={(open) => {
          setLogOpen(open);
          if (!open) setEditEntry(null);
        }}
        defaultDate={editEntry?.date}
        defaultWeight={editEntry?.weightKg}
        onSave={async (date, weightKg) => {
          if (!uid) return;
          await upsertWeight(uid, date, weightKg);
        }}
      />
    </div>
  );
}
