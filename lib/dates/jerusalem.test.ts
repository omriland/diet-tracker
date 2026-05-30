import { describe, it, expect } from "vitest";
import { formatMealTime } from "./jerusalem";

describe("formatMealTime", () => {
  it("formats a UTC instant to Asia/Jerusalem HH:mm", () => {
    // 2026-05-30T05:30:00Z => 08:30 in Jerusalem (UTC+3 DST)
    const d = new Date("2026-05-30T05:30:00Z");
    expect(formatMealTime(d)).toBe("08:30");
  });

  it("zero-pads hours and minutes", () => {
    const d = new Date("2026-01-01T05:05:00Z"); // 07:05 in winter (UTC+2)
    expect(formatMealTime(d)).toBe("07:05");
  });
});
