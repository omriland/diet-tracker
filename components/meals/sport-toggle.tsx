"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { setDayMetaSport, updateDayMetaSportBonus } from "@/lib/firestore/day-meta";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import { cn } from "@/lib/utils";

const BONUS_PRESETS = [150, 250, 350, 500];

interface SportToggleProps {
  uid: string;
  date: string;
  active: boolean;
  bonusKcal: number;
  defaultBonus: number;
}

export function SportToggle({ uid, date, active, bonusKcal, defaultBonus }: SportToggleProps) {
  const [open, setOpen] = useState(false);
  const bonus = bonusKcal || SPORT_BONUS_KCAL;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-pressed={active}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3 py-1.5 text-[13px] font-bold transition-all active:scale-95",
          active
            ? "glow-accent bg-accent text-accent-foreground"
            : "glass text-muted-foreground hover:text-foreground"
        )}
      >
        <Dumbbell className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
        <span>Sport</span>
        {active && <span className="tabular-nums">+{bonus}</span>}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" showCloseButton={true}>
          {open && (
            <SportSheetForm
              uid={uid}
              date={date}
              active={active}
              currentBonus={active ? bonus : defaultBonus || SPORT_BONUS_KCAL}
              onClose={() => setOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function SportSheetForm({
  uid,
  date,
  active,
  currentBonus,
  onClose,
}: {
  uid: string;
  date: string;
  active: boolean;
  currentBonus: number;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(currentBonus);
  const [custom, setCustom] = useState(
    BONUS_PRESETS.includes(currentBonus) ? "" : String(currentBonus)
  );
  const [saving, setSaving] = useState(false);

  const customNum = parseInt(custom, 10);
  const usingCustom = custom !== "";
  const value = usingCustom ? customNum : selected;
  const valid = !Number.isNaN(value) && value > 0 && value <= 2000;

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    try {
      if (active) {
        await updateDayMetaSportBonus(uid, date, value);
      } else {
        await setDayMetaSport(uid, date, true, value);
      }
      onClose();
    } catch {
      toast.error("Couldn't save sport day");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (saving) return;
    setSaving(true);
    try {
      await setDayMetaSport(uid, date, false);
      onClose();
    } catch {
      toast.error("Couldn't update sport day");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-2">
      <header className="pr-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Move more, eat more
        </p>
        <h2 className="font-display mt-0.5 flex items-center gap-2 text-[24px] font-bold leading-none text-foreground">
          <Dumbbell className="h-5 w-5 text-accent" strokeWidth={2.2} aria-hidden />
          Sport day
        </h2>
      </header>

      <p className="text-sm text-muted-foreground">
        Trained today? Add bonus calories to your daily target.
      </p>

      <div className="grid grid-cols-4 gap-2">
        {BONUS_PRESETS.map((preset) => {
          const isSelected = !usingCustom && selected === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setSelected(preset);
                setCustom("");
              }}
              aria-pressed={isSelected}
              className={cn(
                "font-display rounded-2xl border py-3 text-[16px] font-bold tabular-nums transition-all active:scale-95",
                isSelected
                  ? "border-accent/50 bg-accent-soft text-accent"
                  : "border-white/8 bg-white/3 text-muted-foreground hover:text-foreground"
              )}
            >
              +{preset}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Custom amount"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="font-display w-full rounded-2xl bg-white/5 px-4 py-3 pr-14 text-[17px] font-bold tabular-nums text-foreground outline-none ring-1 ring-white/10 transition-shadow placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-accent"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
          kcal
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="accent"
          size="lg"
          disabled={!valid || saving}
          onClick={() => void save()}
          className="w-full"
        >
          {saving
            ? "Saving…"
            : active
              ? `Update bonus to +${valid ? value : "—"}`
              : `Add sport day · +${valid ? value : "—"} kcal`}
        </Button>
        {active && (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            disabled={saving}
            onClick={() => void remove()}
            className="w-full"
          >
            Remove sport day
          </Button>
        )}
      </div>
    </div>
  );
}
