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
import { QuickEditSheet } from "./quick-edit-sheet";
import { WeightTodayStrip } from "@/components/weight/weight-today-strip";
import { useAuth } from "@/components/providers/auth-provider";
import { useMealsForDate, useDayTotals } from "@/hooks/use-meals-for-date";
import { getTargetForDate, useUserProfile } from "@/hooks/use-user-profile";
import { useDayMeta } from "@/hooks/use-day-meta";
import { SportToggle } from "./sport-toggle";
import { DoneLoggingButton } from "./done-logging-button";
import { StreakCelebration } from "./streak-celebration";
import { useStreak } from "@/hooks/use-streak";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import {
  addDaysToDateString,
  getJerusalemDateString,
  subtractDaysFromDateString,
} from "@/lib/dates/jerusalem";
import {
  applyEstimateToMeal,
  createMealFromEstimate,
  createMealManual,
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
  const { meta } = useDayMeta(uid, date);
  const baseTarget = getTargetForDate(profile, date);
  const sportBonus = meta?.sport ? meta.sportBonusKcal || SPORT_BONUS_KCAL : 0;
  const target = baseTarget + sportBonus;
  const { consumed, remaining } = useDayTotals(meals, target);

  const { streak, todayDone } = useStreak(uid);
  const isToday = date === getJerusalemDateString();

  const [addSlot, setAddSlot] = useState<MealSlot | null>(null);
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

  async function runEstimateAfterEdit(mealId: string, text: string) {
    if (!uid) return;
    try {
      const { estimate, source } = await fetchMealEstimate(uid, text);
      await applyEstimateToMeal(uid, mealId, estimate, source);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not estimate calories";
      toast.error(msg, { description: "Tap the entry to enter calories manually." });
    }
  }

  async function handleConfirmAdd(params: {
    text: string;
    estimate: Awaited<ReturnType<typeof fetchMealEstimate>>["estimate"];
    source: "AI" | "AI_CACHED";
  }) {
    if (!uid || !addSlot) return;
    await createMealFromEstimate(uid, { date, slot: addSlot, ...params });
  }

  async function handleManualAdd(params: { text: string; calories: number }) {
    if (!uid || !addSlot) return;
    await createMealManual(uid, {
      date,
      slot: addSlot,
      text: params.text,
      calories: params.calories,
    });
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
          <CalorieHero consumed={consumed} target={target} remaining={remaining} />
          {uid && <WeightTodayStrip uid={uid} />}
          {uid && (
            <SportToggle
              uid={uid}
              date={date}
              active={Boolean(meta?.sport)}
              bonusKcal={meta?.sportBonusKcal ?? SPORT_BONUS_KCAL}
            />
          )}

          {MEAL_SLOTS.map(({ slot, label }) => (
            <MealSlotSection
              key={slot}
              slot={slot}
              label={label}
              meals={bySlot[slot]}
              onAdd={(s) => setAddSlot(s)}
              onSelectMeal={(meal) => setQuickEditMealId(meal.id)}
              onShowDetail={(meal) => setDetailMealId(meal.id)}
            />
          ))}

          {uid && isToday && (
            <DoneLoggingButton
              uid={uid}
              date={date}
              done={todayDone}
              onCelebrate={() => setCelebrating(true)}
            />
          )}

          {celebrating && (
            <StreakCelebration streak={streak} onClose={() => setCelebrating(false)} />
          )}
        </>
      )}

      <AddMealSheet
        open={addSlot !== null}
        slot={addSlot}
        uid={uid}
        onOpenChange={(open) => {
          if (!open) setAddSlot(null);
        }}
        onConfirm={handleConfirmAdd}
        onManualSave={handleManualAdd}
      />

      <QuickEditSheet
        open={quickEditMealId !== null}
        meal={quickEditMeal}
        onOpenChange={(open) => {
          if (!open) setQuickEditMealId(null);
        }}
        onSaveText={async (text) => {
          if (!uid || !quickEditMealId) return;
          await updateMealText(uid, quickEditMealId, text);
          void runEstimateAfterEdit(quickEditMealId, text);
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
          await runEstimateAfterEdit(detailMeal.id, detailMeal.text);
        }}
      />
    </div>
  );
}
