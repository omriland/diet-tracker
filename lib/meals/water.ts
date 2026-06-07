/** Clamp a water total to a non-negative whole number of milliliters. */
export function clampWaterMl(ml: number): number {
  return Math.max(0, Math.round(ml));
}

/**
 * Format a milliliter total as liters for display.
 * Trims trailing zeros so 1000ml -> "1 L", 1440ml -> "1.44 L", 220ml -> "0.22 L".
 */
export function formatLiters(ml: number): string {
  const liters = clampWaterMl(ml) / 1000;
  const text = liters
    .toFixed(2)
    .replace(/\.?0+$/, "");
  return `${text} L`;
}
