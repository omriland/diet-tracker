"use client";

import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { MealEntryRow } from "./meal-entry-row";
import { DraggableMeal } from "./draggable-meal";
import { SLOT_ICON, SLOT_TINT } from "@/lib/meals/slot-style";
import { cn } from "@/lib/utils";
import type { Meal, MealSlot } from "@/types/meal";

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
  const tint = SLOT_TINT[slot];
  const { setNodeRef, isOver } = useDroppable({ id: slot });
  const subtotal = meals.reduce((sum, m) => sum + (m.calories ?? 0), 0);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "rounded-2xl py-3.5 transition-all",
        isOver && "bg-accent-soft ring-1 ring-accent/40"
      )}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2.5 text-[15px] font-bold text-foreground">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint.bg, color: tint.text }}
          >
            <Icon className="h-[16px] w-[16px]" strokeWidth={2.2} aria-hidden />
          </span>
          {label}
        </h2>
        {subtotal > 0 && (
          <span className="font-display text-[14px] font-bold tabular-nums text-muted-foreground">
            {subtotal.toLocaleString()}
            <span className="ml-1 text-[11px] font-semibold opacity-60">kcal</span>
          </span>
        )}
      </div>

      <div className="mt-2.5">
        {meals.length === 0 ? (
          <button
            type="button"
            onClick={() => onAddMeal(slot)}
            className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-accent/30 hover:text-foreground active:scale-[0.99]"
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
