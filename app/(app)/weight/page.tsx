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
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
  { label: "All", days: null as number | null },
] as const;

export default function WeightPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const { entries, loading } = useWeights(uid);
  const today = getJerusalemDateString();

  const [rangeDays, setRangeDays] = useState<number | null>(90);
  const [logOpen, setLogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<WeightEntry | null>(null);

  const chartData = useMemo(
    () => filterWeightsByRange(entries, rangeDays),
    [entries, rangeDays]
  );

  const latest = entries.find((e) => e.date <= today);
  const delta7 = latest ? getWeightDelta(entries, 7, today) : null;
  const delta30 = latest ? getWeightDelta(entries, 30, today) : null;

  return (
    <div className="editorial-in">
      <header className="pt-6 pb-2">
        <p className="text-muted-foreground text-[11px] tracking-[0.22em] uppercase">
          Weight
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="pulse-dot text-muted-foreground text-xl">·</span>
        </div>
      ) : (
        <>
          <section className="pb-6">
            <div className="flex items-baseline gap-3">
              {latest ? (
                <>
                  <span
                    className="text-5xl leading-none tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {latest.weightKg.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-sm">kg</span>
                </>
              ) : (
                <span
                  className="text-muted-foreground text-4xl italic"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  No weight logged yet
                </span>
              )}
            </div>
            <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs">
              {delta7 != null && (
                <DeltaChip value={delta7} label="7 days" />
              )}
              {delta30 != null && (
                <DeltaChip value={delta30} label="30 days" />
              )}
            </div>
          </section>

          <div className="text-muted-foreground border-hairline flex items-center gap-5 border-y py-3 text-[11px] tracking-[0.18em] uppercase">
            {RANGES.map(({ label, days }) => (
              <button
                key={label}
                type="button"
                onClick={() => setRangeDays(days)}
                className={cn(
                  "relative transition-colors",
                  rangeDays === days
                    ? "text-foreground"
                    : "hover:text-foreground"
                )}
              >
                {label}
                {rangeDays === days && (
                  <span
                    aria-hidden
                    className="bg-accent absolute -bottom-3 left-0 right-0 h-px"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="pt-6">
            <WeightChart data={chartData} />
          </div>

          <div className="pt-6">
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => setLogOpen(true)}
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
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

function DeltaChip({ value, label }: { value: number; label: string }) {
  if (value === 0) {
    return (
      <span className="text-muted-foreground tabular-nums">
        ◇ 0.0 · {label}
      </span>
    );
  }
  const dropping = value < 0;
  return (
    <span
      className={cn(
        "tabular-nums",
        dropping ? "text-success" : "text-foreground/80"
      )}
    >
      {dropping ? "▼" : "▲"} {Math.abs(value).toFixed(1)} · {label}
    </span>
  );
}
