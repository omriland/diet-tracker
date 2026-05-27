"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, Copy, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EstimateCancelledError,
  fetchMealEstimate,
} from "@/lib/estimation/fetch-estimate";
import type { MealEstimate } from "@/lib/anthropic/schemas";
import type { MealSlot } from "@/types/meal";
import { MEAL_SLOTS } from "@/types/meal";
import { cn } from "@/lib/utils";

type EstimateSource = "AI" | "AI_CACHED";

interface AddMealSheetProps {
  open: boolean;
  slot: MealSlot | null;
  uid: string | undefined;
  onOpenChange: (open: boolean) => void;
  onConfirm: (params: {
    text: string;
    estimate: MealEstimate;
    source: EstimateSource;
  }) => Promise<void>;
  onManualSave: (params: { text: string; calories: number }) => Promise<void>;
}

export function AddMealSheet({
  open,
  slot,
  uid,
  onOpenChange,
  onConfirm,
  onManualSave,
}: AddMealSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false}>
        {slot && uid && (
          <AddMealFlow
            key={slot}
            slot={slot}
            uid={uid}
            onConfirm={onConfirm}
            onManualSave={onManualSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

type Phase =
  | { kind: "idle" }
  | { kind: "estimating" }
  | { kind: "preview"; estimate: MealEstimate; source: EstimateSource }
  | { kind: "failed"; message: string };

function AddMealFlow({
  slot,
  uid,
  onConfirm,
  onManualSave,
  onClose,
}: {
  slot: MealSlot;
  uid: string;
  onConfirm: AddMealSheetProps["onConfirm"];
  onManualSave: AddMealSheetProps["onManualSave"];
  onClose: () => void;
}) {
  const slotMeta = MEAL_SLOTS.find((s) => s.slot === slot);
  const [text, setText] = useState("");
  const [clarification, setClarification] = useState("");
  const [manualCal, setManualCal] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  // Cancel any in-flight estimate when the sheet unmounts
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function runEstimate(textToSend: string) {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPhase({ kind: "estimating" });
    try {
      const { estimate, source } = await fetchMealEstimate(
        uid,
        textToSend,
        ctrl.signal
      );
      if (ctrl.signal.aborted) return;
      setPhase({ kind: "preview", estimate, source });
    } catch (err) {
      if (err instanceof EstimateCancelledError) return;
      const message =
        err instanceof Error
          ? err.message
          : "Could not estimate calories";
      setPhase({ kind: "failed", message });
    }
  }

  function handleEstimate() {
    const trimmed = text.trim();
    if (!trimmed) return;
    void runEstimate(trimmed);
  }

  function handleRefine() {
    const refinementText = clarification.trim();
    if (!refinementText) return;
    const combined = `${text.trim()}\n\n(הבהרה: ${refinementText})`;
    void runEstimate(combined);
  }

  function handleEditText() {
    abortRef.current?.abort();
    setPhase({ kind: "idle" });
    setClarification("");
    setManualCal("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function handleSaveEstimate() {
    if (phase.kind !== "preview") return;
    setSaving(true);
    try {
      await onConfirm({
        text: text.trim(),
        estimate: phase.estimate,
        source: phase.source,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleManualSave() {
    const c = parseInt(manualCal, 10);
    if (Number.isNaN(c) || c <= 0) return;
    setSaving(true);
    try {
      await onManualSave({ text: text.trim(), calories: c });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-h-[82dvh] flex-col gap-5 pt-2 pb-1">
      <header className="flex items-baseline justify-between">
        <h2
          className="font-display text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {slotMeta?.label}
        </h2>
        <button
          type="button"
          onClick={() => {
            abortRef.current?.abort();
            onClose();
          }}
          className="text-muted-foreground hover:text-foreground text-[11px] tracking-[0.18em] uppercase"
        >
          Cancel
        </button>
      </header>

      {/* The meal text. Read-only once estimating/preview/failed, so the user
          knows what was sent. They can hit "Edit" to go back to idle. */}
      {phase.kind === "idle" ? (
        <textarea
          ref={inputRef}
          dir="auto"
          lang="he"
          rows={3}
          placeholder="חביתה משתי ביצים עם לחם"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleEstimate();
            }
          }}
          className="border-hairline focus:border-accent placeholder:text-muted-foreground/60 w-full resize-none border-b bg-transparent pb-3 text-[20px] leading-snug text-foreground outline-none"
        />
      ) : (
        <div className="flex items-start justify-between gap-3 pb-3">
          <p
            dir="auto"
            lang="he"
            className="flex-1 text-[18px] leading-snug text-foreground/85"
          >
            {text}
          </p>
          <button
            type="button"
            onClick={handleEditText}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] tracking-[0.18em] uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Edit
          </button>
        </div>
      )}

      {/* Scrollable result area */}
      <div className="flex-1 overflow-y-auto">
        {phase.kind === "idle" && (
          <p className="text-muted-foreground/70 text-xs">
            Type what you ate in Hebrew or English. AI will estimate calories
            before saving.
          </p>
        )}

        {phase.kind === "estimating" && (
          <div className="flex items-center gap-3 py-6">
            <span className="pulse-dot text-accent text-xl">·</span>
            <p className="text-muted-foreground text-sm">
              Estimating calories…
            </p>
          </div>
        )}

        {phase.kind === "preview" && (
          <EstimatePreview
            estimate={phase.estimate}
            source={phase.source}
            clarification={clarification}
            onClarificationChange={setClarification}
            onRefine={handleRefine}
          />
        )}

        {phase.kind === "failed" && (
          <FailedPanel
            message={phase.message}
            manualCal={manualCal}
            onManualCalChange={setManualCal}
            onRetry={() => void runEstimate(text.trim())}
            onManualSave={() => void handleManualSave()}
            saving={saving}
          />
        )}
      </div>

      {/* Footer buttons depend on phase */}
      {phase.kind === "idle" && (
        <Button
          type="button"
          variant="accent"
          size="lg"
          disabled={!text.trim()}
          onClick={handleEstimate}
          className="w-full"
        >
          Estimate calories
        </Button>
      )}

      {phase.kind === "preview" && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="accent"
            size="lg"
            disabled={saving}
            onClick={() => void handleSaveEstimate()}
            className="w-full"
          >
            {saving ? "Saving…" : "Save meal"}
          </Button>
          <button
            type="button"
            onClick={() => void runEstimate(text.trim())}
            className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 py-2 text-[11px] tracking-[0.18em] uppercase"
          >
            <RotateCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Re-estimate
          </button>
        </div>
      )}
    </div>
  );
}

function EstimatePreview({
  estimate,
  source,
  clarification,
  onClarificationChange,
  onRefine,
}: {
  estimate: MealEstimate;
  source: EstimateSource;
  clarification: string;
  onClarificationChange: (v: string) => void;
  onRefine: () => void;
}) {
  const annotations: string[] = [];
  if (source === "AI_CACHED") annotations.push("cached");
  if (estimate.searched) annotations.push("web");
  if (estimate.confidence === "low") annotations.push("low confidence");
  else if (estimate.confidence === "medium") annotations.push("medium confidence");

  return (
    <div className="flex flex-col gap-5">
      {/* Total */}
      <div className="flex items-baseline justify-between border-b border-hairline pb-3">
        <div className="flex items-baseline gap-2">
          <span
            className="text-4xl leading-none tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {estimate.calories}
          </span>
          <span className="text-muted-foreground text-sm">kcal</span>
        </div>
        {annotations.length > 0 && (
          <span className="text-muted-foreground text-[10px] tracking-[0.18em] uppercase">
            {annotations.join(" · ")}
          </span>
        )}
      </div>

      {/* Clarification (when AI flagged low confidence) */}
      {estimate.confidence === "low" && estimate.needsClarificationHe && (
        <div className="border-warning/30 bg-warning/5 flex flex-col gap-3 rounded-xl border p-3.5">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="text-warning mt-0.5 h-4 w-4 shrink-0"
              strokeWidth={1.5}
            />
            <p
              dir="auto"
              lang="he"
              className="text-warning text-end text-sm leading-relaxed"
            >
              {estimate.needsClarificationHe}
            </p>
          </div>
          <Input
            dir="auto"
            lang="he"
            value={clarification}
            placeholder="הוסף פרטים…"
            onChange={(e) => onClarificationChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && clarification.trim()) {
                e.preventDefault();
                onRefine();
              }
            }}
            className="bg-background"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!clarification.trim()}
            onClick={onRefine}
            className="self-end"
          >
            Refine estimate
          </Button>
        </div>
      )}

      {/* Breakdown */}
      {estimate.breakdown.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-2 text-[11px] tracking-[0.18em] uppercase">
            Breakdown
          </p>
          <ul className="divide-y divide-hairline">
            {estimate.breakdown.map((item, i) => (
              <li
                key={`${item.itemEn}-${i}`}
                className="flex items-center justify-between py-2"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    dir="auto"
                    lang="he"
                    className="text-sm leading-snug"
                  >
                    {item.itemHe}
                  </span>
                  {item.portionGrams != null && (
                    <span
                      className="text-muted-foreground text-xs tabular-nums"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.portionGrams} g
                    </span>
                  )}
                </span>
                <span
                  className="shrink-0 text-sm tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.calories}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reasoning + assumptions, collapsed under a single muted block */}
      {(estimate.reasoningHe || estimate.assumptionsHe.length > 0) && (
        <details className="group">
          <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-[11px] tracking-[0.18em] uppercase list-none">
            <span className="group-open:hidden">Show reasoning</span>
            <span className="hidden group-open:inline">Hide reasoning</span>
          </summary>
          <div className="mt-2.5 flex flex-col gap-3">
            {estimate.reasoningHe && (
              <p
                dir="auto"
                lang="he"
                className="text-foreground/85 text-end text-sm leading-relaxed"
              >
                {estimate.reasoningHe}
              </p>
            )}
            {estimate.assumptionsHe.length > 0 && (
              <ul className="flex flex-col gap-1" dir="auto" lang="he">
                {estimate.assumptionsHe.map((a) => (
                  <li
                    key={a}
                    className="text-foreground/70 text-end text-sm"
                  >
                    · {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

function FailedPanel({
  message,
  manualCal,
  onManualCalChange,
  onRetry,
  onManualSave,
  saving,
}: {
  message: string;
  manualCal: string;
  onManualCalChange: (v: string) => void;
  onRetry: () => void;
  onManualSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ErrorReport message={message} />


      <div className="flex flex-col gap-2">
        <Label htmlFor="manual-cal">Enter calories manually</Label>
        <div className="border-hairline focus-within:border-accent flex items-baseline gap-3 border-b pb-2 transition-colors">
          <input
            id="manual-cal"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={manualCal}
            onChange={(e) => onManualCalChange(e.target.value)}
            className={cn(
              "placeholder:text-muted-foreground/40 flex-1 bg-transparent text-3xl leading-none tabular-nums text-foreground outline-none"
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <span className="text-muted-foreground text-sm">kcal</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onRetry}
          disabled={saving}
          className="flex-1"
        >
          <RotateCw className="h-4 w-4" strokeWidth={1.5} />
          Retry
        </Button>
        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={onManualSave}
          disabled={saving || !manualCal.trim()}
          className="flex-1"
        >
          {saving ? "Saving…" : "Save manual"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Shows the error in a copyable code block so the user can paste it into
 * a bug report. Includes the timestamp + UA for context.
 */
function ErrorReport({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);

  const fullReport = [
    `Time: ${new Date().toISOString()}`,
    `Error: ${message}`,
    typeof navigator !== "undefined" ? `UA: ${navigator.userAgent}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullReport);
      setCopied(true);
      toast.success("Error copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select and copy manually.");
    }
  }

  return (
    <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-xl border p-3.5">
      <div className="flex items-start gap-2">
        <AlertTriangle
          className="text-destructive mt-0.5 h-4 w-4 shrink-0"
          strokeWidth={1.5}
        />
        <div className="min-w-0 flex-1">
          <p className="text-destructive text-sm leading-relaxed">
            AI estimate failed
          </p>
          <pre
            className="text-destructive/85 mt-1.5 max-h-32 overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {message}
          </pre>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="text-destructive/80 hover:text-destructive border-destructive/30 hover:bg-destructive/10 inline-flex items-center justify-center gap-1.5 self-start rounded-md border px-2.5 py-1 text-[11px] tracking-[0.16em] uppercase transition-colors"
      >
        {copied ? (
          <Check className="h-3 w-3" strokeWidth={1.5} />
        ) : (
          <Copy className="h-3 w-3" strokeWidth={1.5} />
        )}
        {copied ? "Copied" : "Copy details"}
      </button>
    </div>
  );
}
