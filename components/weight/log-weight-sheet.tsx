"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
  const canSave = !saving && weight.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2">
      <header className="flex items-center justify-between border-b border-hairline pb-3 pr-10">
        <h2 className="text-[18px] font-bold text-foreground">
          {isEdit ? "Edit weight" : "Log weight"}
        </h2>
      </header>

      <div className="flex flex-col gap-2">
        <label htmlFor="weight-kg" className="text-[15px] font-bold text-foreground">
          Weight (kg)
        </label>
        <div className="flex items-center gap-2">
          <input
            id="weight-kg"
            ref={inputRef}
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="78.4"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 rounded-xl bg-subtle px-4 py-3 text-[17px] tabular-nums text-foreground outline-none ring-2 ring-accent focus:ring-accent"
          />
          <span className="text-sm text-muted-foreground">kg</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="weight-date" className="text-[15px] font-bold text-foreground">
          Date
        </label>
        <input
          id="weight-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl bg-subtle px-4 py-3 text-[15px] text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={!canSave}
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
  const formKey = open ? `${defaultDate ?? "new"}-${defaultWeight ?? "new"}` : "closed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={true}>
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
