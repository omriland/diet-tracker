# Progress

## Status: v1 implemented

| Build step | Status | Notes |
|------------|--------|-------|
| PRD written | Done | `PRD.md` v0.1 |
| Memory bank + rules | Done | Agent context ready |
| Next.js scaffold | Done | Next.js 16, Tailwind, shadcn |
| Firebase + Auth + rules | Done | Google sign-in; rules in `firebase/` |
| Today view + meal flow | Done | Optimistic UI, cache, breakdown edit |
| `/api/estimate` + Claude | Done | Sonnet 4.6 + web search |
| Day navigation + edit/delete | Done | Swipe + arrows, manual override |
| Estimation cache | Done | 30-day TTL, normalized doc ID |
| Weight screen + graph | Done | Recharts, 30d/90d/1y/all |
| Settings + polish + deploy | Done | Target, sign out, PWA manifest |

## What works

- Google Auth gate and protected app shell with bottom nav
- Today / day views with 4 meal slots, Hebrew input, AI estimates
- Firestore real-time meal list and calorie progress
- Estimation cache and manual / breakdown calorie edits
- Weight log, chart, list with swipe actions
- Settings for daily calorie target

## Before first use

1. Firebase Console: enable Google Auth, create Firestore DB
2. Deploy rules: `firebase deploy --only firestore:rules,firestore:indexes` (after `firebase login` + `firebase use diet-tracker-249d4`)
3. Create composite index if prompted by Firestore error link in browser console
4. `npm run dev` → http://localhost:3000

## Deploy (Vercel)

- Set all `NEXT_PUBLIC_FIREBASE_*` and `ANTHROPIC_API_KEY` env vars
- Add Vercel URL to Firebase Auth authorized domains

## Changelog

| Date | Change |
|------|--------|
| 2026-06-11 | **Login minimalized**: replaced headline + feature rows with `LoginRing` — a full 60-tick ring around icon + "Diet" wordmark with a lime comet endlessly sweeping (`login-tick-sweep`, staggered negative delays) and a slow breathing glow (`login-ring-breathe`); one-line tagline; reduced-motion fallback keeps a static ring. |
| 2026-06-11 | **Midnight Volt polish pass**: dock made opaque (`.glass-strong` dark gradient); gauge end-dot removed (ticks only). Add-meal sheet: eyebrow header, tinted slot icon picker (shared `lib/meals/slot-style.ts`), glass textarea, AI hint with sparkles. Quick-edit sheet: matching headers/inputs, kcal suffix inside calorie input. Sport UX rebuilt: chip opens dedicated "Sport day" sheet with +150/250/350/500 presets, custom kcal, update/remove actions (was inline dotted-underline editor). Settings rebuilt: tinted icon cards (calorie targets, sport bonus, water goal in liters) with −/+ stepper fields (tap value to type, debounced auto-save with check flash) and an account card (avatar, name, sign-out icon button). Login: split headline ("Eat. Log. / Stay on target."), three tinted feature rows, Google logo on CTA. |
| 2026-06-11 | **"Midnight Volt" full redesign** (dark-only): new token system in `globals.css` (deep ink-green `#0A0E0C` bg, electric lime `#CDFB51` accent, coral `#FF6E62` over-budget, `--water` cyan), Manrope body + Space Grotesk display (`.font-display`) + Rubik Hebrew. Glass utilities (`.glass`, `.glass-strong`, `.glow-accent`, gradient-text classes) and `.ambient-scene` background glow. Bottom nav → floating glass dock with center lime "+" (replaces FAB; same-page via `ADD_MEAL_EVENT` in `lib/meals/add-meal-signal.ts`, cross-page via one-shot `?add=1`). Day header → big display title + tappable rolling 7-day strip. Calorie hero → 270° tick-mark gauge (48 staggered ticks, glow end-dot, % chip in opening, gradient numeral). Meal slots get per-slot neon tint chips; rows/strips/cards are glass; water strip gains bottom fill meter. Stats/Weight/Settings/Login reskinned to match; sheets darker + blurred overlay; confetti/theme colors updated; manifest + themeColor `#0A0E0C`. Lint/build clean (pre-existing lint errors untouched). |
| 2026-05-27 | PRD finalized; memory bank and Cursor rules created |
| 2026-05-27 | Full v1 app implemented per PRD build plan |
| 2026-05-27 | Ownership pass: Firestore rules + indexes deployed; lint clean; stale detail, timeout, FR-14, suspicious cal flag, error boundaries all fixed |
| 2026-05-30 | Daily-Diet visual redesign (Nunito Sans + Rubik, green/red palette, Figma meal rows + hero) on branch `redesign/daily-diet`; added FAB-only add with slot selector, drag-and-drop slot moves (`@dnd-kit`), and a new Statistics screen (`/stats`, `useStats` + `computeStats`). Vitest added for logic helpers. Spec/plan in `docs/superpowers/`. |
| 2026-06-07 | Water target + full-screen wave: added a daily water goal (`waterTargetMl` on the user doc, default 3 L) editable in Settings as liters (`WaterTargetField`, 0.5–10 L). Logging water on the Day view now fires a transient full-screen `WaterWaveOverlay` (portal, `pointer-events-none`) that rises from the bottom to the current fraction of the goal (top edge = goal), holds, then fades (~2s); shows a top goal readout with a "Goal reached" state and stronger haptic on crossing. Strip now shows `/ goal`. New `lib/meals/water.ts` helpers `mlToLitersInput`/`litersToMl` (+vitest); CSS keyframes `water-rise`/`water-overlay-fade`/`water-wave-drift`/`water-label-pop` with reduced-motion fallback. No new collection/index. |
| 2026-06-07 | Two-color UI trial (`#132B21` main / `#A6C2B5` secondary): remapped green/accent design tokens in `app/globals.css` (kept red over-budget semantics), derived sage tints, updated confetti colors, and reskinned the weekly calories chart (`weekly-calories-chart.tsx`) to brand tokens with a highlighted today column, min-height fills, and a dashed target line. |
| 2026-06-07 | Water logging: two-tap quick-add (1 L bottle + 220 ml cup) running daily total on the Today/Day view, shown in liters with no goal. Stored as additive `waterMl` field on the existing `dayMeta` doc (`addWater` create-or-update + `increment`, clamped at 0); tap the total to reveal inline `-Bottle`/`-Cup` correction. New `components/meals/water-strip.tsx` + `lib/meals/water.ts` helpers (`formatLiters`, `clampWaterMl`) with vitest. No new collection/index. |
| 2026-06-06 | Estimation accuracy + splitting: rewrote `SYSTEM_PROMPT` to avoid over-estimation (median real-world portions, no double-counting) and to search the broader web (removed `allowed_domains`; preferred sources kept in prompt). `/api/estimate` now returns `{ meals: MealEstimate[] }` so one input (e.g. `טוסט ושוקו`) can split into separate meal rows. Updated schemas (`MealItemSchema`, `mapApiEstimateToMeals`, `textHe`), cache (`meals[]` + legacy wrap), `fetch-estimate` (`estimates[]`), and `day-view` (split → `createMealFromEstimate` in same slot). |
