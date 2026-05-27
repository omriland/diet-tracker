"use client";

import { Plus } from "lucide-react";
import { MealEntryRow } from "./meal-entry-row";
import type { Meal, MealSlot } from "@/types/meal";

interface MealSlotSectionProps {
  label: string;
  slot: MealSlot;
  meals: Meal[];
  onAdd: (slot: MealSlot) => void;
  onSelectMeal: (meal: Meal) => void;
}

export function MealSlotSection({
  label,
  slot,
  meals,
  onAdd,
  onSelectMeal,
}: MealSlotSectionProps) {
  const isEmpty = meals.length === 0;

  return (
    <section className="border-hairline border-t py-5">
      <div className="flex items-center justify-between">
        <h2
          className="font-display text-xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {label}
        </h2>
        <button
          type="button"
          onClick={() => onAdd(slot)}
          aria-label={`Add to ${label}`}
          className="text-muted-foreground hover:text-foreground hover:bg-subtle/40 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-2">
        {isEmpty ? (
          <button
            type="button"
            onClick={() => onAdd(slot)}
            className="text-muted-foreground hover:text-foreground -mx-2 block w-full rounded-md px-2 py-2 text-start text-sm italic transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            —
          </button>
        ) : (
          <div className="divide-hairline -my-0.5 divide-y">
            {meals.map((meal) => (
              <MealEntryRow
                key={meal.id}
                meal={meal}
                onPress={() => onSelectMeal(meal)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
