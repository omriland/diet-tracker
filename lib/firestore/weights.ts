import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { weightDoc, weightsCol } from "@/lib/firestore/paths";
import { timestampToDate } from "@/lib/firestore/converters";
import type { WeightEntry } from "@/types/weight";
import {
  getJerusalemDateString,
  subtractDaysFromDateString,
} from "@/lib/dates/jerusalem";

export function weightFromDoc(id: string, data: DocumentData): WeightEntry {
  return {
    id,
    date: data.date as string,
    weightKg: data.weightKg as number,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export function subscribeWeights(
  uid: string,
  onData: (entries: WeightEntry[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(getClientDb(), weightsCol(uid)),
    orderBy("date", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => weightFromDoc(d.id, d.data())));
    },
    (err) => onError?.(err)
  );
}

export async function upsertWeight(
  uid: string,
  date: string,
  weightKg: number
): Promise<void> {
  const ref = doc(getClientDb(), weightDoc(uid, date));
  const rounded = Math.round(weightKg * 10) / 10;
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      weightKg: rounded,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      date,
      weightKg: rounded,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function deleteWeight(uid: string, date: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), weightDoc(uid, date)));
}

export function getWeightDelta(
  entries: WeightEntry[],
  daysAgo: number,
  fromDate: string
): number | null {
  const latest = entries.find((e) => e.date <= fromDate);
  if (!latest) return null;
  const targetDate = subtractDaysFromDateString(fromDate, daysAgo);
  const past = entries.find((e) => e.date <= targetDate);
  if (!past) return null;
  return Math.round((latest.weightKg - past.weightKg) * 10) / 10;
}

export function filterWeightsByRange(
  entries: WeightEntry[],
  days: number | null
): WeightEntry[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (days === null) return sorted;
  const cutoff = subtractDaysFromDateString(getJerusalemDateString(), days);
  return sorted.filter((e) => e.date >= cutoff);
}
