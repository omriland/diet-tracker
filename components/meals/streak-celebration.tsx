"use client";

import { useEffect, useRef } from "react";
import { Flame } from "lucide-react";
import confetti from "canvas-confetti";

interface StreakCelebrationProps {
  streak: number;
  onClose: () => void;
}

export function StreakCelebration({ streak, onClose }: StreakCelebrationProps) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fire = (origin: { x: number; y: number }, angle: number) =>
      confetti({
        particleCount: 80,
        spread: 70,
        origin,
        angle,
        startVelocity: 45,
        gravity: 0.9,
        colors: ["#CDFB51", "#8FBE2E", "#EFFFC0", "#5BD1F5", "#FFC95C"],
      });

    const t = setTimeout(() => {
      fire({ x: 0.1, y: 1 }, 60);
      fire({ x: 0.9, y: 1 }, 120);
    }, 80);

    return () => clearTimeout(t);
  }, []);

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

  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="pointer-events-none flex select-none flex-col items-center gap-3">
        <span
          ref={numRef}
          className="font-display text-glow text-[120px] font-bold leading-none tabular-nums text-accent"
        >
          0
        </span>
        <span className="flex items-center gap-1.5 text-xl font-semibold text-foreground">
          <Flame className="h-5 w-5 text-accent" strokeWidth={2} aria-hidden />
          days in a row
        </span>
      </div>
    </div>
  );
}
