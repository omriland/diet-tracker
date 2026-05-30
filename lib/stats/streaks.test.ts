import { describe, it, expect } from "vitest";
import { computeDoneStreaks } from "./streaks";

describe("computeDoneStreaks", () => {
  it("returns zeros for no done dates", () => {
    expect(computeDoneStreaks([], "2026-05-30")).toEqual({ current: 0, best: 0 });
  });

  it("counts a current streak ending today", () => {
    const done = ["2026-05-28", "2026-05-29", "2026-05-30"];
    expect(computeDoneStreaks(done, "2026-05-30")).toEqual({ current: 3, best: 3 });
  });

  it("applies grace when today is not yet done (counts back from yesterday)", () => {
    const done = ["2026-05-28", "2026-05-29"]; // today 05-30 not done
    expect(computeDoneStreaks(done, "2026-05-30").current).toBe(2);
  });

  it("breaks the current streak on a missed day but keeps best", () => {
    const done = ["2026-05-25", "2026-05-26", "2026-05-27", "2026-05-30"];
    const s = computeDoneStreaks(done, "2026-05-30");
    expect(s.current).toBe(1); // only today (28,29 missing)
    expect(s.best).toBe(3); // 25-26-27
  });

  it("is order-independent and dedupes", () => {
    const done = ["2026-05-30", "2026-05-29", "2026-05-29", "2026-05-28"];
    expect(computeDoneStreaks(done, "2026-05-30")).toEqual({ current: 3, best: 3 });
  });

  it("current is 0 when neither today nor yesterday is done", () => {
    const done = ["2026-05-20", "2026-05-21"];
    expect(computeDoneStreaks(done, "2026-05-30").current).toBe(0);
  });
});
