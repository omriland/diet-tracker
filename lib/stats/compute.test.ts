import { describe, it, expect } from "vitest";
import { computeStats, type DayCalorieEntry } from "./compute";

const day = (date: string, consumed: number, target: number, mealCount = 1): DayCalorieEntry =>
  ({ date, consumed, target, mealCount });

describe("computeStats", () => {
  it("returns zeros for no logged days", () => {
    const s = computeStats([]);
    expect(s.loggedDays).toBe(0);
    expect(s.pctDaysOnTarget).toBe(0);
    expect(s.avgCaloriesPerDay).toBe(0);
  });

  it("ignores days with no meals", () => {
    const s = computeStats([day("2026-05-01", 0, 1800, 0), day("2026-05-02", 1500, 1800, 2)]);
    expect(s.loggedDays).toBe(1);
    expect(s.mealsLogged).toBe(2);
  });

  it("counts on-target vs over-target and percentage", () => {
    const s = computeStats([
      day("2026-05-01", 1500, 1800),
      day("2026-05-02", 2000, 1800),
      day("2026-05-03", 1800, 1800),
    ]);
    expect(s.daysOnTarget).toBe(2); // <= target
    expect(s.daysOverTarget).toBe(1);
    expect(s.pctDaysOnTarget).toBe(67); // round(2/3*100)
  });

  it("averages calories over logged days", () => {
    const s = computeStats([day("2026-05-01", 1000, 1800), day("2026-05-02", 2000, 1800)]);
    expect(s.avgCaloriesPerDay).toBe(1500);
  });
});
