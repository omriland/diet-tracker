import { describe, it, expect } from "vitest";
import { clampWaterMl, formatLiters, litersToMl, mlToLitersInput } from "./water";

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

describe("mlToLitersInput", () => {
  it("renders a bare liters number with trimmed zeros", () => {
    expect(mlToLitersInput(3000)).toBe("3");
    expect(mlToLitersInput(2500)).toBe("2.5");
    expect(mlToLitersInput(1440)).toBe("1.44");
  });
});

describe("litersToMl", () => {
  it("converts liters strings to whole milliliters", () => {
    expect(litersToMl("3")).toBe(3000);
    expect(litersToMl("2.5")).toBe(2500);
    expect(litersToMl("1.234")).toBe(1234);
  });
  it("rejects non-positive or invalid input", () => {
    expect(litersToMl("0")).toBeNull();
    expect(litersToMl("-1")).toBeNull();
    expect(litersToMl("abc")).toBeNull();
    expect(litersToMl("")).toBeNull();
  });
});
