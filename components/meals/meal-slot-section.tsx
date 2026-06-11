"use client";

import { Croissant, Salad, UtensilsCrossed, Cookie, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { MealEntryRow } from "./meal-entry-row";
import { DraggableMeal } from "./draggable-meal";
import { cn } from "@/lib/utils";
import type { Meal, MealSlot } from "@/types/meal";

const SLOT_ICON: Record<MealSlot, LucideIcon> = {
  BREAKFAST: Croissant,
  LUNCH: Salad,
  DINNER: UtensilsCrossed,
  SNACK: Cookie,
};

interface MealSlotSectionProps {
  label: string;
  slot: MealSlot;
  meals: Meal[];
  onSelectMeal: (meal: Meal) => void;
  onShowDetail: (meal: Meal) => void;
  onAddMeal: (slot: MealSlot) => void;
}

export function MealSlotSection({
  label,
  slot,
  meals,
  onSelectMeal,
  onShowDetail,
  onAddMeal,
}: MealSlotSectionProps) {
  const Icon = SLOT_ICON[slot];
  const { setNodeRef, isOver } = useDroppable({ id: slot });
  const subtotal = meals.reduce((sum, m) => sum + (m.calories ?? 0), 0);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "rounded-xl py-4 transition-colors",
        isOver && "bg-green-light/40"
      )}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="flex items-center gap-2 text-[17px] font-bold text-foreground">
          <Icon className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={2} aria-hidden />
          {label}
        </h2>
        {subtotal > 0 && (
          <span className="text-[13px] font-bold tabular-nums text-muted-foreground">
            {subtotal.toLocaleString()}
            <span className="ml-0.5 text-[11px] font-semibold opacity-70">kcal</span>
          </span>
        )}
      </div>

      <div className="mt-3">
        {meals.length === 0 ? (
          <button
            type="button"
            onClick={() => onAddMeal(slot)}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-subtle/40 active:scale-[0.99] active:bg-subtle/60"
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
            Add {label.toLowerCase()}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {meals.map((meal) => (
              <DraggableMeal key={meal.id} id={meal.id}>
                <MealEntryRow
                  meal={meal}
                  onEdit={() => onSelectMeal(meal)}
                  onShowDetail={() => onShowDetail(meal)}
                />
              </DraggableMeal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
