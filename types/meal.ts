export type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export type CaloriesSource =
  | "AI"
  | "AI_CACHED"
  | "MANUAL"
  | "MANUAL_BREAKDOWN_EDIT";

export type Confidence = "low" | "medium" | "high";

export type FoodCategory = "meal" | "snack" | "drink" | "dessert";

export interface BreakdownItem {
  itemHe: string;
  itemEn: string;
  calories: number;
  portionGrams: number | null;
  confidence: Confidence;
  originalCalories: number;
  originalPortionGrams: number | null;
  edited: boolean;
}

export interface Meal {
  id: string;
  date: string;
  slot: MealSlot;
  text: string;
  calories: number | null;
  caloriesSource: CaloriesSource | null;
  confidence: Confidence | null;
  searched: boolean;
  sources: string[];
  reasoningHe: string | null;
  assumptionsHe: string[];
  breakdown: BreakdownItem[];
  needsClarificationHe: string | null;
  foodCategory: FoodCategory | null;
  createdAt: Date;
  updatedAt: Date;
  pending?: boolean;
}

export const MEAL_SLOTS: { slot: MealSlot; label: string; emoji: string }[] = [
  { slot: "BREAKFAST", label: "Breakfast", emoji: "🥐" },
  { slot: "LUNCH", label: "Lunch", emoji: "🥗" },
  { slot: "DINNER", label: "Dinner", emoji: "🍽" },
  { slot: "SNACK", label: "Snacks", emoji: "🍫" },
];

export const SLOT_ORDER: Record<MealSlot, number> = {
  BREAKFAST: 0,
  LUNCH: 1,
  DINNER: 2,
  SNACK: 3,
};
