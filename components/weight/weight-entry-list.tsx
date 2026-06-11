"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { WeightEntry } from "@/types/weight";
import { formatMonthDay, formatYear } from "@/lib/dates/jerusalem";

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
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
      <span className="flex-1 text-[14px] text-muted-foreground">
        {formatMonthDay(entry.date)}, {formatYear(entry.date)}
      </span>
      <span className="font-display text-[15px] font-bold tabular-nums text-foreground">
        {entry.weightKg.toFixed(1)} kg
      </span>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit weight"
        className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete weight"
        className="inline-flex h-7 w-7 items-center justify-center text-destructive transition-opacity hover:opacity-70"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function WeightEntryList({ entries, onEdit, onDelete }: WeightEntryListProps) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[15px] font-bold text-foreground">Recent entries</h2>
      <div className="flex flex-col gap-2">
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
