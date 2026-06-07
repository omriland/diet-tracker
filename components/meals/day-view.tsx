"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { DayHeader } from "@/components/layout/day-header";
import { AddMealFab } from "@/components/layout/add-meal-fab";
import { CalorieHero } from "./calorie-progress";
import { MealSlotSection } from "./meal-slot-section";
import { AddMealSheet } from "./add-meal-sheet";
import { MealDetailSheet } from "./meal-detail-sheet";
import { QuickEditSheet } from "./quick-edit-sheet";
import { WeightTodayStrip } from "@/components/weight/weight-today-strip";
import { WaterStrip } from "./water-strip";
import { useAuth } from "@/components/providers/auth-provider";
import { useMealsForDate, useDayTotals } from "@/hooks/use-meals-for-date";
import { getTargetForDate, useUserProfile } from "@/hooks/use-user-profile";
import { useDayMeta } from "@/hooks/use-day-meta";
import { SportToggle } from "./sport-toggle";
import { DoneLoggingButton } from "./done-logging-button";
import { StreakCelebration } from "./streak-celebration";
import { useStreak } from "@/hooks/use-streak";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import { DEFAULT_SPORT_BONUS, DEFAULT_WATER_TARGET_ML } from "@/types/user";
import {
  addDaysToDateString,
  subtractDaysFromDateString,
} from "@/lib/dates/jerusalem";
import {
  applyEstimateToMeal,
  createMealFromEstimate,
  createMealPending,
  deleteMeal,
  updateMealBreakdown,
  updateMealManualCalories,
  updateMealText,
  updateMealFailedEstimate,
  updateMealSlot,
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
  const { meta } = useDayMeta(uid, date);
  const baseTarget = getTargetForDate(profile, date);
  const sportBonus = meta?.sport ? meta.sportBonusKcal || SPORT_BONUS_KCAL : 0;
  const target = baseTarget + sportBonus;
  const { consumed, remaining } = useDayTotals(meals, target);

  const { streak } = useStreak(uid);

  const [addOpen, setAddOpen] = useState(false);
  const [quickEditMealId, setQuickEditMealId] = useState<string | null>(null);
  const [detailMealId, setDetailMealId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const quickEditMeal = useMemo(
    () => (quickEditMealId ? meals.find((m) => m.id === quickEditMealId) ?? null : null),
    [quickEditMealId, meals]
  );
  const detailMeal = useMemo(
    () => (detailMealId ? meals.find((m) => m.id === detailMealId) ?? null : null),
    [detailMealId, meals]
  );

  const goToDate = useCallback(
    (next: string) => router.push(`/day/${next}`),
    [router]
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => goToDate(addDaysToDateString(date, 1)),
    onSwipedRight: () => goToDate(subtractDaysFromDateString(date, 1)),
    trackMouse: false,
    delta: 40,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  );

  async function handleDragEnd(e: DragEndEvent) {
    const mealId = String(e.active.id);
    const overSlot = e.over?.id as MealSlot | undefined;
    if (!uid || !overSlot) return;
    const meal = meals.find((m) => m.id === mealId);
    if (!meal || meal.slot === overSlot) return;
    const label = MEAL_SLOTS.find((s) => s.slot === overSlot)?.label ?? overSlot;
    try {
      await updateMealSlot(uid, mealId, overSlot);
      toast.success(`Moved to ${label}`);
    } catch {
      toast.error("Could not move meal");
    }
  }

  async function runEstimateAfterEdit(
    mealId: string,
    text: string,
    slot: MealSlot
  ) {
    if (!uid) return;
    try {
      const { estimates, source } = await fetchMealEstimate(uid, text);
      const [first, ...rest] = estimates;
      if (rest.length === 0) {
        // Single item: keep the user's original wording on the existing row.
        await applyEstimateToMeal(uid, mealId, first, source);
        return;
      }
      // The AI split the input into multiple foods. Re-label the existing row to
      // the first item and create independent rows for the rest in the same slot.
      await applyEstimateToMeal(uid, mealId, first, source, { text: first.textHe });
      await Promise.all(
        rest.map((estimate) =>
          createMealFromEstimate(uid, {
            date,
            slot,
            text: estimate.textHe,
            estimate,
            source,
          })
        )
      );
      toast.success(`Split into ${estimates.length} entries`);
    } catch (err) {
      await updateMealFailedEstimate(uid, mealId);
      const msg = err instanceof Error ? err.message : "Could not estimate calories";
      toast.error(msg, { description: "Tap the entry to enter calories manually." });
    }
  }

  async function handleConfirmAdd(text: string, slot: MealSlot) {
    if (!uid) return;
    const mealId = await createMealPending(uid, { date, slot, text });
    void runEstimateAfterEdit(mealId, text, slot);
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
          <span className="pulse-dot text-xl text-muted-foreground">·</span>
        </div>
      ) : (
        <>
          <CalorieHero
            consumed={consumed}
            target={target}
            remaining={remaining}
            action={
              uid && (
                <SportToggle
                  uid={uid}
                  date={date}
                  active={Boolean(meta?.sport)}
                  bonusKcal={meta?.sportBonusKcal ?? SPORT_BONUS_KCAL}
                  defaultBonus={profile?.defaultSportBonus ?? DEFAULT_SPORT_BONUS}
                />
              )
            }
          />
          {uid && <WeightTodayStrip uid={uid} />}
          {uid && (
            <WaterStrip
              uid={uid}
              date={date}
              waterMl={meta?.waterMl ?? 0}
              targetMl={profile?.waterTargetMl ?? DEFAULT_WATER_TARGET_ML}
            />
          )}

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {MEAL_SLOTS.map(({ slot, label }) => (
              <MealSlotSection
                key={slot}
                slot={slot}
                label={label}
                meals={bySlot[slot]}
                onSelectMeal={(meal) => setQuickEditMealId(meal.id)}
                onShowDetail={(meal) => setDetailMealId(meal.id)}
              />
            ))}
          </DndContext>

          {uid && (
            <DoneLoggingButton
              uid={uid}
              date={date}
              done={meta?.doneLogging ?? false}
              onCelebrate={() => setCelebrating(true)}
            />
          )}

          {celebrating && (
            <StreakCelebration streak={streak} onClose={() => setCelebrating(false)} />
          )}

          <AddMealFab onClick={() => setAddOpen(true)} />
        </>
      )}

      <AddMealSheet
        open={addOpen}
        defaultSlot={null}
        uid={uid}
        onOpenChange={setAddOpen}
        onConfirm={handleConfirmAdd}
      />

      <QuickEditSheet
        open={quickEditMealId !== null}
        meal={quickEditMeal}
        onOpenChange={(open) => {
          if (!open) setQuickEditMealId(null);
        }}
        onSaveText={async (text) => {
          if (!uid || !quickEditMealId || !quickEditMeal) return;
          await updateMealText(uid, quickEditMealId, text);
          void runEstimateAfterEdit(quickEditMealId, text, quickEditMeal.slot);
        }}
        onSaveCalories={async (calories) => {
          if (!uid || !quickEditMealId) return;
          await updateMealManualCalories(uid, quickEditMealId, calories);
        }}
      />

      <MealDetailSheet
        open={detailMealId !== null}
        meal={detailMeal}
        onOpenChange={(open) => {
          if (!open) setDetailMealId(null);
        }}
        onDelete={async () => {
          if (!uid || !detailMealId) return;
          await deleteMeal(uid, detailMealId);
          setDetailMealId(null);
        }}
        onUpdateBreakdown={async (breakdown) => {
          if (!uid || !detailMealId) return;
          await updateMealBreakdown(uid, detailMealId, breakdown);
        }}
        onRetryEstimate={async () => {
          if (!detailMeal) return;
          await runEstimateAfterEdit(detailMeal.id, detailMeal.text, detailMeal.slot);
        }}
      />
    </div>
  );
}
