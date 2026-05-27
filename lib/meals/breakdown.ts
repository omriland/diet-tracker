import type { BreakdownItem } from "@/types/meal";

export function sumBreakdownCalories(items: BreakdownItem[]): number {
  return items.reduce((sum, item) => sum + item.calories, 0);
}

export function scaleBreakdownItemGrams(
  item: BreakdownItem,
  newGrams: number
): BreakdownItem {
  const originalGrams = item.originalPortionGrams;
  if (originalGrams == null || originalGrams === 0) {
    return { ...item, portionGrams: newGrams, edited: true };
  }
  const calories = Math.round(
    (item.originalCalories * newGrams) / originalGrams
  );
  return {
    ...item,
    portionGrams: newGrams,
    calories,
    edited: true,
  };
}

export function updateBreakdownItemCalories(
  item: BreakdownItem,
  calories: number
): BreakdownItem {
  return { ...item, calories, edited: true };
}
