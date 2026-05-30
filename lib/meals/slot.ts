import { formatInTimeZone } from "date-fns-tz";
import { JERUSALEM_TZ } from "@/lib/dates/jerusalem";
import type { MealSlot } from "@/types/meal";

/**
 * Best-guess slot from the current Jerusalem hour, used to pre-select the slot
 * in the add-meal sheet. Boundaries: breakfast <11, lunch 11–16, dinner 16–22,
 * else snack.
 */
export function defaultSlotForTime(now: Date = new Date()): MealSlot {
  const hour = Number(formatInTimeZone(now, JERUSALEM_TZ, "H"));
  if (hour < 11) return "BREAKFAST";
  if (hour < 16) return "LUNCH";
  if (hour < 22) return "DINNER";
  return "SNACK";
}
