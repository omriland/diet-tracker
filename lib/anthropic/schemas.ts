import { z } from "zod";
import type { BreakdownItem, Confidence, FoodCategory } from "@/types/meal";

export const BreakdownItemSchema = z.object({
  item_he: z.string(),
  item_en: z.string(),
  calories: z.number().int().min(0),
  portion_grams: z.number().int().min(0).nullable(),
  confidence: z.enum(["low", "medium", "high"]),
});

export const EstimateSchema = z.object({
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

export type ApiEstimate = z.infer<typeof EstimateSchema>;

export interface MealEstimate {
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

export function mapApiEstimateToMeal(api: ApiEstimate): MealEstimate {
  return {
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
