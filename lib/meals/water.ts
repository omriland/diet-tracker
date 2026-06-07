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

/**
 * Format a milliliter total as a bare liters number (no unit) for editable inputs.
 * 3000ml -> "3", 2500ml -> "2.5".
 */
export function mlToLitersInput(ml: number): string {
  const liters = clampWaterMl(ml) / 1000;
  return liters.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Parse a liters string into whole milliliters.
 * Returns null when the input is not a finite, positive number.
 */
export function litersToMl(value: string): number | null {
  const liters = Number.parseFloat(value);
  if (!Number.isFinite(liters) || liters <= 0) return null;
  return Math.round(liters * 1000);
}
