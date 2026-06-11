"use client";

import { useEffect, useRef, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Check, Droplet, Dumbbell, Flame, LogOut, Minus, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getClientDb } from "@/lib/firebase/client";
import { userDoc } from "@/lib/firestore/paths";
import { cn } from "@/lib/utils";
import {
  DEFAULT_WEEKDAY_TARGET,
  DEFAULT_WEEKEND_TARGET,
  DEFAULT_SPORT_BONUS,
  DEFAULT_WATER_TARGET_ML,
} from "@/types/user";

type NumericField =
  | "weekdayCalorieTarget"
  | "weekendCalorieTarget"
  | "defaultSportBonus"
  | "waterTargetMl";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const uid = user?.uid;
  const { profile, loading } = useUserProfile(uid);

  return (
    <div className="editorial-in">
      <header className="pt-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Tune it
        </p>
        <h1 className="font-display mt-0.5 text-[34px] font-bold leading-none text-foreground">
          Settings
        </h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="pulse-dot text-2xl text-muted-foreground">·</span>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <SettingsCard
            icon={Flame}
            tint="#CDFB51"
            title="Calorie targets"
            subtitle="Israeli week — weekend is Friday & Saturday."
          >
            <StepperField
              key={`wd-${profile?.weekdayCalorieTarget}`}
              uid={uid}
              field="weekdayCalorieTarget"
              label="Sun – Thu"
              unit="kcal"
              step={50}
              min={500}
              max={10000}
              initial={profile?.weekdayCalorieTarget ?? DEFAULT_WEEKDAY_TARGET}
            />
            <StepperField
              key={`we-${profile?.weekendCalorieTarget}`}
              uid={uid}
              field="weekendCalorieTarget"
              label="Fri – Sat"
              unit="kcal"
              step={50}
              min={500}
              max={10000}
              initial={profile?.weekendCalorieTarget ?? DEFAULT_WEEKEND_TARGET}
            />
          </SettingsCard>

          <SettingsCard
            icon={Dumbbell}
            tint="#FFC95C"
            title="Sport bonus"
            subtitle="Extra calories added to your target on sport days."
          >
            <StepperField
              key={`sport-${profile?.defaultSportBonus}`}
              uid={uid}
              field="defaultSportBonus"
              label="Default bonus"
              unit="kcal"
              step={50}
              min={50}
              max={2000}
              initial={profile?.defaultSportBonus ?? DEFAULT_SPORT_BONUS}
            />
          </SettingsCard>

          <SettingsCard
            icon={Droplet}
            tint="#5BD1F5"
            title="Water goal"
            subtitle="How much you aim to drink each day."
          >
            <StepperField
              key={`water-${profile?.waterTargetMl}`}
              uid={uid}
              field="waterTargetMl"
              label="Daily goal"
              unit="L"
              step={250}
              min={500}
              max={10000}
              initial={profile?.waterTargetMl ?? DEFAULT_WATER_TARGET_ML}
              format={(ml) => (ml / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              parse={(s) => {
                const liters = parseFloat(s);
                return Number.isNaN(liters) ? NaN : Math.round(liters * 1000);
              }}
            />
          </SettingsCard>

          <section className="glass rounded-3xl px-5 py-5">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-11 w-11 rounded-full ring-1 ring-white/15"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-[15px] font-bold text-foreground">
                  {(user?.email ?? "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-foreground">
                  {user?.displayName ?? "Signed in"}
                </p>
                <p className="truncate text-[13px] text-muted-foreground">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                aria-label="Sign out"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive transition-all hover:bg-destructive/15 active:scale-90"
              >
                <LogOut className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  tint,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  tint: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-3xl px-5 py-5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${tint}1F`, color: tint }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden />
        </span>
        <div>
          <p className="text-[15px] font-bold leading-tight text-foreground">{title}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

interface StepperFieldProps {
  uid: string | undefined;
  field: NumericField;
  label: string;
  unit: string;
  step: number;
  min: number;
  max: number;
  initial: number;
  /** Display transform (e.g. ml → liters). Defaults to the raw number. */
  format?: (value: number) => string;
  /** Parse typed input back to the stored unit. Defaults to parseInt. */
  parse?: (input: string) => number;
}

/**
 * Tap −/+ to nudge, or tap the number to type. Saves automatically
 * (debounced) and flashes a check when the write lands.
 */
function StepperField({
  uid,
  field,
  label,
  unit,
  step,
  min,
  max,
  initial,
  format = (v) => v.toLocaleString(),
  parse = (s) => parseInt(s, 10),
}: StepperFieldProps) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function scheduleSave(next: number) {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => void commit(next), 700);
  }

  async function commit(next: number) {
    if (!uid || next === initial) return;
    try {
      await updateDoc(doc(getClientDb(), userDoc(uid)), { [field]: next });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    } catch {
      toast.error("Couldn't save — try again");
      setValue(initial);
    }
  }

  function nudge(delta: number) {
    setEditing(false);
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    setValue(next);
    scheduleSave(next);
  }

  function startEditing() {
    setDraft(format(value).replace(/,/g, ""));
    setEditing(true);
    window.setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitDraft() {
    setEditing(false);
    const parsed = parse(draft);
    if (Number.isNaN(parsed) || parsed < min || parsed > max) {
      toast.error(`Must be between ${format(min)} and ${format(max)} ${unit}`);
      return;
    }
    if (parsed === value) return;
    setValue(parsed);
    scheduleSave(parsed);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-sm text-foreground/85">
        {label}
        <Check
          className={cn(
            "h-3.5 w-3.5 text-accent transition-opacity duration-300",
            saved ? "opacity-100" : "opacity-0"
          )}
          strokeWidth={3}
          aria-hidden
        />
      </span>
      <div className="flex items-center gap-1">
        <StepButton ariaLabel={`Decrease ${label}`} onClick={() => nudge(-step)}>
          <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </StepButton>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") inputRef.current?.blur();
              if (e.key === "Escape") setEditing(false);
            }}
            className="font-display w-24 rounded-xl bg-white/5 px-1 py-1.5 text-center text-[16px] font-bold tabular-nums text-foreground outline-none ring-2 ring-accent"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="font-display w-24 rounded-xl py-1.5 text-center text-[16px] font-bold tabular-nums text-foreground transition-colors hover:bg-white/5"
            title="Tap to type a value"
          >
            {format(value)}
            <span className="ml-1 text-[11px] font-semibold text-muted-foreground">{unit}</span>
          </button>
        )}
        <StepButton ariaLabel={`Increase ${label}`} onClick={() => nudge(step)}>
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/6 text-foreground transition-all hover:bg-white/10 active:scale-90"
    >
      {children}
    </button>
  );
}
