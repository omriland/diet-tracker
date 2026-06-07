import { describe, it, expect } from "vitest";
import { clampWaterMl, formatLiters } from "./water";

describe("clampWaterMl", () => {
  it("never returns a negative total", () => {
    expect(clampWaterMl(-220)).toBe(0);
    expect(clampWaterMl(-1)).toBe(0);
  });
  it("rounds to whole milliliters", () => {
    expect(clampWaterMl(220.4)).toBe(220);
    expect(clampWaterMl(220.6)).toBe(221);
  });
  it("passes through non-negative totals", () => {
    expect(clampWaterMl(0)).toBe(0);
    expect(clampWaterMl(1440)).toBe(1440);
  });
});

describe("formatLiters", () => {
  it("formats whole liters without decimals", () => {
    expect(formatLiters(1000)).toBe("1 L");
    expect(formatLiters(0)).toBe("0 L");
  });
  it("trims trailing zeros", () => {
    expect(formatLiters(220)).toBe("0.22 L");
    expect(formatLiters(1440)).toBe("1.44 L");
    expect(formatLiters(1500)).toBe("1.5 L");
  });
  it("clamps negatives to 0 L", () => {
    expect(formatLiters(-500)).toBe("0 L");
  });
});
