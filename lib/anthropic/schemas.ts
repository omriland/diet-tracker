import { z } from "zod";
import type { BreakdownItem, Confidence, FoodCategory } from "@/types/meal";

export const BreakdownItemSchema = z.object({
  item_he: z.string(),
  item_en: z.string(),
  calories: z.number().int().min(0),
  portion_grams: z.number().int().min(0).nullable(),
  confidence: z.enum(["low", "medium", "high"]),
});

export const MealItemSchema = z.object({
  text_he: z.string(),
  calories: z.number().int().min(0).max(5000),
  confidence: z.enum(["low", "medium", "high"]),
  searched: z.boolean(),
  sources: z.array(z.string()),
  reasoning_he: z.string(),
  assumptions_he: z.array(z.string()),
  breakdown: z.array(BreakdownItemSchema).min(1),
  needs_clarification_he: z.string().nullable(),
  food_category: z.enum(["meal", "snack", "drink", "dessert"]),
});

// The model now returns a top-level `meals` array so a single input like
// "טוסט ושוקו" can be split into independent entries. Capped to keep a single
// turn bounded; most inputs yield 1-3 meals.
export const EstimateSchema = z.object({
  meals: z.array(MealItemSchema).min(1).max(12),
});

export type ApiMealItem = z.infer<typeof MealItemSchema>;
export type ApiEstimate = z.infer<typeof EstimateSchema>;

export interface MealEstimate {
  textHe: string;
  calories: number;
  confidence: Confidence;
  searched: boolean;
  sources: string[];
  reasoningHe: string;
  assumptionsHe: string[];
  breakdown: BreakdownItem[];
  needsClarificationHe: string | null;
  foodCategory: FoodCategory;
}

export function mapApiMealItem(api: ApiMealItem): MealEstimate {
  return {
    textHe: api.text_he,
    calories: api.calories,
    confidence: api.confidence,
    searched: api.searched,
    sources: api.sources,
    reasoningHe: api.reasoning_he,
    assumptionsHe: api.assumptions_he,
    breakdown: api.breakdown.map((item) => ({
      itemHe: item.item_he,
      itemEn: item.item_en,
      calories: item.calories,
      portionGrams: item.portion_grams,
      confidence: item.confidence,
      originalCalories: item.calories,
      originalPortionGrams: item.portion_grams,
      edited: false,
    })),
    needsClarificationHe: api.needs_clarification_he,
    foodCategory: api.food_category,
  };
}

export function mapApiEstimateToMeals(api: ApiEstimate): MealEstimate[] {
  return api.meals.map(mapApiMealItem);
}
