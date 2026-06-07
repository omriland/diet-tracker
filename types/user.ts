export interface UserProfile {
  email: string;
  /** Sun–Thu target (Israeli workweek). */
  weekdayCalorieTarget: number;
  /** Fri–Sat target. */
  weekendCalorieTarget: number;
  /** Bonus calories added when sport is toggled on. */
  defaultSportBonus: number;
  /** Daily water goal, in milliliters. */
  waterTargetMl: number;
  createdAt: Date;
}

export const DEFAULT_WEEKDAY_TARGET = 1600;
export const DEFAULT_WEEKEND_TARGET = 1950;
/** Legacy fallback. Profiles created before the split-target feature stored a single number. */
export const DEFAULT_CALORIE_TARGET = 2000;
export const DEFAULT_SPORT_BONUS = 200;
/** Default daily water goal: 3 L. */
export const DEFAULT_WATER_TARGET_ML = 3000;
