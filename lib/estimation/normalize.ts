// Firestore doc IDs may not contain '/' and have a 1500-byte limit.
export function normalizeMealText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\//g, " ")
    .toLowerCase()
    .slice(0, 400); // well under the 1500-byte Firestore doc ID limit
}
