"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getClientDb } from "@/lib/firebase/client";
import { userDoc } from "@/lib/firestore/paths";
import {
  DEFAULT_WEEKDAY_TARGET,
  DEFAULT_WEEKEND_TARGET,
} from "@/types/user";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const uid = user?.uid;
  const { profile, loading } = useUserProfile(uid);
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <div className="editorial-in">
      <header className="flex items-center justify-between pt-6 pb-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="text-muted-foreground hover:text-foreground -ms-2 inline-flex items-center gap-1 py-1 ps-1 pe-2 text-[11px] tracking-[0.18em] uppercase transition-colors"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          Back
        </button>
        <p className="text-muted-foreground text-[11px] tracking-[0.22em] uppercase">
          Settings
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="pulse-dot text-muted-foreground text-xl">·</span>
        </div>
      ) : (
        <div className="flex flex-col gap-8 pt-4">
          <section>
            <p className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase">
              Daily calorie target
            </p>
            <p className="text-muted-foreground/80 mt-1 text-xs">
              Israeli week — weekend is Friday & Saturday.
            </p>

            <div className="mt-5 flex flex-col gap-6">
              <TargetField
                key={`wd-${profile?.weekdayCalorieTarget}`}
                uid={uid}
                field="weekdayCalorieTarget"
                label="Sun – Thu"
                sublabel="5 days"
                initial={profile?.weekdayCalorieTarget ?? DEFAULT_WEEKDAY_TARGET}
              />
              <TargetField
                key={`we-${profile?.weekendCalorieTarget}`}
                uid={uid}
                field="weekendCalorieTarget"
                label="Fri – Sat"
                sublabel="2 days"
                initial={profile?.weekendCalorieTarget ?? DEFAULT_WEEKEND_TARGET}
              />
            </div>

            <p className="text-muted-foreground mt-4 text-xs">
              Tap a number to edit. Changes save automatically.
            </p>
          </section>

          <div className="border-hairline border-t pt-6">
            <p className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase">
              Account
            </p>
            <p className="text-foreground/85 mt-2 text-sm">{user?.email}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => void signOut()}
            >
              Sign out
            </Button>
          </div>

          <div className="border-hairline border-t pt-6">
            <p className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase">
              About
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              <span
                className="text-foreground italic"
                style={{ fontFamily: "var(--font-display)" }}
              >
                diet.
              </span>{" "}
              — a single-user calorie & weight journal. Hebrew meal logging,
              AI-estimated calories. Built for one.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface TargetFieldProps {
  uid: string | undefined;
  field: "weekdayCalorieTarget" | "weekendCalorieTarget";
  label: string;
  sublabel: string;
  initial: number;
}

function TargetField({ uid, field, label, sublabel, initial }: TargetFieldProps) {
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
      await updateDoc(doc(getClientDb(), userDoc(uid)), {
        [field]: parsed,
      });
      toast.success("Target updated");
    } catch {
      toast.error("Couldn't save target");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-foreground/90 text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase">
          {sublabel}
        </p>
      </div>
      <div className="border-hairline focus-within:border-accent mt-2 flex items-baseline gap-3 border-b pb-2 transition-colors">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              inputRef.current?.blur();
            }
          }}
          className="placeholder:text-muted-foreground/40 flex-1 bg-transparent text-3xl leading-none tabular-nums text-foreground outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <span className="text-muted-foreground text-sm">
          {saving ? "saving…" : "kcal"}
        </span>
      </div>
    </div>
  );
}
