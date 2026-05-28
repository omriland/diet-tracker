"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { dayMetaCol } from "@/lib/firestore/paths";
import {
  getJerusalemDateString,
  subtractDaysFromDateString,
} from "@/lib/dates/jerusalem";

interface StreakResult {
  streak: number;
  todayDone: boolean;
  loading: boolean;
}

/**
 * Computes the user's current logging streak.
 *
 * Rule (hybrid):
 *   - Walk backward from today.
 *   - If today is done: count it, continue backward.
 *   - If today is NOT done: skip it (grace), start counting from yesterday.
 *   - Each prior day must be done; first miss stops the count.
 */
export function useStreak(uid: string | undefined): StreakResult {
  const [doneDates, setDoneDates] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!uid) return;

    const ref = collection(getClientDb(), dayMetaCol(uid));
    const q = query(
      ref,
      where("doneLogging", "==", true),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const dates = new Set(snap.docs.map((d) => d.id));
        setDoneDates(dates);
      },
      (err) => {
        console.error("useStreak snapshot error", err);
        setDoneDates(new Set());
      }
    );

    return unsub;
  }, [uid]);

  if (!uid) {
    return { streak: 0, todayDone: false, loading: false };
  }

  if (doneDates === null) {
    return { streak: 0, todayDone: false, loading: true };
  }

  const today = getJerusalemDateString();
  const todayDone = doneDates.has(today);

  // If today not done, skip it (grace). Then count consecutive done days backward.
  let streak = 0;
  let cursor = todayDone ? today : subtractDaysFromDateString(today, 1);

  for (let i = 0; i < 60; i++) {
    if (doneDates.has(cursor)) {
      streak++;
      cursor = subtractDaysFromDateString(cursor, 1);
    } else {
      break;
    }
  }

  return { streak, todayDone, loading: false };
}
