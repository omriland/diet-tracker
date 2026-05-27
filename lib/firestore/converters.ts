import { Timestamp } from "firebase/firestore";

export function timestampToDate(
  value: Timestamp | Date | undefined
): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return value.toDate();
}
