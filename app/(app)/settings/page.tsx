"use client";

import { useEffect, useRef, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getClientDb } from "@/lib/firebase/client";
import { userDoc } from "@/lib/firestore/paths";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const uid = user?.uid;
  const { profile, loading } = useUserProfile(uid);

  return (
    <div className="editorial-in">
      <header className="pt-6 pb-2">
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
          <TargetField
            key={profile?.dailyCalorieTarget ?? "default"}
            uid={uid}
            initialTarget={profile?.dailyCalorieTarget ?? 2000}
          />

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

function TargetField({
  uid,
  initialTarget,
}: {
  uid: string | undefined;
  initialTarget: number;
}) {
  const [value, setValue] = useState(String(initialTarget));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save on blur — quietly, with a small toast
  useEffect(() => {
    return () => {};
  }, []);

  async function commit() {
    if (!uid) return;
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 500 || parsed > 10000) {
      toast.error("Target must be between 500 and 10,000");
      setValue(String(initialTarget));
      return;
    }
    if (parsed === initialTarget) return;
    setSaving(true);
    try {
      await updateDoc(doc(getClientDb(), userDoc(uid)), {
        dailyCalorieTarget: parsed,
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
      <label
        htmlFor="target"
        className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase block"
      >
        Daily calorie target
      </label>
      <div className="border-hairline focus-within:border-accent mt-2 flex items-baseline gap-3 border-b pb-2 transition-colors">
        <input
          id="target"
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
          className="placeholder:text-muted-foreground/40 flex-1 bg-transparent text-4xl leading-none tabular-nums text-foreground outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <span className="text-muted-foreground text-sm">
          {saving ? "saving…" : "kcal"}
        </span>
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        Tap to edit. Changes save automatically.
      </p>
    </div>
  );
}
