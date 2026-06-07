/**
 * Build version identity.
 *
 * `BUILD_ID` is inlined into the client bundle at build time (via
 * `NEXT_PUBLIC_BUILD_ID` in `next.config.ts`), so a running tab always knows
 * the version it booted with. The `/version` route serves the current
 * deployment's value fresh, and `VersionWatcher` compares the two.
 */
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? "unknown";
