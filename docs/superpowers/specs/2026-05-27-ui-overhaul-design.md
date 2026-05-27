# Diet Tracker — UI overhaul & Firebase reality-check

**Date:** 2026-05-27
**Status:** Approved
**Goal:** Replace the generic Composer-2.5 UI with an editorial-minimal dark-first design (Things 3 / Bear vibes), verify Firebase actually works end-to-end, ship a personal app that feels premium.

## What survives untouched

- Firestore schema and security rules (`users/{uid}/{meals,weights/{date},estimationCache/{normalized}}`)
- Estimation pipeline: `/api/estimate`, [lib/anthropic/](../../../lib/anthropic), [lib/estimation/](../../../lib/estimation)
- Auth flow ([lib/firebase/auth.ts](../../../lib/firebase/auth.ts), [components/providers/auth-provider.tsx](../../../components/providers/auth-provider.tsx))
- Hooks ([hooks/](../../../hooks)) — logic is sound, listeners and totals work
- Date utilities ([lib/dates/jerusalem.ts](../../../lib/dates/jerusalem.ts))
- Types ([types/](../../../types))

## Theme system

Dark-first via `class="dark"` on `<html>` (or default `:root` set to dark tokens). Tokens in [app/globals.css](../../../app/globals.css):

- **Background** — `oklch(0.16 0.005 270)` charcoal with the slightest cool tint.
- **Surface** — `oklch(0.20 0.005 270)` for sheets/cards.
- **Foreground** — `oklch(0.96 0.005 90)` warm off-white.
- **Muted-fg** — `oklch(0.65 0.01 270)`.
- **Border** — `oklch(1 0 0 / 8%)` hairlines.
- **Accent (desaturated teal)** — `oklch(0.72 0.07 190)`. Used sparingly: progress bar fill, active nav indicator, single-letter focal points. Not for buttons by default.
- **Destructive** — `oklch(0.65 0.18 25)`.

Light theme tokens defined as `.light` for future toggle but not exposed in UI yet.

Radius scale tightened: `--radius: 10px` (was 16px). Sheet tops 16px. Cards 10px.

## Typography

Three fonts via `next/font/google`:

- **`Instrument Serif`** — display: page title, date in day header, big calorie/weight numbers when "editorial".
- **`Inter`** — UI text everywhere else, tight letterspacing on small caps.
- **`JetBrains Mono`** — `tabular-nums` for calorie counts and weight grams in lists.

## Components — full rebuild

Every file under `components/` is replaced. Logic stays in `hooks/` and `lib/`. New primitives layer keeps shadcn/Base UI for the bits that work (Sheet, Dialog primitives) but restyled.

### Layout

- **Root layout** ([app/layout.tsx](../../../app/layout.tsx)) — load three fonts, set `dark` class, theme-color metadata matches background.
- **App layout** ([app/(app)/layout.tsx](../../../app/(app)/layout.tsx)) — max-width 480px, generous side padding, `pb-24` for bottom nav.
- **BottomNav** — 56px, three icons + uppercase letter-spaced labels, 2px top accent on active.

### Today screen

- **DayHeader** — date in Instrument Serif (e.g. "May 27"), weekday + "Today" subtle below, chevrons at edges.
- **CalorieHero** — replaces `CalorieProgress`. Huge mono number, "of 2,000 kcal · 71%", thin 2px progress, "580 remaining" muted.
- **WeightTodayCard** — single horizontal row, not a card.
- **MealSection** — section title in serif, entries stacked, `+` button at the bottom-right.
- **MealEntryRow** — Hebrew text left-aligned within RTL flow on its row, calorie number on the far end in mono. Pending state uses a thin pulsing dot. Confidence/searched indicators become tiny inline `·` markers, not icons.

### Sheets

- **AddMealSheet** — rounded-top, dark surface, large borderless input, primary CTA full-width. iOS keyboard handling via `visualViewport`.
- **MealDetailSheet** — meal text huge at top, total below in mono, badges for confidence/searched, breakdown as a 2-col table with tap-to-edit, actions consolidated.
- **BreakdownEditSheet** — kept logic, restyled.
- **LogWeightSheet** — number-first, date picker as secondary, no Cancel button (sheet has X).

### Weight screen

- Hero weight in display serif.
- Delta chips with `▲ ▼` and value.
- Range as text segments with thin underline.
- **WeightChart** — Recharts with no `CartesianGrid`, no Y axis ticks (only domain), no X axis ticks (only first/last labels), gradient `<linearGradient>` under a 1.5px line, dots only on hover.
- Recent entries as flat rows with hairline dividers.

### Settings + login

- **Login** — centered serif logotype, single Google button, "What is this?" expand for first-timer help.
- **Settings** — inline-editable target (no separate Save UI), email + Sign out as quiet footer.

## Firebase reality-check workflow

1. Verify `.env.local` exists with 6 `NEXT_PUBLIC_FIREBASE_*` + `ANTHROPIC_API_KEY`. If missing, prompt Omri to fill from Firebase console.
2. Omri-side console steps: enable Google sign-in; create Firestore in production mode (location `me-west1` for Israel).
3. Deploy rules + indexes via `firebase deploy --only firestore:rules,firestore:indexes`.
4. Boot `npm run dev`; sign in via Google; create a test meal; confirm collections appear in Firestore.

## PWA basics

- Replace placeholder favicon with a real icon set (192/512/maskable).
- Add `theme_color` matching background.
- Manifest already referenced from layout; ensure file exists and is correct.

## Out of scope

- Light theme toggle (tokens ready; toggle later)
- PWA install banner, offline mode, splash screens
- Photo input, macros, "my usual" library, onboarding

## Build order

1. Firebase reality check — confirm env, deploy rules, prove sign-in + meal write works
2. Theme tokens + fonts (foundation)
3. Layout primitives (root layout, app layout, bottom nav)
4. Today view (header, calorie hero, meal sections, entry row)
5. Sheets (add meal, meal detail, breakdown edit)
6. Weight screen (hero, chart, list, log sheet)
7. Settings + login redesigns
8. PWA assets
9. End-to-end verification with screenshots

## Verification

For each phase: build passes, lint passes, the relevant screen renders correctly in the running dev server (verified via browser screenshot). Final pass: sign in, log meal in Hebrew, verify Claude estimate persists, log weight, see chart populate.
