import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { mealsCol } from "@/lib/firestore/paths";
import { timestampToDate } from "@/lib/firestore/converters";
import type {
  BreakdownItem,
  CaloriesSource,
  Meal,
  MealSlot,
} from "@/types/meal";
import type { MealEstimate } from "@/lib/anthropic/schemas";
import { sumBreakdownCalories } from "@/lib/meals/breakdown";

export function mealFromDoc(id: string, data: DocumentData): Meal {
  return {
    id,
    date: data.date as string,
    slot: data.slot as MealSlot,
    text: data.text as string,
    calories: (data.calories as number | null) ?? null,
    caloriesSource: (data.caloriesSource as CaloriesSource | null) ?? null,
    confidence: data.confidence ?? null,
    searched: Boolean(data.searched),
    sources: (data.sources as string[]) ?? [],
    reasoningHe: (data.reasoningHe as string | null) ?? null,
    assumptionsHe: (data.assumptionsHe as string[]) ?? [],
    breakdown: (data.breakdown as BreakdownItem[]) ?? [],
    needsClarificationHe: (data.needsClarificationHe as string | null) ?? null,
    foodCategory: data.foodCategory ?? null,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    pending: Boolean(data.pending),
  };
}

export async function createMealPending(
  uid: string,
  params: { date: string; slot: MealSlot; text: string }
): Promise<string> {
  const ref = await addDoc(collection(getClientDb(), mealsCol(uid)), {
    date: params.date,
    slot: params.slot,
    text: params.text,
    calories: null,
    caloriesSource: null,
    confidence: null,
    searched: false,
    sources: [],
    reasoningHe: null,
    assumptionsHe: [],
    breakdown: [],
    needsClarificationHe: null,
    foodCategory: null,
    pending: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Single-write create with a full estimate already in hand.
 * Use when the user previews the AI result before committing — no `pending`
 * flicker, no two-phase write.
 */
export async function createMealFromEstimate(
  uid: string,
  params: {
    date: string;
    slot: MealSlot;
    text: string;
    estimate: MealEstimate;
    source: CaloriesSource;
  }
): Promise<string> {
  const { date, slot, text, estimate, source } = params;
  const ref = await addDoc(collection(getClientDb(), mealsCol(uid)), {
    date,
    slot,
    text,
    calories: estimate.calories,
    caloriesSource: source,
    confidence: estimate.confidence,
    searched: estimate.searched,
    sources: estimate.sources,
    reasoningHe: estimate.reasoningHe,
    assumptionsHe: estimate.assumptionsHe,
    breakdown: estimate.breakdown,
    needsClarificationHe: estimate.needsClarificationHe,
    foodCategory: estimate.foodCategory,
    pending: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Manual-entry fallback for when AI estimation fails outright. Stored without
 * any AI metadata (no breakdown, no reasoning) so it's clearly user-entered.
 */
export async function createMealManual(
  uid: string,
  params: { date: string; slot: MealSlot; text: string; calories: number }
): Promise<string> {
  const ref = await addDoc(collection(getClientDb(), mealsCol(uid)), {
    date: params.date,
    slot: params.slot,
    text: params.text,
    calories: params.calories,
    caloriesSource: "MANUAL",
    confidence: null,
    searched: false,
    sources: [],
    reasoningHe: null,
    assumptionsHe: [],
    breakdown: [],
    needsClarificationHe: null,
    foodCategory: null,
    pending: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function applyEstimateToMeal(
  uid: string,
  mealId: string,
  estimate: MealEstimate,
  caloriesSource: CaloriesSource
): Promise<void> {
  await updateDoc(doc(getClientDb(), mealsCol(uid), mealId), {
    calories: estimate.calories,
    caloriesSource,
    confidence: estimate.confidence,
    searched: estimate.searched,
    sources: estimate.sources,
    reasoningHe: estimate.reasoningHe,
    assumptionsHe: estimate.assumptionsHe,
    breakdown: estimate.breakdown,
    needsClarificationHe: estimate.needsClarificationHe,
    foodCategory: estimate.foodCategory,
    pending: false,
    updatedAt: serverTimestamp(),
  });
}

export async function updateMealFailedEstimate(
  uid: string,
  mealId: string
): Promise<void> {
  await updateDoc(doc(getClientDb(), mealsCol(uid), mealId), {
    pending: false,
    updatedAt: serverTimestamp(),
  });
}

export async function updateMealManualCalories(
  uid: string,
  mealId: string,
  calories: number
): Promise<void> {
  await updateDoc(doc(getClientDb(), mealsCol(uid), mealId), {
    calories,
    caloriesSource: "MANUAL",
    pending: false,
    updatedAt: serverTimestamp(),
  });
}

export async function updateMealSlot(
  uid: string,
  mealId: string,
  slot: MealSlot
): Promise<void> {
  await updateDoc(doc(getClientDb(), mealsCol(uid), mealId), {
    slot,
    updatedAt: serverTimestamp(),
  });
}

export async function updateMealText(
  uid: string,
  mealId: string,
  text: string
): Promise<void> {
  await updateDoc(doc(getClientDb(), mealsCol(uid), mealId), {
    text,
    calories: null,
    caloriesSource: null,
    confidence: null,
    searched: false,
    sources: [],
    reasoningHe: null,
    assumptionsHe: [],
    breakdown: [],
    needsClarificationHe: null,
    foodCategory: null,
    pending: true,
    updatedAt: serverTimestamp(),
  });
}

export async function updateMealBreakdown(
  uid: string,
  mealId: string,
  breakdown: BreakdownItem[]
): Promise<void> {
  const calories = sumBreakdownCalories(breakdown);
  await updateDoc(doc(getClientDb(), mealsCol(uid), mealId), {
    breakdown,
    calories,
    caloriesSource: "MANUAL_BREAKDOWN_EDIT",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMeal(uid: string, mealId: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), mealsCol(uid), mealId));
}
