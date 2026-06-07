"use client";

import { useRef, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getClientDb } from "@/lib/firebase/client";
import { userDoc } from "@/lib/firestore/paths";
import { litersToMl, mlToLitersInput } from "@/lib/meals/water";
import {
  DEFAULT_WEEKDAY_TARGET,
  DEFAULT_WEEKEND_TARGET,
  DEFAULT_SPORT_BONUS,
  DEFAULT_WATER_TARGET_ML,
} from "@/types/user";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const uid = user?.uid;
  const { profile, loading } = useUserProfile(uid);

  return (
    <div className="editorial-in">
      <header className="border-b border-hairline py-4">
        <h1 className="text-[22px] font-bold text-foreground">Settings</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="pulse-dot text-2xl text-muted-foreground">·</span>
        </div>
      ) : (
        <div className="flex flex-col">
          <section className="border-b border-hairline py-5">
            <p className="text-[15px] font-bold text-foreground">Daily calorie target</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Israeli week — weekend is Friday & Saturday.
            </p>
            <div className="mt-5 flex flex-col gap-5">
              <TargetField
                key={`wd-${profile?.weekdayCalorieTarget}`}
                uid={uid}
                field="weekdayCalorieTarget"
                label="Sun – Thu"
                initial={profile?.weekdayCalorieTarget ?? DEFAULT_WEEKDAY_TARGET}
              />
              <TargetField
                key={`we-${profile?.weekendCalorieTarget}`}
                uid={uid}
                field="weekendCalorieTarget"
                label="Fri – Sat"
                initial={profile?.weekendCalorieTarget ?? DEFAULT_WEEKEND_TARGET}
              />
            </div>
          </section>

          <section className="border-b border-hairline py-5">
            <p className="text-[15px] font-bold text-foreground">Sport bonus</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Calories added to your daily target when you log a sport day.
            </p>
            <div className="mt-5">
              <TargetField
                key={`sport-${profile?.defaultSportBonus}`}
                uid={uid}
                field="defaultSportBonus"
                label="Bonus calories"
                initial={profile?.defaultSportBonus ?? DEFAULT_SPORT_BONUS}
              />
            </div>
          </section>

          <section className="border-b border-hairline py-5">
            <p className="text-[15px] font-bold text-foreground">Daily water target</p>
            <p className="mt-1 text-sm text-muted-foreground">
              How much you aim to drink each day.
            </p>
            <div className="mt-5">
              <WaterTargetField
                key={`water-${profile?.waterTargetMl}`}
                uid={uid}
                initialMl={profile?.waterTargetMl ?? DEFAULT_WATER_TARGET_ML}
              />
            </div>
          </section>

          <section className="border-b border-hairline py-5">
            <p className="text-[15px] font-bold text-foreground">Account</p>
            <p className="mt-2 text-sm text-foreground/85">{user?.email}</p>
            <Button
              variant="destructive"
              size="default"
              className="mt-4"
              onClick={() => void signOut()}
            >
              Sign out
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}

interface TargetFieldProps {
  uid: string | undefined;
  field: "weekdayCalorieTarget" | "weekendCalorieTarget" | "defaultSportBonus";
  label: string;
  initial: number;
}

function TargetField({ uid, field, label, initial }: TargetFieldProps) {
  const [value, setValue] = useState(String(initial));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function commit() {
    if (!uid) return;
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 500 || parsed > 10000) {
      toast.error("Target must be between 500 and 10,000");
      setValue(String(initial));
      return;
    }
    if (parsed === initial) return;
    setSaving(true);
    try {
      await updateDoc(doc(getClientDb(), userDoc(uid)), { [field]: parsed });
      toast.success("Target updated");
    } catch {
      toast.error("Couldn't save target");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-foreground/85">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") inputRef.current?.blur();
          }}
          className="flex-1 rounded-xl bg-subtle px-4 py-3 text-[17px] tabular-nums text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
        <span className="text-sm text-muted-foreground">{saving ? "saving…" : "kcal"}</span>
      </div>
    </div>
  );
}

interface WaterTargetFieldProps {
  uid: string | undefined;
  initialMl: number;
}

function WaterTargetField({ uid, initialMl }: WaterTargetFieldProps) {
  const [value, setValue] = useState(mlToLitersInput(initialMl));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function commit() {
    if (!uid) return;
    const ml = litersToMl(value);
    if (ml === null || ml < 500 || ml > 10000) {
      toast.error("Water target must be between 0.5 and 10 L");
      setValue(mlToLitersInput(initialMl));
      return;
    }
    if (ml === initialMl) {
      setValue(mlToLitersInput(ml));
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(getClientDb(), userDoc(uid)), { waterTargetMl: ml });
      setValue(mlToLitersInput(ml));
      toast.success("Water target updated");
    } catch {
      toast.error("Couldn't save water target");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-foreground/85">Goal</p>
      <div className="mt-2 flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0.5"
          max="10"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") inputRef.current?.blur();
          }}
          className="flex-1 rounded-xl bg-subtle px-4 py-3 text-[17px] tabular-nums text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
        <span className="text-sm text-muted-foreground">{saving ? "saving…" : "L"}</span>
      </div>
    </div>
  );
}
