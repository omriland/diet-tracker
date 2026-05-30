import {
  addDaysToDateString,
  subtractDaysFromDateString,
} from "@/lib/dates/jerusalem";

export interface DoneStreaks {
  current: number;
  best: number;
}

/**
 * Streaks over the set of "done logging" calendar dates (YYYY-MM-DD).
 * - best: longest run of consecutive calendar days all marked done.
 * - current: run ending today, or yesterday if today isn't marked done yet (grace),
 *   matching the existing useStreak semantics.
 */
export function computeDoneStreaks(
  doneDates: string[],
  today: string
): DoneStreaks {
  const set = new Set(doneDates);
  if (set.size === 0) return { current: 0, best: 0 };

  const sorted = [...set].sort((a, b) => a.localeCompare(b));
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDaysToDateString(sorted[i - 1], 1) === sorted[i]) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  let current = 0;
  let cursor = set.has(today) ? today : subtractDaysFromDateString(today, 1);
  while (set.has(cursor)) {
    current += 1;
    cursor = subtractDaysFromDateString(cursor, 1);
  }

  return { current, best };
}
