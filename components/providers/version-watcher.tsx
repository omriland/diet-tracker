"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { BUILD_ID } from "@/lib/version";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const TOAST_ID = "new-version-available";

/**
 * Watches for new deployments and invites the user to refresh.
 *
 * A long-lived tab (especially the iPhone home-screen PWA) keeps running stale
 * JS after a deploy. We compare the build id baked into this bundle against the
 * live one served by `/version`, polling on an interval and whenever the tab
 * regains focus. We also treat a chunk-load failure as a hard signal that the
 * deployment moved out from under us.
 */
export function VersionWatcher() {
  const promptedRef = useRef(false);

  useEffect(() => {
    if (BUILD_ID === "unknown") return;

    function promptRefresh() {
      if (promptedRef.current) return;
      promptedRef.current = true;
      toast.warning("A new version is available.", {
        id: TOAST_ID,
        duration: Infinity,
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
      });
    }

    let active = true;

    async function check() {
      if (promptedRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/version", { cache: "no-store" });
        if (!res.ok) return;
        const { buildId } = (await res.json()) as { buildId?: string };
        if (active && buildId && buildId !== BUILD_ID) promptRefresh();
      } catch {
        // Offline or transient — ignore and retry on the next tick.
      }
    }

    function onVisible() {
      if (!document.hidden) void check();
    }

    function onChunkError(event: Event) {
      const message =
        (event as ErrorEvent).message ??
        ((event as PromiseRejectionEvent).reason?.message as string | undefined);
      if (typeof message === "string" && /ChunkLoadError|Loading chunk|Importing a module script failed/i.test(message)) {
        promptRefresh();
      }
    }

    void check();
    const interval = window.setInterval(() => void check(), POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("error", onChunkError, true);
    window.addEventListener("unhandledrejection", onChunkError, true);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("error", onChunkError, true);
      window.removeEventListener("unhandledrejection", onChunkError, true);
    };
  }, []);

  return null;
}
