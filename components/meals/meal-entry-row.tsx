"use client";

import { Info } from "lucide-react";
import type { Meal } from "@/types/meal";
import { cn } from "@/lib/utils";

interface MealEntryRowProps {
  meal: Meal;
  onEdit: () => void;
  onShowDetail: () => void;
}

export function MealEntryRow({ meal, onEdit, onShowDetail }: MealEntryRowProps) {
  const pending = meal.pending || meal.calories === null;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-start"
      >
        <span
          dir="auto"
          lang="he"
          className="min-w-0 flex-1 truncate text-[15px] leading-snug text-foreground"
        >
          {meal.text}
        </span>
        <span
          className={cn(
            "shrink-0 text-[17px] font-bold tabular-nums text-foreground",
            pending && "text-muted-foreground"
          )}
        >
          {pending ? <span className="pulse-dot">·</span> : meal.calories}
        </span>
      </button>
      <button
        type="button"
        onClick={onShowDetail}
        aria-label="Meal details"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-accent transition-opacity hover:opacity-70"
      >
        <Info className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
