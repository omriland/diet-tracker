"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface StreakCelebrationProps {
  streak: number;
  onClose: () => void;
}

export function StreakCelebration({ streak, onClose }: StreakCelebrationProps) {
  const numRef = useRef<HTMLSpanElement>(null);

  // Confetti burst from both bottom corners
  useEffect(() => {
    const fire = (origin: { x: number; y: number }, angle: number) =>
      confetti({
        particleCount: 80,
        spread: 70,
        origin,
        angle,
        startVelocity: 45,
        gravity: 0.9,
        colors: ["#5ee7df", "#b490ca", "#f9d423", "#ff6b6b", "#ffffff"],
      });

    const t = setTimeout(() => {
      fire({ x: 0.1, y: 1 }, 60);
      fire({ x: 0.9, y: 1 }, 120);
    }, 80);

    return () => clearTimeout(t);
  }, []);

  // Count-up animation 0 → streak over 1.2s with ease-out cubic
  useEffect(() => {
    const el = numRef.current;
    if (!el) return;

    if (streak === 0) {
      el.textContent = "0";
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * streak);
      if (el) el.textContent = String(current);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [streak]);

  // Auto-dismiss after 3s
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "oklch(0.165 0.005 270 / 88%)" }}
      onClick={onClose}
    >
      <div className="flex flex-col items-center gap-3 select-none pointer-events-none">
        <span
          ref={numRef}
          className="text-[96px] font-bold leading-none tabular-nums text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          0
        </span>
        <span className="text-2xl tracking-wide text-muted-foreground">
          🔥 days in a row
        </span>
      </div>
    </div>
  );
}
