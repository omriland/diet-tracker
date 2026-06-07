/**
 * Per-day flags & notes. One document per calendar day (doc ID = `YYYY-MM-DD`)
 * under /users/{uid}/dayMeta. Treat the document as upsert-only:
 *  - first toggle: create with `sport: true`
 *  - subsequent toggles: `update` the existing doc
 *  - we keep docs around (don't delete on `sport: false`) so this collection
 *    can later carry mood, notes, exercise minutes, etc. without migrations.
 */
export interface DayMeta {
  date: string;
  sport: boolean;
  /**
   * Bonus calories applied when `sport` is true, captured at the time the
   * toggle was last set. Frozen historically — changing the global default
   * later won't retroactively rewrite past days.
   */
  sportBonusKcal: number;
  doneLogging: boolean;
  doneLoggingAt: Date | null;
  /** Running total of water drunk that day, in milliliters. */
  waterMl: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Default bonus for a "sport day". Configurable in settings later if needed. */
export const SPORT_BONUS_KCAL = 200;

/** Water quick-add amounts (ml). */
export const BOTTLE_ML = 1000;
export const CUP_ML = 220;
