"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";
import { DayHeader } from "@/components/layout/day-header";
import { CalorieHero } from "./calorie-progress";
import { MealSlotSection } from "./meal-slot-section";
import { AddMealSheet } from "./add-meal-sheet";
import { MealDetailSheet } from "./meal-detail-sheet";
import { WeightTodayCard } from "@/components/weight/weight-today-card";
import { useAuth } from "@/components/providers/auth-provider";
import { useMealsForDate, useDayTotals } from "@/hooks/use-meals-for-date";
import { useUserProfile } from "@/hooks/use-user-profile";
import {
  addDaysToDateString,
  subtractDaysFromDateString,
} from "@/lib/dates/jerusalem";
import {
  applyEstimateToMeal,
  createMealPending,
  deleteMeal,
  updateMealBreakdown,
  updateMealManualCalories,
  updateMealText,
} from "@/lib/firestore/meals";
import { fetchMealEstimate } from "@/lib/estimation/fetch-estimate";
import { MEAL_SLOTS, type MealSlot } from "@/types/meal";

interface DayViewProps {
  date: string;
}

export function DayView({ date }: DayViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const uid = user?.uid;
  const { profile } = useUserProfile(uid);
  const { bySlot, meals, loading } = useMealsForDate(uid, date);
  const target = profile?.dailyCalorieTarget ?? 2000;
  const { consumed, remaining } = useDayTotals(meals, target);

  const [addSlot, setAddSlot] = useState<MealSlot | null>(null);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Live-derive selected meal from snapshot so the sheet stays in sync
  const selectedMeal = useMemo(
    () =>
      selectedMealId ? meals.find((m) => m.id === selectedMealId) ?? null : null,
    [selectedMealId, meals]
  );

  const goToDate = useCallback(
    (next: string) => {
      router.push(`/day/${next}`);
    },
    [router]
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => goToDate(addDaysToDateString(date, 1)),
    onSwipedRight: () => goToDate(subtractDaysFromDateString(date, 1)),
    trackMouse: false,
    delta: 40,
  });

  async function runEstimate(mealId: string, text: string) {
    if (!uid) return;
    try {
      const { estimate, source } = await fetchMealEstimate(uid, text);
      await applyEstimateToMeal(uid, mealId, estimate, source);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not estimate calories";
      toast.error(msg, {
        description: "Tap the entry to enter calories manually.",
      });
    }
  }

  async function handleAddMeal(text: string) {
    if (!uid || !addSlot) return;
    const mealId = await createMealPending(uid, { date, slot: addSlot, text });
    void runEstimate(mealId, text);
  }

  async function handleEditText(text: string) {
    if (!uid || !selectedMealId) return;
    await updateMealText(uid, selectedMealId, text);
    void runEstimate(selectedMealId, text);
  }

  return (
    <div {...handlers} className="editorial-in">
      <DayHeader
        date={date}
        onPrev={() => goToDate(subtractDaysFromDateString(date, 1))}
        onNext={() => goToDate(addDaysToDateString(date, 1))}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="pulse-dot text-muted-foreground text-xl">·</span>
        </div>
      ) : (
        <>
          <CalorieHero
            consumed={consumed}
            target={target}
            remaining={remaining}
          />
          {uid && <WeightTodayCard uid={uid} />}
          {MEAL_SLOTS.map(({ slot, label }) => (
            <MealSlotSection
              key={slot}
              slot={slot}
              label={label}
              meals={bySlot[slot]}
              onAdd={(s) => setAddSlot(s)}
              onSelectMeal={(meal) => {
                setSelectedMealId(meal.id);
                setDetailOpen(true);
              }}
            />
          ))}
        </>
      )}

      <AddMealSheet
        open={addSlot !== null}
        slot={addSlot}
        onOpenChange={(open) => {
          if (!open) setAddSlot(null);
        }}
        onSubmit={handleAddMeal}
      />

      <MealDetailSheet
        open={detailOpen}
        meal={selectedMeal}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedMealId(null);
        }}
        onDelete={async () => {
          if (!uid || !selectedMealId) return;
          await deleteMeal(uid, selectedMealId);
          setDetailOpen(false);
          setSelectedMealId(null);
        }}
        onEditText={handleEditText}
        onManualCalories={async (calories) => {
          if (!uid || !selectedMealId) return;
          await updateMealManualCalories(uid, selectedMealId, calories);
        }}
        onUpdateBreakdown={async (breakdown) => {
          if (!uid || !selectedMealId) return;
          await updateMealBreakdown(uid, selectedMealId, breakdown);
        }}
        onRetryEstimate={async () => {
          if (!selectedMeal) return;
          await runEstimate(selectedMeal.id, selectedMeal.text);
        }}
      />
    </div>
  );
}
