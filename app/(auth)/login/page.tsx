"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FirebaseSetupHelp } from "@/components/auth/firebase-setup-help";
import { useAuth } from "@/components/providers/auth-provider";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase/config";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [showSetupHelp, setShowSetupHelp] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(`/day/${getJerusalemDateString()}`);
    }
  }, [user, loading, router]);

  async function handleSignIn() {
    setSigningIn(true);
    setShowSetupHelp(false);
    try {
      await signInWithGoogle();
      router.replace(`/day/${getJerusalemDateString()}`);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      const code = error instanceof FirebaseError ? error.code : "unknown";
      const message =
        getFirebaseAuthErrorMessage(code) ??
        (error instanceof Error ? error.message : "Sign-in failed");
      toast.error(message);
      if (code === "auth/configuration-not-found" || code === "auth/operation-not-allowed") {
        setShowSetupHelp(true);
      }
    } finally {
      setSigningIn(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <span className="pulse-dot text-2xl text-muted-foreground">·</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-between bg-background px-6 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-[max(env(safe-area-inset-top),2rem)]">
      <div className="ambient-scene" aria-hidden />

      <div />

      <div className="editorial-in flex w-full flex-col items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt=""
            width={40}
            height={40}
            priority
            className="rounded-xl"
          />
          <h1 className="font-display text-[36px] font-bold leading-none text-foreground">
            Diet
          </h1>
        </div>

        <LiveEstimateDemo />
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button
          variant="accent"
          size="lg"
          className="glow-accent w-full gap-2.5"
          onClick={handleSignIn}
          disabled={signingIn}
        >
          <GoogleMark />
          {signingIn ? "Signing in…" : "Continue with Google"}
        </Button>
        {showSetupHelp && <FirebaseSetupHelp />}
      </div>
    </div>
  );
}

const DEMO_MEALS = [
  { he: "חביתה עם סלט קצוץ", kcal: 220 },
  { he: "שניצל עם פירה", kcal: 680 },
  { he: "קפה הפוך וקרואסון", kcal: 310 },
];

const TYPE_MS = 70;

type DemoPhase = "typing" | "thinking" | "result" | "exit";

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

/**
 * The product, demoed in a loop: a Hebrew meal types itself out,
 * the AI "thinks", and the calories count up — no copy needed.
 */
function LiveEstimateDemo() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>("typing");
  const [chars, setChars] = useState(0);
  const meal = DEMO_MEALS[index % DEMO_MEALS.length];

  useEffect(() => {
    if (reduced) return;
    let t: number;
    if (phase === "typing") {
      t = window.setTimeout(
        () => {
          if (chars < meal.he.length) setChars((c) => c + 1);
          else setPhase("thinking");
        },
        chars === 0 ? 600 : chars < meal.he.length ? TYPE_MS : 400
      );
    } else if (phase === "thinking") {
      t = window.setTimeout(() => setPhase("result"), 1200);
    } else if (phase === "result") {
      t = window.setTimeout(() => setPhase("exit"), 2100);
    } else {
      t = window.setTimeout(() => {
        setIndex((i) => i + 1);
        setChars(0);
        setPhase("typing");
      }, 450);
    }
    return () => window.clearTimeout(t);
  }, [phase, chars, meal.he.length, reduced]);

  const typed = reduced ? meal.he : meal.he.slice(0, chars);
  const showResult = reduced || phase === "result";

  return (
    <div className="glass mt-10 w-full overflow-hidden rounded-3xl px-5 py-5">
      <div
        className={
          phase === "exit"
            ? "-translate-y-2 opacity-0 transition-all duration-400"
            : "translate-y-0 opacity-100 transition-all duration-200"
        }
      >
        <p
          dir="rtl"
          lang="he"
          className="min-h-[30px] text-[19px] leading-snug text-foreground"
        >
          {typed}
          {!reduced && phase === "typing" && <span className="login-caret" aria-hidden />}
        </p>

        <div className="mt-4 flex min-h-[36px] items-center justify-between">
          {phase === "thinking" && !reduced ? (
            <span className="flex items-center gap-1.5" aria-label="Estimating">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="login-think-dot"
                  style={{ animationDelay: `${d * 180}ms` }}
                />
              ))}
            </span>
          ) : showResult ? (
            <span
              key={`r-${index}`}
              className="login-chip-pop font-display inline-flex items-baseline gap-1.5 rounded-pill bg-accent-soft px-3.5 py-1.5 text-[17px] font-bold text-accent"
            >
              ≈ <CountUp value={meal.kcal} animate={!reduced} />
              <span className="text-[11px] font-semibold opacity-70">kcal</span>
            </span>
          ) : (
            <span />
          )}

          <Sparkles
            className={
              phase === "thinking" && !reduced
                ? "h-4 w-4 animate-pulse text-accent"
                : "h-4 w-4 text-muted-foreground/40"
            }
            strokeWidth={2}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

function CountUp({ value, animate }: { value: number; animate: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!animate) {
      el.textContent = String(value);
      return;
    }
    const duration = 650;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.07L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}
