"use client";

import { useEffect, useMemo, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { getClientDb } from "@/lib/firebase/client";
import { mealsCol } from "@/lib/firestore/paths";
import { mealFromDoc } from "@/lib/firestore/meals";
import { SLOT_ORDER, type Meal, type MealSlot } from "@/types/meal";

export function useMealsForDate(uid: string | undefined, date: string) {
  // null means "not yet loaded"; [] means "loaded, no meals"
  const [mealsData, setMealsData] = useState<Meal[] | null>(null);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(getClientDb(), mealsCol(uid)),
      where("date", "==", date),
      orderBy("slot", "asc")
    );

    return onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => mealFromDoc(d.id, d.data()));
        next.sort((a, b) => {
          const slotDiff = SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot];
          if (slotDiff !== 0) return slotDiff;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
        setMealsData(next);
      },
      (error) => {
        console.error("Meals snapshot error", error);
        if (
          error instanceof FirebaseError &&
          error.code === "failed-precondition"
        ) {
          toast.error("Firestore index required", {
            description:
              "Create the meals (date + slot) composite index — check the browser console for the link.",
            duration: 10000,
          });
        } else if (
          error instanceof FirebaseError &&
          error.code === "permission-denied"
        ) {
          toast.error("Firestore permission denied", {
            description: "Deploy firestore.rules and ensure you are signed in.",
          });
        }
        setMealsData([]);
      }
    );
  }, [uid, date]);

  // Derived — no setState needed in the !uid case
  const meals = useMemo<Meal[]>(
    () => (uid ? (mealsData ?? []) : []),
    [uid, mealsData]
  );
  const loading = uid ? mealsData === null : false;

  const bySlot = useMemo(() => {
    const map: Record<MealSlot, Meal[]> = {
      BREAKFAST: [],
      LUNCH: [],
      DINNER: [],
      SNACK: [],
    };
    for (const meal of meals) {
      map[meal.slot].push(meal);
    }
    return map;
  }, [meals]);

  return { meals, bySlot, loading };
}

export function useDayTotals(meals: Meal[], target: number) {
  return useMemo(() => {
    const consumed = meals.reduce((sum, m) => sum + (m.calories ?? 0), 0);
    const remaining = Math.max(0, target - consumed);
    const progress = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
    return { consumed, remaining, progress };
  }, [meals, target]);
}
