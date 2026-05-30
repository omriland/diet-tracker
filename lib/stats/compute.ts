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
}

const EMPTY: DietStats = {
  loggedDays: 0,
  mealsLogged: 0,
  daysOnTarget: 0,
  daysOverTarget: 0,
  pctDaysOnTarget: 0,
  avgCaloriesPerDay: 0,
};

/** Aggregate per-day calorie data into headline stats. Only days with >=1 meal count. */
export function computeStats(entries: DayCalorieEntry[]): DietStats {
  const logged = entries.filter((e) => e.mealCount > 0);
  if (logged.length === 0) return { ...EMPTY };

  let daysOnTarget = 0;
  let mealsLogged = 0;
  let totalConsumed = 0;

  for (const e of logged) {
    mealsLogged += e.mealCount;
    totalConsumed += e.consumed;
    if (e.consumed <= e.target) daysOnTarget += 1;
  }

  const loggedDays = logged.length;
  return {
    loggedDays,
    mealsLogged,
    daysOnTarget,
    daysOverTarget: loggedDays - daysOnTarget,
    pctDaysOnTarget: Math.round((daysOnTarget / loggedDays) * 100),
    avgCaloriesPerDay: Math.round(totalConsumed / loggedDays),
  };
}
