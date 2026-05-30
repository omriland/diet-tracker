import { formatInTimeZone } from "date-fns-tz";
import { addDays, parseISO, subDays } from "date-fns";

export const JERUSALEM_TZ = "Asia/Jerusalem";

export function getJerusalemDateString(date: Date = new Date()): string {
  return formatInTimeZone(date, JERUSALEM_TZ, "yyyy-MM-dd");
}

export function formatDayHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  return formatInTimeZone(date, JERUSALEM_TZ, "EEE, MMM d");
}

export function formatMonthDay(dateStr: string): string {
  return formatInTimeZone(parseISO(dateStr), JERUSALEM_TZ, "MMM d");
}

export function formatWeekday(dateStr: string): string {
  return formatInTimeZone(parseISO(dateStr), JERUSALEM_TZ, "EEEE");
}

export function formatShortDate(dateStr: string): string {
  return formatInTimeZone(parseISO(dateStr), JERUSALEM_TZ, "MMM d");
}

export function formatYear(dateStr: string): string {
  return formatInTimeZone(parseISO(dateStr), JERUSALEM_TZ, "yyyy");
}

export function addDaysToDateString(dateStr: string, days: number): string {
  return getJerusalemDateString(addDays(parseISO(dateStr), days));
}

export function subtractDaysFromDateString(
  dateStr: string,
  days: number
): string {
  return getJerusalemDateString(subDays(parseISO(dateStr), days));
}

/** True if the date is Fri or Sat in Asia/Jerusalem (Israeli weekend). */
export function isWeekend(dateStr: string): boolean {
  // "i" = ISO weekday 1..7 (Mon..Sun) — easier reasoning across DST than getDay()
  const iso = formatInTimeZone(parseISO(dateStr), JERUSALEM_TZ, "i");
  // Fri = 5, Sat = 6
  return iso === "5" || iso === "6";
}

/** Time-of-day in Asia/Jerusalem as HH:mm (24h). For displaying meal log time. */
export function formatMealTime(date: Date): string {
  return formatInTimeZone(date, JERUSALEM_TZ, "HH:mm");
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseISO(value);
  return getJerusalemDateString(d) === value;
}
