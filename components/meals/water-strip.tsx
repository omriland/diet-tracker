"use client";

import { useEffect, useState } from "react";
import { Check, Droplet, GlassWater, Minus, Pencil, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { addWater } from "@/lib/firestore/day-meta";
import { clampWaterMl, formatLiters } from "@/lib/meals/water";
import { CUP_ML, HALF_LITER_ML, LITER_ML } from "@/types/day-meta";
import { cn } from "@/lib/utils";
import { WaterWaveOverlay } from "./water-wave-overlay";

interface WaterStripProps {
  uid: string;
  date: string;
  waterMl: number;
  targetMl: number;
}

interface WaveState {
  id: number;
  fillPct: number;
  currentMl: number;
}

interface Feedback {
  id: number;
  text: string;
  positive: boolean;
}

interface WaterAmount {
  ml: number;
  num: string;
  unit: string;
  /** When set, the button shows this icon instead of the num/unit text. */
  icon?: LucideIcon;
}

const AMOUNTS: WaterAmount[] = [
  { ml: LITER_ML, num: "1", unit: "L" },
  { ml: HALF_LITER_ML, num: "½", unit: "L" },
  { ml: CUP_ML, num: "220", unit: "ml", icon: GlassWater },
];

function amountLabel(a: WaterAmount): string {
  return `${a.num} ${a.unit}`;
}

export function WaterStrip({ uid, date, waterMl, targetMl }: WaterStripProps) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  // Optimistic total so the number reacts instantly, before the snapshot lands.
  const [displayMl, setDisplayMl] = useState(waterMl);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [wave, setWave] = useState<WaveState | null>(null);

  useEffect(() => {
    setDisplayMl(waterMl);
  }, [waterMl]);

  // Leaving correction mode automatically once everything is removed keeps the
  // row from getting stuck in an empty "remove" state.
  useEffect(() => {
    if (editing && displayMl <= 0) setEditing(false);
  }, [editing, displayMl]);

  async function change(deltaMl: number, label: string) {
    if (pending) return;
    const next = clampWaterMl(displayMl + deltaMl);
    const applied = next - displayMl;
    if (applied === 0) return;

    setDisplayMl(next);
    setFeedback({
      id: Date.now(),
      text: `${applied > 0 ? "+" : "−"}${label}`,
      positive: applied > 0,
    });

    // Only the additive logs trigger the full-screen rise effect.
    if (applied > 0) {
      const crossedGoal =
        targetMl > 0 && displayMl < targetMl && next >= targetMl;
      setWave({
        id: Date.now(),
        fillPct: targetMl > 0 ? next / targetMl : 0,
        currentMl: next,
      });
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(crossedGoal ? [12, 40, 12, 40, 18] : 12);
      }
    } else if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([8, 30, 8]);
    }

    setPending(true);
    try {
      await addWater(uid, date, deltaMl, waterMl);
    } catch (err) {
      console.error("Failed to log water", err);
      toast.error("Couldn't save water");
      setDisplayMl(waterMl);
    } finally {
      setPending(false);
    }
  }

  const hasWater = displayMl > 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl border-b border-hairline px-2 py-2.5 transition-colors",
        editing && "border-transparent bg-sky-500/5"
      )}
    >
      <div className="relative flex items-center gap-1.5 whitespace-nowrap">
        <Droplet
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            hasWater ? "text-sky-500" : "text-muted-foreground"
          )}
          strokeWidth={2}
          fill={hasWater ? "currentColor" : "none"}
          aria-label="Water"
        />
        {editing && (
          <span className="text-sm text-muted-foreground">Remove:</span>
        )}
        <span
          key={feedback?.id ?? "static"}
          className={cn(
            "text-[15px] font-bold tabular-nums",
            feedback ? "water-bump text-sky-500" : "text-foreground"
          )}
          aria-live="polite"
        >
          {formatLiters(displayMl)}
        </span>
        {!editing && targetMl > 0 && (
          <span className="text-[13px] font-medium tabular-nums text-muted-foreground">
            / {formatLiters(targetMl)}
          </span>
        )}

        {feedback && (
          <span
            key={`fb-${feedback.id}`}
            onAnimationEnd={() => setFeedback(null)}
            className={cn(
              "water-float pointer-events-none absolute -top-3 left-8 text-[13px] font-bold tabular-nums",
              feedback.positive ? "text-sky-500" : "text-muted-foreground"
            )}
          >
            {feedback.text}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {editing ? (
          <>
            {AMOUNTS.map((a) => (
              <AmountButton
                key={a.ml}
                amount={a}
                variant="remove"
                onClick={() => void change(-a.ml, amountLabel(a))}
                disabled={pending || displayMl <= 0}
              />
            ))}
            <IconPill
              onClick={() => setEditing(false)}
              ariaLabel="Done editing water"
              className="bg-sky-500 text-white"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </IconPill>
          </>
        ) : (
          <>
            {AMOUNTS.map((a) => (
              <AmountButton
                key={a.ml}
                amount={a}
                variant="add"
                onClick={() => void change(a.ml, amountLabel(a))}
                disabled={pending}
              />
            ))}
            {hasWater && (
              <IconPill
                onClick={() => setEditing(true)}
                ariaLabel="Edit water amount"
                className="bg-subtle text-muted-foreground hover:bg-subtle/70"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </IconPill>
            )}
          </>
        )}
      </div>

      {wave && (
        <WaterWaveOverlay
          key={wave.id}
          fillPct={wave.fillPct}
          currentMl={wave.currentMl}
          targetMl={targetMl}
          onDone={() => setWave(null)}
        />
      )}
    </div>
  );
}

interface AmountButtonProps {
  amount: WaterAmount;
  variant: "add" | "remove";
  onClick: () => void;
  disabled?: boolean;
}

function AmountButton({ amount, variant, onClick, disabled }: AmountButtonProps) {
  const remove = variant === "remove";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${remove ? "Remove" : "Add"} ${amountLabel(amount)}`}
      className={cn(
        "group inline-flex shrink-0 items-center gap-1 rounded-pill py-1.5 pl-2 pr-2.5 transition-all active:scale-95",
        remove
          ? "bg-destructive/10 text-destructive hover:bg-destructive/15 active:bg-destructive/20"
          : "bg-subtle text-foreground hover:bg-subtle/70 active:bg-sky-500/15",
        "disabled:opacity-40 disabled:active:scale-100"
      )}
    >
      {remove ? (
        <Minus className="h-3 w-3 opacity-70" strokeWidth={2.5} aria-hidden />
      ) : (
        <Plus
          className="h-3 w-3 opacity-60 transition-colors group-active:text-sky-600"
          strokeWidth={2.5}
          aria-hidden
        />
      )}
      {amount.icon ? (
        <amount.icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      ) : (
        <span className="flex items-baseline gap-0.5 leading-none">
          <span className="text-[13px] font-semibold tabular-nums">
            {amount.num}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide opacity-50">
            {amount.unit}
          </span>
        </span>
      )}
    </button>
  );
}

interface IconPillProps {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}

function IconPill({ onClick, ariaLabel, className, children }: IconPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill transition-all active:scale-95",
        className
      )}
    >
      {children}
    </button>
  );
}
