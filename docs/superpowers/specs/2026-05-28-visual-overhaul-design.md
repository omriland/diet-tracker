# Visual overhaul — Figma-matching reskin

**Date:** 2026-05-28
**Scope:** Visual reskin of the entire app to match the Figma Make mockup. All existing features are preserved. Dark mode is removed.

## Goal

Replace the current dark-first, card-heavy visual language with the clean, light, hairline-divided look from the Figma mockup. Business logic (hooks, Firestore writes, AI estimation, types, Firebase rules) is untouched.

## Approach

New design tokens in `globals.css` + rewrite of the *presentational* shell of each screen and component. Hooks, lib/, API routes, and types stay exactly as they are.

## Out of scope

- New features
- New routes
- Schema/Firestore changes
- API changes
- Dark mode (removed)

---

## 1. Design tokens (`app/globals.css`)

Single light theme on `:root`. Remove `.light` variant, `@custom-variant dark`, dark token block, and `next-themes` provider usage.

**Color palette:**

| Token | Value | Use |
|---|---|---|
| `--background` | `#ffffff` | App background |
| `--foreground` | `#0f1115` | Primary text |
| `--muted-foreground` | `#6b7280` | Helper text, labels, inactive nav |
| `--hairline` | `#e5e7eb` | All dividers and borders |
| `--accent` | `#4FB6A5` | Buttons, progress fill, active nav, deltas (down) |
| `--accent-soft` | `#4FB6A540` | Disabled CTA fill |
| `--surface` | `#ffffff` | Sheet/card surfaces |
| `--subtle` | `#f3f4f6` | Input fills, inactive pill background |
| `--destructive` | `#ef4444` | Trash icon, up-direction weight delta |

**Typography:** Inter (Latin) + Heebo (Hebrew) only. Remove Instrument Serif and Frank Ruhl Libre; remove `--font-display` and `--font-heading` tokens.

**Radii:** `--radius-md: 10px`, `--radius-lg: 14px`, `--radius-xl: 20px`, `--radius-pill: 9999px`.

**Animations:** keep `pulse-dot`; remove `editorial-in` (not used in new design).

---

## 2. Today screen (`/`, `/day/[date]`)

Top-to-bottom, full-width, no cards, hairline dividers between sections.

1. **Day header** — `< Thu, May 28 >` centered (bold, ~18px). Chevron icon buttons left/right, no background. Hairline below.
2. **Calorie hero** — Big number (`1000`, bold, ~36px) inline with `/ 2000 kcal` (muted, ~16px). Progress bar (height ~6px, rounded, teal fill on `--subtle` track). `{n} kcal remaining` in teal (~14px). Hairline below.
3. **Weight strip** — `Weight:` (muted) left; `{weight} kg` (bold) + `{delta} kg (7d)` (teal if down, red if up) right. Tappable → `/weight`. Hairline below. Replaces `WeightTodayCard`.
4. **Sport toggle** — Single pill chip `🏃 Sport +{n} kcal`. Inactive = subtle gray fill; active = teal fill. No card.
5. **Meal sections (×4)** — Breakfast, Lunch, Dinner, Snacks.
   - Header: emoji + bold name (~17px) left; circular teal `+` (36px) right.
   - Entry row: Hebrew text RTL, kcal right (bold). Small ⓘ icon between text and kcal. Tapping the row body opens **quick edit sheet**; tapping ⓘ opens **detail sheet**. Pending row = `…` with `pulse-dot`.
   - Empty: `No meals logged` (muted).
   - Hairline between sections.
6. **Done-logging pill** (today only) — Full-width teal pill below Snacks. Same shape as Log weight CTA. Streak celebration overlay restyled (white sheet, teal accents), behavior unchanged.
7. **Bottom nav** (fixed) — 3 tabs: Today / Weight / Settings. Icon + label stacked. Active = teal. Hairline top border. White background.

**Gestures:** Day swipe (left/right) preserved.

---

## 3. Bottom sheets

All sheets share the same shell: bottom-anchored, rounded top corners (~20px), white surface, hairline under header.

### Add meal sheet
- Header: `Add {slot} entry` (bold) + `✕`.
- Textarea (~120px, `--subtle` fill, ~12px radius, 2px teal focus ring). `dir="auto" lang="he"`. Hebrew placeholder.
- Helper: `Type in Hebrew for AI calorie estimation`.
- CTA pill: `Add meal` — teal when enabled, `--accent-soft` + white text when disabled.

### Meal detail sheet (ⓘ tap)
- Header: meal text (truncated) + `✕`.
- **Calories**: big number + source label (`AI`, `AI (cached)`, `Manual`).
- **Breakdown**: editable rows (item + kcal) + `+ Add item` ghost button. `breakdown-edit-sheet.tsx` merges into this sheet.
- **Reasoning / assumptions**: muted block, collapsed by default with `Show details` toggle.
- **Actions**: `Re-estimate` (gray pill) + `Delete` (red ghost text).

### Quick edit sheet (row tap)
- Header: `Edit entry` + `✕`.
- Textarea prefilled (same styling as Add).
- Optional manual calories input.
- CTA pill: `Save`.

### Log weight sheet
- Header: `Log weight` + `✕`.
- `Weight (kg)` label, number input with spinner arrows, `kg` suffix outside the box.
- `Date` label, date input (defaults to today; one-entry-per-date upsert unchanged).
- CTA pill: `Save` — teal when valid, pale teal when invalid/unchanged.

---

## 4. Weight screen (`/weight`)

1. **Title** — `Weight` bold (~22px), left-aligned. Hairline below.
2. **Current** — `Current` (muted, small) above `{weight} kg` (bold, ~36px). Hairline below.
3. **Deltas** — two equal columns: `vs. 7 days ago` / `vs. 30 days ago` with colored delta values. Hairline below.
4. **Range pills** — `30D / 90D / 1Y / ALL`. Active = teal fill + white text. Inactive = `--subtle` fill + dark text. Hairline below.
5. **Chart** — Recharts line. Teal stroke (~2.5px), teal dots (~5px), light gray dashed grid, muted axis labels. Tooltip = white rounded box with thin border, bold date + `weight : {n}` in teal. Hairline below.
6. **Log weight CTA** — full-width teal pill `+ Log weight`.
7. **Recent entries** — Section label, then list of rows: date (muted) left; weight (bold) + pencil (gray) + trash (red) right. Each row has light gray (`--subtle`) pill background.

---

## 5. Settings, Login, Auth pages

**Settings** (`/settings`): Title `Settings`, hairline, form rows (Daily calorie target — label + numeric input). `Sign out` as destructive ghost button at bottom.

**Login** (`/login`): Single centered teal `Sign in with Google` pill on white background. App icon + name above. No card.

**Auth loading / error**: white background, centered text, teal accent for spinners. Remove dark mode classes.

---

## 6. Component inventory

### Rewritten (markup + Tailwind classes; props/logic preserved)
- `app/globals.css` — token rewrite (Section 1)
- `app/layout.tsx` — drop serif font setup
- `components/layout/bottom-nav.tsx`
- `components/layout/day-header.tsx`
- `components/meals/calorie-progress.tsx`
- `components/meals/meal-slot-section.tsx`
- `components/meals/meal-entry-row.tsx` (add row tap → quick edit; ⓘ → detail)
- `components/meals/add-meal-sheet.tsx`
- `components/meals/meal-detail-sheet.tsx`
- `components/meals/breakdown-edit-sheet.tsx` — **merged into** `meal-detail-sheet.tsx` and deleted
- `components/meals/sport-toggle.tsx`
- `components/meals/done-logging-button.tsx`
- `components/meals/streak-celebration.tsx`
- `components/weight/weight-today-card.tsx` — **replaced** by inline weight strip in `day-view.tsx` and deleted
- `components/weight/weight-chart.tsx`
- `components/weight/weight-entry-list.tsx`
- `components/weight/log-weight-sheet.tsx`
- `app/(app)/weight/page.tsx`
- `app/(app)/settings/page.tsx`
- `app/(auth)/login/page.tsx`
- `components/ui/button.tsx`, `progress.tsx`, `sheet.tsx`, `input.tsx`, `dialog.tsx`, `card.tsx`, `label.tsx` — variant cleanup, drop dark-mode classes
- New quick-edit sheet component: `components/meals/quick-edit-sheet.tsx`

### Removed
- `components/weight/weight-today-card.tsx`
- `components/meals/breakdown-edit-sheet.tsx`
- `next-themes` usage (provider and import); package may be uninstalled in a follow-up.

### Kept untouched
- All `hooks/*`
- All `lib/*`
- `app/api/estimate/route.ts`
- `types/*`
- `firebase/*` rules + indexes
- Firestore document shapes

---

## 7. Acceptance criteria

- All screens visually match the Figma mockups for: Today, Add meal sheet, Weight, Log weight sheet (and the same language applied consistently to Settings, Login, Meal detail/Quick edit sheets).
- No dark mode classes remain in components; `.dark` selectors removed from `globals.css`.
- All existing flows still work: add meal (AI + manual), edit text (re-estimates), edit breakdown, delete meal, sport toggle, done-logging + streak celebration, day swipe, log weight, edit weight, delete weight, set calorie target, sign in/out.
- Hebrew RTL rendering preserved for meal text and inputs.
- Tabular figures preserved for all calorie and weight numbers.
- No regressions in Firestore reads/writes or `/api/estimate` calls.

## 8. Non-goals

- Onboarding flows
- Macros, recipes, goal-weight projections
- New gestures beyond what already exists
- Theme switcher
