import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { estimationCacheDoc } from "@/lib/firestore/paths";
import { timestampToDate } from "@/lib/firestore/converters";
import type { MealEstimate } from "@/lib/anthropic/schemas";
import { normalizeMealText } from "./normalize";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface CachedEstimate {
  meals: MealEstimate[];
  hitCount: number;
  lastUsedAt: Date;
}

function legacyFlatToMeal(data: Record<string, unknown>): MealEstimate | null {
  if (typeof data.calories !== "number") return null;
  // Pre-split cache docs stored a single flat estimate (no textHe / meals).
  // textHe is only used when an input splits into multiple meals, so an empty
  // string is safe for these single-meal legacy entries.
  return {
    textHe: (data.textNormalized as string) ?? "",
    calories: data.calories as number,
    confidence: data.confidence as MealEstimate["confidence"],
    searched: Boolean(data.searched),
    sources: (data.sources as string[]) ?? [],
    reasoningHe: (data.reasoningHe as string) ?? "",
    assumptionsHe: (data.assumptionsHe as string[]) ?? [],
    breakdown: (data.breakdown as MealEstimate["breakdown"]) ?? [],
    needsClarificationHe: (data.needsClarificationHe as string | null) ?? null,
    foodCategory: data.foodCategory as MealEstimate["foodCategory"],
  };
}

function docToCached(data: Record<string, unknown>): CachedEstimate | null {
  const lastUsedAt = timestampToDate(data.lastUsedAt as Timestamp | undefined);
  if (Date.now() - lastUsedAt.getTime() > CACHE_TTL_MS) return null;

  let meals: MealEstimate[];
  if (Array.isArray(data.meals)) {
    meals = data.meals as MealEstimate[];
  } else {
    const legacy = legacyFlatToMeal(data);
    if (!legacy) return null;
    meals = [legacy];
  }
  if (meals.length === 0) return null;

  return {
    meals,
    hitCount: (data.hitCount as number) ?? 0,
    lastUsedAt,
  };
}

export async function getCachedEstimate(
  uid: string,
  text: string
): Promise<CachedEstimate | null> {
  const normalized = normalizeMealText(text);
  const ref = doc(getClientDb(), estimationCacheDoc(uid, normalized));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return docToCached(snap.data());
}

export async function saveCachedEstimate(
  uid: string,
  text: string,
  meals: MealEstimate[]
): Promise<void> {
  const normalized = normalizeMealText(text);
  const ref = doc(getClientDb(), estimationCacheDoc(uid, normalized));
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, {
      meals,
      hitCount: ((existing.data().hitCount as number) ?? 0) + 1,
      lastUsedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      textNormalized: normalized,
      meals,
      hitCount: 1,
      lastUsedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }
}

export async function touchCache(uid: string, text: string): Promise<void> {
  const normalized = normalizeMealText(text);
  const ref = doc(getClientDb(), estimationCacheDoc(uid, normalized));
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  await updateDoc(ref, {
    hitCount: ((snap.data().hitCount as number) ?? 0) + 1,
    lastUsedAt: serverTimestamp(),
  });
}
