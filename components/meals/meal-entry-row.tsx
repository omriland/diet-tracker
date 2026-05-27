"use client";

import type { Meal } from "@/types/meal";
import { cn } from "@/lib/utils";

interface MealEntryRowProps {
  meal: Meal;
  onPress: () => void;
}

function isSuspicious(calories: number | null): boolean {
  if (calories === null) return false;
  return calories < 10 || calories > 3000;
}

export function MealEntryRow({ meal, onPress }: MealEntryRowProps) {
  const pending = meal.pending || meal.calories === null;
  const suspicious = isSuspicious(meal.calories);
  const lowConfidence = meal.confidence === "low";

  return (
    <button
      type="button"
      onClick={onPress}
      className="hover:bg-subtle/40 group flex w-full items-start justify-between gap-3 rounded-md px-2 py-2.5 -mx-2 text-start transition-colors"
    >
      <span className="min-w-0 flex-1">
        <span
          dir="auto"
          lang="he"
          className="block text-[15px] leading-snug"
        >
          {meal.text}
        </span>
        {(lowConfidence || meal.searched || suspicious) && !pending && (
          <span className="text-muted-foreground mt-1 flex items-center gap-2 text-[10px] tracking-[0.16em] uppercase">
            {meal.searched && <span>· web</span>}
            {lowConfidence && <span className="text-warning">· low conf</span>}
            {suspicious && <span className="text-warning">· verify</span>}
          </span>
        )}
      </span>

      <span
        className={cn(
          "shrink-0 self-start pt-0.5 text-end tabular-nums",
          pending && "text-muted-foreground"
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {pending ? (
          <span className="pulse-dot inline-block">·</span>
        ) : (
          <span className="text-sm">{meal.calories}</span>
        )}
      </span>
    </button>
  );
}
