"use client";

import { useEffect, useState } from "react";
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
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-10 bg-background px-6">
      <div className="text-center">
        <h1 className="text-[32px] font-bold leading-none text-foreground">Diet</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A quiet calorie & weight journal
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button
          variant="accent"
          size="lg"
          className="w-full"
          onClick={handleSignIn}
          disabled={signingIn}
        >
          {signingIn ? "Signing in…" : "Continue with Google"}
        </Button>
        {showSetupHelp && <FirebaseSetupHelp />}
      </div>
    </div>
  );
}
