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
