import { Croissant, Salad, UtensilsCrossed, Cookie } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MealSlot } from "@/types/meal";

export const SLOT_ICON: Record<MealSlot, LucideIcon> = {
  BREAKFAST: Croissant,
  LUNCH: Salad,
  DINNER: UtensilsCrossed,
  SNACK: Cookie,
};

/** Each slot gets its own neon tint so the day reads as a timeline. */
export const SLOT_TINT: Record<MealSlot, { text: string; bg: string }> = {
  BREAKFAST: { text: "#FFC95C", bg: "rgba(255, 201, 92, 0.12)" },
  LUNCH: { text: "#CDFB51", bg: "rgba(205, 251, 81, 0.12)" },
  DINNER: { text: "#B79CFF", bg: "rgba(183, 156, 255, 0.12)" },
  SNACK: { text: "#5BD1F5", bg: "rgba(91, 209, 245, 0.12)" },
};
