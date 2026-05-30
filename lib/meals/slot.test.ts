import { describe, it, expect } from "vitest";
import { defaultSlotForTime } from "./slot";

describe("defaultSlotForTime", () => {
  it("morning -> BREAKFAST", () => {
    expect(defaultSlotForTime(new Date("2026-05-30T05:00:00Z"))).toBe("BREAKFAST"); // 08:00 IL
  });
  it("midday -> LUNCH", () => {
    expect(defaultSlotForTime(new Date("2026-05-30T10:00:00Z"))).toBe("LUNCH"); // 13:00 IL
  });
  it("evening -> DINNER", () => {
    expect(defaultSlotForTime(new Date("2026-05-30T16:30:00Z"))).toBe("DINNER"); // 19:30 IL
  });
  it("late evening -> SNACK", () => {
    expect(defaultSlotForTime(new Date("2026-05-30T19:30:00Z"))).toBe("SNACK"); // 22:30 IL
  });
});
