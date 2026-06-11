"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates an integer toward `value` with an ease-out curve.
 * Respects prefers-reduced-motion by snapping immediately.
 */
export function useAnimatedNumber(value: number, duration = 550): number {
  const [display, setDisplay] = useState(value);
  const latest = useRef(value);
  const frame = useRef(0);

  useEffect(() => {
    const from = latest.current;
    if (from === value) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Reduced motion snaps on the next frame instead of animating.
    const effectiveDuration = reduced ? 0 : duration;

    const start = performance.now();
    const tick = (now: number) => {
      const t =
        effectiveDuration === 0
          ? 1
          : Math.min(1, (now - start) / effectiveDuration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (value - from) * eased);
      latest.current = current;
      setDisplay(current);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return display;
}
