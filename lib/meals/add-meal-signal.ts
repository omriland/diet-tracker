/**
 * Cross-component signal for "open the add-meal sheet".
 * Fired by the dock's center button when already on a day view;
 * day views also honor a one-shot `?add=1` query param after navigation.
 */
export const ADD_MEAL_EVENT = "diet:add-meal";
