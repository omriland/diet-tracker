"use client";

import { useEffect, useState } from "react";
import { Droplet, GlassWater, Minus, Plus } from "lucide-react";
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

  return (
    <div className="flex items-center justify-between gap-2 border-b border-hairline py-3">
      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        className="relative flex items-baseline gap-2"
        aria-expanded={editing}
        title="Tap to correct"
      >
        <Droplet
          className={cn(
            "h-3.5 w-3.5 self-center transition-colors",
            displayMl > 0 ? "text-sky-500" : "text-muted-foreground"
          )}
          strokeWidth={2}
          fill={displayMl > 0 ? "currentColor" : "none"}
          aria-hidden
        />
        <span className="text-sm text-muted-foreground">Water:</span>
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
              "water-float pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-[13px] font-bold tabular-nums",
              feedback.positive ? "text-sky-500" : "text-muted-foreground"
            )}
          >
            {feedback.text}
          </span>
        )}
      </button>

      <div className="flex shrink-0 items-center gap-2">
        {editing ? (
          <>
            <WaterButton
              label="Bottle"
              icon={<Minus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
              onClick={() => void change(-BOTTLE_ML, "1 L")}
              disabled={pending || displayMl <= 0}
            />
            <WaterButton
              label="Cup"
              icon={<Minus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
              onClick={() => void change(-CUP_ML, "220 ml")}
              disabled={pending || displayMl <= 0}
            />
          </>
        ) : (
          <>
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
}

function WaterButton({ label, icon, trailing, onClick, disabled }: WaterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-pill px-3 py-1.5 text-[13px] font-medium transition-all active:scale-95",
        "bg-subtle text-muted-foreground hover:bg-subtle/70 active:bg-sky-500/15 active:text-sky-600",
        "disabled:opacity-40 disabled:active:scale-100"
      )}
    >
      {icon}
      {trailing}
      <span>{label}</span>
    </button>
  );
}
