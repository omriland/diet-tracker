"use client";

import { Plus } from "lucide-react";
import { MealEntryRow } from "./meal-entry-row";
import type { Meal, MealSlot } from "@/types/meal";

const SLOT_EMOJI: Record<MealSlot, string> = {
  BREAKFAST: "🥐",
  LUNCH: "🥗",
  DINNER: "🍽️",
  SNACK: "🍫",
};

interface MealSlotSectionProps {
  label: string;
  slot: MealSlot;
  meals: Meal[];
  onAdd: (slot: MealSlot) => void;
  onSelectMeal: (meal: Meal) => void;
  onShowDetail: (meal: Meal) => void;
}

export function MealSlotSection({
  label,
  slot,
  meals,
  onAdd,
  onSelectMeal,
  onShowDetail,
}: MealSlotSectionProps) {
  const isEmpty = meals.length === 0;

  return (
    <section className="border-b border-hairline py-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[17px] font-bold text-foreground">
          <span aria-hidden>{SLOT_EMOJI[slot]}</span>
          {label}
        </h2>
        <button
          type="button"
          onClick={() => onAdd(slot)}
          aria-label={`Add to ${label}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="mt-3">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground">No meals logged</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {meals.map((meal) => (
              <MealEntryRow
                key={meal.id}
                meal={meal}
                onEdit={() => onSelectMeal(meal)}
                onShowDetail={() => onShowDetail(meal)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
