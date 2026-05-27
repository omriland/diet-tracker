"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import type { WeightEntry } from "@/types/weight";
import { formatMonthDay, formatWeekday } from "@/lib/dates/jerusalem";
import { cn } from "@/lib/utils";

interface WeightEntryListProps {
  entries: WeightEntry[];
  onEdit: (entry: WeightEntry) => void;
  onDelete: (entry: WeightEntry) => void;
}

function WeightRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: WeightEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const handlers = useSwipeable({
    onSwipedLeft: () => setRevealed(true),
    onSwipedRight: () => setRevealed(false),
    trackMouse: false,
    delta: 30,
  });

  return (
    <div {...handlers} className="border-hairline relative overflow-hidden border-b">
      <div
        className={cn(
          "bg-background flex items-center justify-between py-3 transition-transform duration-200 ease-out",
          revealed && "-translate-x-24"
        )}
      >
        <button
          type="button"
          className="flex flex-1 items-center justify-between text-start"
          onClick={onEdit}
        >
          <span className="flex flex-col">
            <span className="text-[15px]">{formatMonthDay(entry.date)}</span>
            <span className="text-muted-foreground text-xs">
              {formatWeekday(entry.date)}
            </span>
          </span>
          <span
            className="text-foreground tabular-nums text-[15px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {entry.weightKg.toFixed(1)} kg
          </span>
        </button>
      </div>
      {revealed && (
        <div className="absolute inset-y-0 end-0 flex items-center">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            className="text-muted-foreground hover:text-foreground inline-flex h-full w-12 items-center justify-center"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="text-destructive hover:bg-destructive/10 inline-flex h-full w-12 items-center justify-center"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}

export function WeightEntryList({
  entries,
  onEdit,
  onDelete,
}: WeightEntryListProps) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-muted-foreground mb-2 text-[11px] tracking-[0.18em] uppercase">
        Recent
      </h2>
      <div>
        {entries.slice(0, 30).map((entry) => (
          <WeightRow
            key={entry.id}
            entry={entry}
            onEdit={() => onEdit(entry)}
            onDelete={() => onDelete(entry)}
          />
        ))}
      </div>
    </section>
  );
}
