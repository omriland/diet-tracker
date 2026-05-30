"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import type { Meal } from "@/types/meal";
import { cn } from "@/lib/utils";
import { formatMealTime } from "@/lib/dates/jerusalem";

interface MealEntryRowProps {
  meal: Meal;
  onEdit: () => void;
  onShowDetail: () => void;
}

export function MealEntryRow({ meal, onEdit, onShowDetail }: MealEntryRowProps) {
  const pending = meal.pending;
  const failed = !meal.pending && meal.calories === null;
  const time = formatMealTime(meal.createdAt);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5",
        pending && "opacity-70"
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center gap-3 text-start"
      >
        <span className="shrink-0 text-xs font-bold tabular-nums text-foreground">{time}</span>
        <span className="h-3.5 w-px shrink-0 bg-gray-400" aria-hidden />
        <span
          dir="auto"
          lang="he"
          className="min-w-0 flex-1 truncate text-base text-subtle-foreground"
        >
          {meal.text}
        </span>
      </button>
      <button
        type="button"
        onClick={onShowDetail}
        aria-label="Meal details"
        disabled={pending}
        className={cn(
          "flex w-[68px] shrink-0 items-center justify-end gap-1 text-sm font-bold tabular-nums text-foreground",
          (pending || failed) && "text-muted-foreground"
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : failed ? (
          <AlertCircle className="h-5 w-5 text-destructive" />
        ) : (
          <>
            {meal.calories}
            <span className="text-[11px] font-semibold text-muted-foreground">kcal</span>
          </>
        )}
      </button>
    </div>
  );
}
