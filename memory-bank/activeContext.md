# Active Context

**Last updated:** 11 Jun 2026

## Current phase

**"Midnight Volt" redesign** — Uncommitted on `main`: dark-only system (ink-green bg, electric lime accent, Space Grotesk numerals, glass surfaces, floating dock with center add button, 270° tick gauge, week-strip day nav). Needs iPhone Safari pass (dock safe-area, week-strip taps vs day swipe, water overlay) before commit.

**v1 complete** — App built; ready for Firebase rules deploy and daily use.

## Immediate next steps

1. Deploy Firestore rules/indexes to `diet-tracker-249d4`
2. Enable Google Auth in Firebase Console if not already
3. Run `npm run dev`, sign in, log first meal
4. Deploy to Vercel when ready

## Week 2

- Dogfood daily; refine `lib/anthropic/system-prompt.ts`
- Consider Firebase ID token on `/api/estimate` before sharing URL publicly
