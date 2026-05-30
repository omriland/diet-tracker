"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { mealsCol, dayMetaCol } from "@/lib/firestore/paths";
import { mealFromDoc } from "@/lib/firestore/meals";
import {
  computeStats,
  type DayCalorieEntry,
  type DietStats,
} from "@/lib/stats/compute";
import { computeDoneStreaks, type DoneStreaks } from "@/lib/stats/streaks";
import { getTargetForDate } from "@/hooks/use-user-profile";
import {
  getJerusalemDateString,
  subtractDaysFromDateString,
} from "@/lib/dates/jerusalem";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import type { UserProfile } from "@/types/user";

const WINDOW_DAYS = 90;

const NO_STREAKS: DoneStreaks = { current: 0, best: 0 };

export function useStats(uid: string | undefined, profile: UserProfile | null) {
  const [stats, setStats] = useState<DietStats | null>(null);
  const [streaks, setStreaks] = useState<DoneStreaks>(NO_STREAKS);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const start = subtractDaysFromDateString(
      getJerusalemDateString(),
      WINDOW_DAYS - 1
    );

    (async () => {
      const db = getClientDb();
      const [mealsSnap, metaSnap] = await Promise.all([
        getDocs(query(collection(db, mealsCol(uid)), where("date", ">=", start))),
        getDocs(query(collection(db, dayMetaCol(uid)), where("date", ">=", start))),
      ]);

      const sportByDate = new Map<string, number>();
      const doneDates: string[] = [];
      metaSnap.forEach((d) => {
        const data = d.data() as {
          sport?: boolean;
          sportBonusKcal?: number;
          doneLogging?: boolean;
        };
        if (data.sport) {
          sportByDate.set(d.id, data.sportBonusKcal ?? SPORT_BONUS_KCAL);
        }
        if (data.doneLogging) doneDates.push(d.id);
      });

      const byDate = new Map<string, { consumed: number; mealCount: number }>();
      mealsSnap.forEach((d) => {
        const m = mealFromDoc(d.id, d.data());
        const cur = byDate.get(m.date) ?? { consumed: 0, mealCount: 0 };
        cur.consumed += m.calories ?? 0;
        cur.mealCount += 1;
        byDate.set(m.date, cur);
      });

      const entries: DayCalorieEntry[] = [...byDate.entries()].map(
        ([date, v]) => ({
          date,
          consumed: v.consumed,
          mealCount: v.mealCount,
          target: getTargetForDate(profile, date) + (sportByDate.get(date) ?? 0),
        })
      );

      if (!cancelled) {
        setStats(computeStats(entries));
        setStreaks(computeDoneStreaks(doneDates, getJerusalemDateString()));
      }
    })().catch((err) => {
      console.error("useStats error", err);
      if (!cancelled) {
        setStats(computeStats([]));
        setStreaks(NO_STREAKS);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [uid, profile]);

  const loading = uid ? stats === null : false;
  return useMemo(
    () => ({ stats: stats ?? computeStats([]), streaks, loading }),
    [stats, streaks, loading]
  );
}
