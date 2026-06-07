"use client";

import { useEffect, useState } from "react";
import { Check, Droplet, GlassWater, Minus, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { addWater } from "@/lib/firestore/day-meta";
import { clampWaterMl, formatLiters } from "@/lib/meals/water";
import { BOTTLE_ML, CUP_ML } from "@/types/day-meta";
import { cn } from "@/lib/utils";

interface WaterStripProps {
  uid: string;
  date: string;
  waterMl: number;
}

interface Feedback {
  id: number;
  text: string;
  positive: boolean;
}

export function WaterStrip({ uid, date, waterMl }: WaterStripProps) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  // Optimistic total so the number reacts instantly, before the snapshot lands.
  const [displayMl, setDisplayMl] = useState(waterMl);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

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
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(applied > 0 ? 12 : [8, 30, 8]);
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
        "flex items-center justify-between gap-2 rounded-xl border-b border-hairline px-2 py-3 transition-colors",
        editing && "border-transparent bg-sky-500/5"
      )}
    >
      <div className="relative flex items-center gap-2">
        <Droplet
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            hasWater ? "text-sky-500" : "text-muted-foreground"
          )}
          strokeWidth={2}
          fill={hasWater ? "currentColor" : "none"}
          aria-hidden
        />
        <span className="text-sm text-muted-foreground">
          {editing ? "Remove:" : "Water:"}
        </span>
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

      <div className="flex shrink-0 items-center gap-2">
        {editing ? (
          <>
            <WaterButton
              variant="remove"
              label="1 L"
              icon={<Minus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
              onClick={() => void change(-BOTTLE_ML, "1 L")}
              disabled={pending || displayMl <= 0}
            />
            <WaterButton
              variant="remove"
              label="220 ml"
              icon={<Minus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
              onClick={() => void change(-CUP_ML, "220 ml")}
              disabled={pending || displayMl <= 0}
            />
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label="Done editing water"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-sky-500 text-white transition-transform active:scale-95"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          </>
        ) : (
          <>
            {hasWater && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex shrink-0 items-center gap-1 rounded-pill px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-subtle active:scale-95"
                aria-label="Edit water amount"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                <span>Edit</span>
              </button>
            )}
            <WaterButton
              label="Bottle"
              icon={<Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
              trailing={<Droplet className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
              onClick={() => void change(BOTTLE_ML, "1 L")}
              disabled={pending}
            />
            <WaterButton
              label="Cup"
              icon={<Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
              trailing={<GlassWater className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
              onClick={() => void change(CUP_ML, "220 ml")}
              disabled={pending}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface WaterButtonProps {
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "add" | "remove";
}

function WaterButton({
  label,
  icon,
  trailing,
  onClick,
  disabled,
  variant = "add",
}: WaterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-pill px-3 py-1.5 text-[13px] font-medium transition-all active:scale-95",
        variant === "remove"
          ? "bg-destructive/10 text-destructive hover:bg-destructive/15 active:bg-destructive/20"
          : "bg-subtle text-muted-foreground hover:bg-subtle/70 active:bg-sky-500/15 active:text-sky-600",
        "disabled:opacity-40 disabled:active:scale-100"
      )}
    >
      {icon}
      {trailing}
      <span>{label}</span>
    </button>
  );
}
