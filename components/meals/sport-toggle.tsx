"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setDayMetaSport } from "@/lib/firestore/day-meta";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import { cn } from "@/lib/utils";

interface SportToggleProps {
  uid: string;
  date: string;
  active: boolean;
  bonusKcal: number;
}

export function SportToggle({ uid, date, active, bonusKcal }: SportToggleProps) {
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (pending) return;
    setPending(true);
    try {
      await setDayMetaSport(uid, date, !active);
    } catch (err) {
      console.error("Failed to toggle sport", err);
      toast.error("Couldn't save sport flag");
    } finally {
      setPending(false);
    }
  }

  const bonus = bonusKcal || SPORT_BONUS_KCAL;

  return (
    <div className="border-b border-hairline py-3">
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={active}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors",
          active
            ? "bg-accent text-accent-foreground"
            : "bg-subtle text-foreground hover:bg-subtle/70"
        )}
      >
        <span>🏃</span>
        <span>Sport</span>
        <span className="tabular-nums opacity-80">+{bonus} kcal</span>
      </button>
    </div>
  );
}
