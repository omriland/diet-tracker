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

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseISO(value);
  return getJerusalemDateString(d) === value;
}
