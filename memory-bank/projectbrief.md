# Project Brief — Diet Tracker

## What we're building

Single-user, personal web app: log meals in natural Hebrew, get AI calorie estimates, track daily intake vs a target, and log body weight over time.

## Core goals

1. **Speed** — Meal logged in &lt;10s (tap + → Hebrew text → save).
2. **Glanceable budget** — Today's consumed / target / remaining with progress bar.
3. **Weight trend** — Quick kg log + line graph (not just today's number).
4. **Mobile-first** — Works on iPhone Safari and Android Chrome.
5. **Cheap** — Target &lt;$5/month (LLM + Firebase free tier + Vercel free tier).

## Hard constraints

- **One user only** — Firebase Auth + Firestore rules scoped to `uid` (optionally hardcoded UID).
- **English UI, LTR** — Only meal text fields use `dir="auto"` / `lang="he"` for RTL Hebrew.
- **Calories only in v1** — No macros, recipes, exercise, social, native apps.
- **Timezone** — All calendar dates are `YYYY-MM-DD` in **Asia/Jerusalem**, computed server-side for writes; never trust client for date boundaries.
- **Secrets** — `ANTHROPIC_API_KEY` only on server (`/api/estimate`). Client talks to Firestore directly.

## Success (personal)

- ≥80% of meals logged for 14 consecutive days after launch.
- Estimates feel "good enough" (±15% acceptable).
- Under ~$1/month running cost in steady state.

## Source of truth

Full spec: [`PRD.md`](../PRD.md). Memory bank files are distilled context for agents; when in doubt, read the PRD.
