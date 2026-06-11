"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { MealSlot } from "@/types/meal";
import { MEAL_SLOTS } from "@/types/meal";
import { defaultSlotForTime } from "@/lib/meals/slot";
import { SLOT_ICON, SLOT_TINT } from "@/lib/meals/slot-style";

interface AddMealSheetProps {
  open: boolean;
  defaultSlot: MealSlot | null;
  uid: string | undefined;
  onOpenChange: (open: boolean) => void;
  onConfirm: (text: string, slot: MealSlot) => Promise<void>;
}

export function AddMealSheet({
  open,
  defaultSlot,
  uid,
  onOpenChange,
  onConfirm,
}: AddMealSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={true}>
        {open && uid && (
          <AddMealForm
            defaultSlot={defaultSlot}
            onConfirm={onConfirm}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function AddMealForm({
  defaultSlot,
  onConfirm,
  onClose,
}: {
  defaultSlot: MealSlot | null;
  onConfirm: AddMealSheetProps["onConfirm"];
  onClose: () => void;
}) {
  const [slot, setSlot] = useState<MealSlot>(defaultSlot ?? defaultSlotForTime());
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(trimmed, slot);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add meal";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const hasText = text.trim().length > 0;

  return (
    <div className="flex flex-col gap-5 pb-2">
      <header className="pr-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Log it
        </p>
        <h2 className="font-display mt-0.5 text-[24px] font-bold leading-none text-foreground">
          Add meal
        </h2>
      </header>

      <div className="grid grid-cols-4 gap-2">
        {MEAL_SLOTS.map(({ slot: s, label }) => {
          const Icon = SLOT_ICON[s];
          const tint = SLOT_TINT[s];
          const active = slot === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSlot(s)}
              aria-pressed={active}
              className={cnSlot(active)}
              style={
                active
                  ? { backgroundColor: tint.bg, color: tint.text, borderColor: `${tint.text}55` }
                  : undefined
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              <span className="text-[11px] font-bold">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          ref={inputRef}
          dir="auto"
          lang="he"
          rows={4}
          placeholder="…חביתה משתי ביצים עם פרוסת לחם"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              void handleAdd();
            }
          }}
          className="w-full resize-none rounded-2xl bg-white/5 p-4 text-base leading-snug text-foreground outline-none ring-1 ring-white/10 transition-shadow placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-accent"
        />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} aria-hidden />
          Describe it in Hebrew — AI estimates the calories
        </p>
      </div>

      <Button
        type="button"
        variant="accent"
        size="lg"
        disabled={!hasText || submitting}
        aria-busy={submitting}
        onClick={() => void handleAdd()}
        className="glow-accent w-full overflow-hidden"
      >
        Add meal
      </Button>
    </div>
  );
}

function cnSlot(active: boolean): string {
  return [
    "flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-3 transition-all active:scale-95",
    active
      ? "font-bold"
      : "border-white/8 bg-white/3 text-muted-foreground hover:text-foreground",
  ].join(" ");
}
