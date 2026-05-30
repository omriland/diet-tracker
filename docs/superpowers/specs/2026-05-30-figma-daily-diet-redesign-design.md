# Daily-Diet Redesign — Design

**Date:** 2026-05-30
**Status:** Approved (pending spec review)
**Source design:** Figma "Daily Diet • Desafio React Native (Community)" (Rocketseat), file key `DlcTKRmcNeC0MFl1BhZ1oL`, pulled via Figma MCP.

## Goal

Re-skin the existing diet-tracker app in the **Rocketseat "Daily Diet" design system** (colors, typography, components, key layout patterns) **while keeping the app's current behavior**. The Figma app tracks a binary "on diet / off diet" per meal; ours is an AI calorie tracker. We **adopt the look & feel** and **remap** the green/red semantics from on/off-diet onto **under-target / over-target calories**.

Two genuinely new behaviors were approved on top of the reskin:
1. **FAB-only meal adding** + **drag-and-drop to move a meal between slots**.
2. A new **Statistics** screen.

## Non-goals

- No change to the estimation pipeline, Firestore security model, auth, or the single-user constraint.
- No macros/social/exercise features (still out of v1 scope per `project-core`).
- No dark mode (the source design is light only).

## Design tokens (extracted from Figma)

### Color palette

| Token | Hex | Use |
|---|---|---|
| `gray-100` | `#1B1D1E` | Primary text / dark surfaces (FAB, "done" button) |
| `gray-200` | `#333638` | Secondary text |
| `gray-300` | `#5C6265` | Tertiary text (added; not in source, interpolated) |
| `gray-400` | `#B9BBBC` | Divider lines, muted icons |
| `gray-500` | `#DDDEDF` | Card borders |
| `gray-600` | `#EFF0F0` | Subtle card fills (stat cards) |
| `gray-700` | `#FAFAFA` | App background |
| `white` | `#FFFFFF` | Card surface |
| `green-light` | `#E5F0DB` | "On target" badge/hero/stat backgrounds |
| `green-mid` | `#CBE4B4` | Green accents |
| `green-dark` | `#639339` | "On target" text, FAB, active nav, links |
| `red-light` | `#F4E6E7` | "Over target" backgrounds |
| `red-mid` | `#F3BABD` | Red accents |
| `red-dark` | `#BF3B44` | "Over target" text, destructive |

### Typography

- **Latin / numbers:** **Nunito Sans** (400/600/700/800).
- **Hebrew:** **Rubik** (400/500/700) — chosen for its rounded, geometric match to Nunito Sans. Applied to Hebrew text via `dir="auto"` / `lang="he"` content (meal text). Heebo is removed.
- Type scale (Nunito Sans, all `line-height: 130%`):
  - Title G — Bold 32 (hero numbers)
  - Title M — Bold 24
  - Title S — Bold 18 (section headings)
  - Title XS — Bold 14
  - Body M — Regular 16
  - Body S — Regular 14
  - Body XS — Bold 12 (meal time)

### Semantic remap

- **On target** (`consumed <= target`): green family.
- **Over target** (`consumed > target`): red family.
- This replaces the teal/mint accent (`#4FB6A5`) and amber "over" color currently in `globals.css`.

## Component changes

All of these are restyles of existing primitives unless marked **NEW**.

### Meal row (Figma-accurate)

Layout: **`time` · vertical divider · `meal name` (fills, truncates) · `kcal` (right-aligned fixed column)**.

- White card, `1px #DDDEDF` border, `6px` radius, padding `14px 16px 14px 12px`, `12px` gap.
- `time` = Body XS bold, **derived from `meal.createdAt`** (the moment logged) formatted `HH:mm` in Asia/Jerusalem. No schema change.
- Divider = `1px × 14px` `#B9BBBC` vertical line.
- `name` = Body M, `gray-200`, Hebrew via Rubik, truncates with ellipsis.
- `kcal` = bold tabular figures in a fixed-width right column so values align across rows.
- **No status dot** (removed per decision).
- Pending → spinner in the kcal slot; failed estimate → alert icon (existing behavior preserved).
- Tap row → quick-edit sheet; the detail affordance stays.

### Calorie hero card

- Rounded `16px` card, `green-light` background with `green-dark` label + dark number when on target; switches to `red-light` / `red-dark` when over target.
- Shows consumed (Title G), "X kcal remaining · target Y", and a progress bar (`green-dark`, red when over).
- **Sport toggle** stays, repositioned top-right as a pill.

### Add meal — FAB + drag-and-drop (**NEW behavior**)

- Remove the per-slot "+ Add" buttons.
- Add a single floating **green "+" FAB** (bottom-right, above bottom nav). Tapping opens the existing `AddMealSheet`, extended with a **slot selector** (Breakfast/Lunch/Dinner/Snack) since the slot is no longer implied by which button was pressed. Default slot = inferred from current time of day.
- **Drag-and-drop:** long-press a meal card to pick it up, drag onto another slot section to reassign. Implementation: `@dnd-kit/core` + `@dnd-kit/sortable` with a touch sensor (long-press activation). On drop, call a new `updateMealSlot(uid, mealId, slot)` (single `updateDoc` of the `slot` field). Toast confirms. Reordering within a slot is not persisted (meals sort by `createdAt`).
  - **Gesture coexistence:** the day view has horizontal swipe (prev/next day). Long-press activation for DnD avoids conflict with horizontal swipe; verify on iPhone Safari.

### Bottom nav

- 4 tabs: **Today / Stats / Weight / Settings**. Restyled: `green-dark` active, `gray-400` inactive, white bar, top hairline `#EFF0F0`.

### Statistics screen (**NEW**, route `/stats`)

Figma stats layout remapped to calories. Metrics (all approved):
- **% of logged days within calorie target** (green hero header, with back affordance).
- **Best on-target streak** (longest consecutive run of on-target days).
- **Current streak** (reuse `useStreak`).
- **Total meals logged.**
- **Days on target / days over target** (green/red pair).
- **Average calories per day.**

Data source: aggregate over a **bounded window** (default: all logged days, capped to last 90 for client performance — final window confirmed in the plan). "On target" for a day = that day's summed meal calories ≤ that day's target (via `getTargetForDate`, including sport bonus). Requires reading meals across the window; consider a date-range Firestore query.

### Other screens

- **Weight, Settings, Login**: restyle only (cards, buttons, type, palette). No structural change.
- **Sheets** (add/quick-edit/detail): restyle to the new card/button/badge system.
- **Buttons** (`components/ui/button.tsx`): retune variants to new palette (accent → `green-dark`; destructive → `red-dark`; radii follow the new system).

## Files affected (indicative)

- `app/globals.css` — replace color tokens + accent; new radii if needed.
- `app/layout.tsx` — swap fonts: add Nunito Sans + Rubik, remove Inter/Heebo wiring; update `--font-*` vars and `themeColor`.
- `components/meals/meal-entry-row.tsx` — Figma meal row (time/divider/name/kcal).
- `components/meals/meal-slot-section.tsx` — remove per-slot add button; become drop target.
- `components/meals/day-view.tsx` — FAB, DnD context, slot selector wiring.
- `components/meals/calorie-progress.tsx` — green/red hero card.
- `components/meals/add-meal-sheet.tsx` — slot selector.
- `components/layout/bottom-nav.tsx` — 4 tabs + restyle.
- `lib/firestore/meals.ts` — `updateMealSlot`.
- `app/(app)/stats/page.tsx` + `components/stats/*` — **new** statistics screen.
- `hooks/use-stats.ts` — **new** aggregation hook.
- `components/ui/*`, `weight/*`, `settings/page.tsx`, `(auth)/login/page.tsx` — restyle.
- `package.json` — add `@dnd-kit/core`, `@dnd-kit/sortable`.

## Data / schema

- **No Firestore schema changes.** Meal time is derived from existing `createdAt`. Slot move reuses the existing `slot` field.
- Stats are computed client-side from existing `meals` + `dayMeta` + profile target.

## Risks / open items

- **Stats aggregation cost** — reading many days of meals on the client; bound the window and reuse the today listener pattern. Final window decided in the plan.
- **DnD on iOS Safari** — long-press + touch sensor must coexist with day-swipe; needs device testing.
- **Font footprint** — two web fonts (Nunito Sans + Rubik); subset and `display: swap`.

## Quality bar (from project rules)

- Mobile-first; test iPhone Safari gestures (day swipe + DnD long-press).
- English UI (LTR); Hebrew only in meal text via `dir="auto"`/`lang="he"`.
- Dates persisted `YYYY-MM-DD` in Asia/Jerusalem; time display derived in Asia/Jerusalem.
- Minimal diff; match existing patterns.
