import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { dayMetaDoc } from "@/lib/firestore/paths";
import { timestampToDate } from "@/lib/firestore/converters";
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
