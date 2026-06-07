import {
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { dayMetaDoc } from "@/lib/firestore/paths";
import { timestampToDate } from "@/lib/firestore/converters";
import { clampWaterMl } from "@/lib/meals/water";
import { type DayMeta, SPORT_BONUS_KCAL } from "@/types/day-meta";

export function dayMetaFromDoc(date: string, data: DocumentData): DayMeta {
  return {
    date,
    sport: Boolean(data.sport),
    sportBonusKcal:
      typeof data.sportBonusKcal === "number"
        ? data.sportBonusKcal
        : SPORT_BONUS_KCAL,
    doneLogging: Boolean(data.doneLogging),
    doneLoggingAt: data.doneLoggingAt ? timestampToDate(data.doneLoggingAt) : null,
    waterMl: typeof data.waterMl === "number" ? data.waterMl : 0,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export function subscribeDayMeta(
  uid: string,
  date: string,
  onData: (meta: DayMeta | null) => void,
  onError?: (error: Error) => void
) {
  const ref = doc(getClientDb(), dayMetaDoc(uid, date));
  return onSnapshot(
    ref,
    (snap) => {
      onData(snap.exists() ? dayMetaFromDoc(date, snap.data()) : null);
    },
    (err) => onError?.(err)
  );
}

/**
 * Mark or un-mark the doneLogging flag for a given date.
 * Creates the doc on first write; updates in place thereafter.
 */
export async function setDayMetaDoneLogging(
  uid: string,
  date: string,
  done: boolean
): Promise<void> {
  const ref = doc(getClientDb(), dayMetaDoc(uid, date));
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      doneLogging: done,
      doneLoggingAt: done ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      date,
      sport: false,
      sportBonusKcal: SPORT_BONUS_KCAL,
      doneLogging: done,
      doneLoggingAt: done ? serverTimestamp() : null,
      waterMl: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Update only the sport bonus calories for a day that already has sport active.
 */
export async function updateDayMetaSportBonus(
  uid: string,
  date: string,
  bonusKcal: number
): Promise<void> {
  const ref = doc(getClientDb(), dayMetaDoc(uid, date));
  await updateDoc(ref, { sportBonusKcal: bonusKcal, updatedAt: serverTimestamp() });
}

/**
 * Toggle the `sport` flag for a given date.
 * Creates the doc on first write; updates in place thereafter.
 * Bonus value is captured at toggle time so historical days stay consistent
 * even if SPORT_BONUS_KCAL changes later.
 */
export async function setDayMetaSport(
  uid: string,
  date: string,
  sport: boolean,
  bonusKcal: number = SPORT_BONUS_KCAL
): Promise<void> {
  const ref = doc(getClientDb(), dayMetaDoc(uid, date));
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      sport,
      // Refresh the bonus value whenever the user enables sport for the day,
      // but leave it untouched when disabling — preserves history.
      ...(sport ? { sportBonusKcal: bonusKcal } : {}),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      date,
      sport,
      sportBonusKcal: bonusKcal,
      waterMl: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Add (or remove, with a negative delta) water for a given date.
 * Creates the doc on first write; increments in place thereafter.
 * The running total is clamped so it never drops below 0.
 *
 * `currentMl` is the latest known total from the live snapshot and is used to
 * clamp negative deltas without an extra read.
 */
export async function addWater(
  uid: string,
  date: string,
  deltaMl: number,
  currentMl: number = 0
): Promise<void> {
  const ref = doc(getClientDb(), dayMetaDoc(uid, date));
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const existing =
      typeof snap.data().waterMl === "number" ? snap.data().waterMl : currentMl;
    const next = clampWaterMl(existing + deltaMl);
    // When the delta would push the total negative, set the clamped value
    // directly; otherwise use atomic increment to avoid lost updates.
    if (existing + deltaMl < 0) {
      await updateDoc(ref, { waterMl: next, updatedAt: serverTimestamp() });
    } else {
      await updateDoc(ref, {
        waterMl: increment(deltaMl),
        updatedAt: serverTimestamp(),
      });
    }
  } else {
    await setDoc(ref, {
      date,
      sport: false,
      sportBonusKcal: SPORT_BONUS_KCAL,
      doneLogging: false,
      doneLoggingAt: null,
      waterMl: clampWaterMl(deltaMl),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
