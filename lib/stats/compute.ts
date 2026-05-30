export interface DayCalorieEntry {
  date: string; // YYYY-MM-DD
  consumed: number;
  target: number;
  mealCount: number;
}

export interface DietStats {
  loggedDays: number;
  mealsLogged: number;
  daysOnTarget: number;
  daysOverTarget: number;
  pctDaysOnTarget: number;
  avgCaloriesPerDay: number;
  bestStreak: number;
  currentStreak: number;
}

const EMPTY: DietStats = {
  loggedDays: 0,
  mealsLogged: 0,
  daysOnTarget: 0,
  daysOverTarget: 0,
  pctDaysOnTarget: 0,
  avgCaloriesPerDay: 0,
  bestStreak: 0,
  currentStreak: 0,
};

/** Aggregate per-day calorie data into headline stats. Only days with >=1 meal count. */
export function computeStats(entries: DayCalorieEntry[]): DietStats {
  const logged = entries.filter((e) => e.mealCount > 0);
  if (logged.length === 0) return { ...EMPTY };

  const sorted = [...logged].sort((a, b) => a.date.localeCompare(b.date));

  let daysOnTarget = 0;
  let mealsLogged = 0;
  let totalConsumed = 0;
  let bestStreak = 0;
  let run = 0;

  for (const e of sorted) {
    mealsLogged += e.mealCount;
    totalConsumed += e.consumed;
    const onTarget = e.consumed <= e.target;
    if (onTarget) {
      daysOnTarget += 1;
      run += 1;
      if (run > bestStreak) bestStreak = run;
    } else {
      run = 0;
    }
  }

  // Current streak: consecutive on-target days counting back from the most recent logged day.
  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].consumed <= sorted[i].target) currentStreak += 1;
    else break;
  }

  const loggedDays = sorted.length;
  return {
    loggedDays,
    mealsLogged,
    daysOnTarget,
    daysOverTarget: loggedDays - daysOnTarget,
    pctDaysOnTarget: Math.round((daysOnTarget / loggedDays) * 100),
    avgCaloriesPerDay: Math.round(totalConsumed / loggedDays),
    bestStreak,
    currentStreak,
  };
}
