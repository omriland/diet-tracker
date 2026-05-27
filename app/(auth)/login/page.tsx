"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FirebaseSetupHelp } from "@/components/auth/firebase-setup-help";
import { useAuth } from "@/components/providers/auth-provider";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase/config";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [showSetupHelp, setShowSetupHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  async function handleSignIn() {
    setSigningIn(true);
    setShowSetupHelp(false);
    try {
      await signInWithGoogle();
      router.replace("/");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      const code =
        error instanceof FirebaseError ? error.code : "unknown";
      const message =
        getFirebaseAuthErrorMessage(code) ??
        (error instanceof Error ? error.message : "Sign-in failed");
      toast.error(message);
      if (
        code === "auth/configuration-not-found" ||
        code === "auth/operation-not-allowed"
      ) {
        setShowSetupHelp(true);
      }
    } finally {
      setSigningIn(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="pulse-dot text-muted-foreground text-2xl">·</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-12 px-6">
      <div className="text-center">
        <h1
          className="text-5xl italic leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          diet.
        </h1>
        <p className="text-muted-foreground mt-5 text-[11px] tracking-[0.22em] uppercase">
          A quiet calorie & weight journal
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={handleSignIn}
          disabled={signingIn}
        >
          {signingIn ? "Signing in…" : "Continue with Google"}
        </Button>

        <button
          type="button"
          onClick={() => setShowAbout((v) => !v)}
          className="text-muted-foreground hover:text-foreground text-center text-xs underline-offset-4 hover:underline"
        >
          {showAbout ? "Hide" : "What is this?"}
        </button>

        {showAbout && (
          <div className="border-hairline bg-surface/40 mt-1 rounded-xl border p-4">
            <p className="text-foreground/85 text-sm leading-relaxed">
              A personal app for logging meals in Hebrew and tracking weight.
              AI estimates calories so you don&rsquo;t pick from a database.
              Single-user, free to run, by{" "}
              <span className="italic">Omri</span>.
            </p>
          </div>
        )}

        {showSetupHelp && <FirebaseSetupHelp />}
      </div>
    </div>
  );
}
