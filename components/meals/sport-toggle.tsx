"use client";

import { useRef, useState } from "react";
import { Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { setDayMetaSport, updateDayMetaSportBonus } from "@/lib/firestore/day-meta";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import { cn } from "@/lib/utils";

interface SportToggleProps {
  uid: string;
  date: string;
  active: boolean;
  bonusKcal: number;
  defaultBonus: number;
}

export function SportToggle({ uid, date, active, bonusKcal, defaultBonus }: SportToggleProps) {
  const [pending, setPending] = useState(false);
  const [editingBonus, setEditingBonus] = useState(false);
  const [bonusInput, setBonusInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleToggle() {
    if (pending) return;
    setPending(true);
    try {
      await setDayMetaSport(uid, date, !active, defaultBonus);
    } catch (err) {
      console.error("Failed to toggle sport", err);
      toast.error("Couldn't save sport flag");
    } finally {
      setPending(false);
    }
  }

  function handleBonusClick(e: React.MouseEvent) {
    e.stopPropagation();
    setBonusInput(String(bonus));
    setEditingBonus(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  }

  async function commitBonus() {
    setEditingBonus(false);
    const parsed = parseInt(bonusInput, 10);
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 2000) {
      toast.error("Bonus must be between 1 and 2000");
      return;
    }
    if (parsed === bonus) return;
    try {
      await updateDayMetaSportBonus(uid, date, parsed);
    } catch {
      toast.error("Couldn't update sport bonus");
    }
  }

  const bonus = bonusKcal || SPORT_BONUS_KCAL;

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={active}
      disabled={pending}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "bg-subtle text-muted-foreground hover:bg-subtle/70"
      )}
    >
      <Dumbbell className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      <span>Sport</span>
      {active && (
        editingBonus ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={bonusInput}
            onChange={(e) => setBonusInput(e.target.value)}
            onBlur={() => void commitBonus()}
            onKeyDown={(e) => {
              if (e.key === "Enter") inputRef.current?.blur();
              if (e.key === "Escape") setEditingBonus(false);
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-14 rounded bg-accent-foreground/10 px-1 text-center tabular-nums outline-none"
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            onClick={handleBonusClick}
            onKeyDown={(e) => e.key === "Enter" && handleBonusClick(e as never)}
            className="tabular-nums opacity-80 underline decoration-dotted"
            title="Tap to edit today's sport bonus"
          >
            +{bonus}
          </span>
        )
      )}
    </button>
  );
}
