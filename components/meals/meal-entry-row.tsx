"use client";

import { Info, AlertCircle, Loader2 } from "lucide-react";
import type { Meal } from "@/types/meal";
import { cn } from "@/lib/utils";

interface MealEntryRowProps {
  meal: Meal;
  onEdit: () => void;
  onShowDetail: () => void;
}

export function MealEntryRow({ meal, onEdit, onShowDetail }: MealEntryRowProps) {
  const pending = meal.pending;
  const failed = !meal.pending && meal.calories === null;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onEdit}
        className={cn(
          "flex min-w-0 flex-1 items-center justify-between gap-3 text-start",
          pending && "opacity-70"
        )}
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
            "shrink-0 text-[17px] font-bold tabular-nums text-foreground flex items-center min-h-[24px]",
            (pending || failed) && "text-muted-foreground"
          )}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : failed ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            meal.calories
          )}
        </span>
      </button>
      <button
        type="button"
        onClick={onShowDetail}
        aria-label="Meal details"
        className={cn(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center text-accent transition-opacity hover:opacity-70",
          pending && "opacity-30"
        )}
      >
        <Info className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
