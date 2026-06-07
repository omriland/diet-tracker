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
| 2026-05-27 | PRD finalized; memory bank and Cursor rules created |
| 2026-05-27 | Full v1 app implemented per PRD build plan |
| 2026-05-27 | Ownership pass: Firestore rules + indexes deployed; lint clean; stale detail, timeout, FR-14, suspicious cal flag, error boundaries all fixed |
| 2026-05-30 | Daily-Diet visual redesign (Nunito Sans + Rubik, green/red palette, Figma meal rows + hero) on branch `redesign/daily-diet`; added FAB-only add with slot selector, drag-and-drop slot moves (`@dnd-kit`), and a new Statistics screen (`/stats`, `useStats` + `computeStats`). Vitest added for logic helpers. Spec/plan in `docs/superpowers/`. |
| 2026-06-07 | Water target + full-screen wave: added a daily water goal (`waterTargetMl` on the user doc, default 3 L) editable in Settings as liters (`WaterTargetField`, 0.5–10 L). Logging water on the Day view now fires a transient full-screen `WaterWaveOverlay` (portal, `pointer-events-none`) that rises from the bottom to the current fraction of the goal (top edge = goal), holds, then fades (~2s); shows a top goal readout with a "Goal reached" state and stronger haptic on crossing. Strip now shows `/ goal`. New `lib/meals/water.ts` helpers `mlToLitersInput`/`litersToMl` (+vitest); CSS keyframes `water-rise`/`water-overlay-fade`/`water-wave-drift`/`water-label-pop` with reduced-motion fallback. No new collection/index. |
| 2026-06-07 | Two-color UI trial (`#132B21` main / `#A6C2B5` secondary): remapped green/accent design tokens in `app/globals.css` (kept red over-budget semantics), derived sage tints, updated confetti colors, and reskinned the weekly calories chart (`weekly-calories-chart.tsx`) to brand tokens with a highlighted today column, min-height fills, and a dashed target line. |
| 2026-06-07 | Water logging: two-tap quick-add (1 L bottle + 220 ml cup) running daily total on the Today/Day view, shown in liters with no goal. Stored as additive `waterMl` field on the existing `dayMeta` doc (`addWater` create-or-update + `increment`, clamped at 0); tap the total to reveal inline `-Bottle`/`-Cup` correction. New `components/meals/water-strip.tsx` + `lib/meals/water.ts` helpers (`formatLiters`, `clampWaterMl`) with vitest. No new collection/index. |
| 2026-06-06 | Estimation accuracy + splitting: rewrote `SYSTEM_PROMPT` to avoid over-estimation (median real-world portions, no double-counting) and to search the broader web (removed `allowed_domains`; preferred sources kept in prompt). `/api/estimate` now returns `{ meals: MealEstimate[] }` so one input (e.g. `טוסט ושוקו`) can split into separate meal rows. Updated schemas (`MealItemSchema`, `mapApiEstimateToMeals`, `textHe`), cache (`meals[]` + legacy wrap), `fetch-estimate` (`estimates[]`), and `day-view` (split → `createMealFromEstimate` in same slot). |
