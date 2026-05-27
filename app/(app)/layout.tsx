"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/components/providers/auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <AppShellEmpty />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5 pb-28 pt-[max(env(safe-area-inset-top),0.5rem)]">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}

function AppShellEmpty() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <span
        className="pulse-dot text-muted-foreground text-2xl"
        aria-label="Loading"
      >
        ·
      </span>
    </div>
  );
}
