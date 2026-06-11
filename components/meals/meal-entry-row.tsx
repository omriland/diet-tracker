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
        "glass flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all active:scale-[0.99]",
        pending && "opacity-70"
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center gap-3 text-start"
      >
        <span className="font-display shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
          {time}
        </span>
        <span className="h-4 w-px shrink-0 bg-white/10" aria-hidden />
        <span
          dir="auto"
          lang="he"
          className="min-w-0 flex-1 truncate text-[15px] text-subtle-foreground"
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
          "font-display flex w-[72px] shrink-0 items-baseline justify-end gap-1 text-[15px] font-bold tabular-nums text-accent",
          (pending || failed) && "text-muted-foreground"
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin self-center" />
        ) : failed ? (
          <AlertCircle className="h-5 w-5 self-center text-destructive" />
        ) : (
          <>
            {meal.calories}
            <span className="text-[10px] font-semibold text-muted-foreground">kcal</span>
          </>
        )}
      </button>
    </div>
  );
}
