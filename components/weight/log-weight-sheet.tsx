"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";

interface LogWeightSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultWeight?: number;
  onSave: (date: string, weightKg: number) => Promise<void>;
}

function LogWeightForm({
  defaultDate,
  defaultWeight,
  onSave,
  onCancel,
}: {
  defaultDate?: string;
  defaultWeight?: number;
  onSave: (date: string, weightKg: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(defaultDate ?? getJerusalemDateString());
  const [weight, setWeight] = useState(defaultWeight?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kg = parseFloat(weight);
    if (Number.isNaN(kg) || kg <= 0) return;
    setSaving(true);
    try {
      await onSave(date, Math.round(kg * 10) / 10);
    } finally {
      setSaving(false);
    }
  }

  const isEdit = defaultWeight != null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2 pb-1">
      <div className="flex items-baseline justify-between">
        <h2
          className="font-display text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isEdit ? "Edit weight" : "Log weight"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground text-[11px] tracking-[0.18em] uppercase"
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="weight-kg">Weight (kg)</Label>
        <div className="border-hairline focus-within:border-accent flex items-baseline gap-3 border-b pb-2 transition-colors">
          <input
            id="weight-kg"
            ref={inputRef}
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="78.4"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="placeholder:text-muted-foreground/40 flex-1 bg-transparent text-4xl leading-none tabular-nums text-foreground outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <span className="text-muted-foreground text-sm">kg</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="weight-date">Date</Label>
        <Input
          id="weight-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={saving || !weight}
        className="w-full"
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

export function LogWeightSheet({
  open,
  onOpenChange,
  defaultDate,
  defaultWeight,
  onSave,
}: LogWeightSheetProps) {
  const formKey = open
    ? `${defaultDate ?? "new"}-${defaultWeight ?? "new"}`
    : "closed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false}>
        {open && (
          <LogWeightForm
            key={formKey}
            defaultDate={defaultDate}
            defaultWeight={defaultWeight}
            onSave={async (date, weightKg) => {
              await onSave(date, weightKg);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
