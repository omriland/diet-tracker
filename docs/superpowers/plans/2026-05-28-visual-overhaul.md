# Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the entire app to match the Figma Make mockup — light-only, hairline-divided, teal-accent — while preserving every feature and all hooks/Firestore wiring.

**Architecture:** Replace design tokens in `globals.css` (single light theme), then rewrite the *presentational* shell of every screen and component. Business logic (hooks, lib/, API routes, types) is untouched.

**Tech Stack:** Next.js 16 (App Router), Tailwind v4, Base UI primitives, shadcn-style components, Recharts, Firebase.

**Spec:** `docs/superpowers/specs/2026-05-28-visual-overhaul-design.md`

**Verification approach:** This is a visual refactor — no unit tests apply. Each task is verified by (a) `npm run dev` runs without console errors, (b) the affected screen renders without runtime errors, (c) the affected feature still works (smoke check). Final verification is a full walkthrough at the end.

---

## Task 1: New design tokens (`globals.css`)

**Files:**
- Modify: `app/globals.css` (full rewrite)

- [ ] **Step 1: Rewrite `globals.css`**

Replace the entire file with:

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-foreground: var(--surface-foreground);
  --color-elevated: var(--elevated);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-subtle: var(--subtle);
  --color-subtle-foreground: var(--subtle-foreground);
  --color-border: var(--border);
  --color-hairline: var(--hairline);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent-soft: var(--accent-soft);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-warning: var(--warning);

  /* shadcn compat — mapped to our tokens so legacy primitives still work */
  --color-card: var(--surface);
  --color-card-foreground: var(--surface-foreground);
  --color-popover: var(--elevated);
  --color-popover-foreground: var(--surface-foreground);
  --color-primary: var(--accent);
  --color-primary-foreground: var(--accent-foreground);
  --color-secondary: var(--subtle);
  --color-secondary-foreground: var(--foreground);

  --font-sans: var(--font-inter), var(--font-heebo), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: var(--font-jetbrains-mono), "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-hebrew-sans: var(--font-heebo), var(--font-inter), ui-sans-serif, system-ui, sans-serif;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-pill: 9999px;
}

:root {
  --background: #ffffff;
  --foreground: #0f1115;
  --surface: #ffffff;
  --surface-foreground: #0f1115;
  --elevated: #ffffff;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
  --subtle: #f3f4f6;
  --subtle-foreground: #374151;
  --border: #e5e7eb;
  --hairline: #e5e7eb;
  --input: #f3f4f6;
  --ring: #4FB6A5;
  --accent: #4FB6A5;
  --accent-foreground: #ffffff;
  --accent-soft: rgba(79, 182, 165, 0.35);
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --success: #4FB6A5;
  --warning: #f59e0b;
}

@layer base {
  *,
  *::before,
  *::after {
    border-color: var(--hairline);
  }
  html {
    font-family: var(--font-sans);
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
    background-color: var(--background);
    color: var(--foreground);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
    overscroll-behavior-y: none;
  }
  .tabular-nums,
  [class*="tabular-nums"] {
    font-variant-numeric: tabular-nums;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
  :focus-visible {
    outline: none;
  }
  ::selection {
    background-color: var(--accent-soft);
    color: var(--foreground);
  }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
.pulse-dot {
  animation: pulse-dot 1.4s ease-in-out infinite;
}

@keyframes editorial-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.editorial-in {
  animation: editorial-in 320ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

- [ ] **Step 2: Smoke-check**

Run `npm run dev`. Visit `/`. Expect: app renders with a white background (likely broken styling — that's fine for this task; subsequent tasks restyle components). Console should be free of CSS errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: rewrite design tokens for light-only Figma palette"
```

---

## Task 2: Strip serif fonts from layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Rewrite `app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Heebo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AbortErrorSilencer } from "@/components/providers/abort-error-silencer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diet",
  description: "A quiet calorie & weight journal.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Diet",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${heebo.variable} h-full antialiased`}
    >
      <head>
        <AbortErrorSilencer />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Smoke-check**

`npm run dev`, visit `/`. Expect: no console errors about missing font variables. Old `var(--font-display)` and `var(--font-heading)` references in components will fall back to default — temporarily ugly, fixed in later tasks.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "style: drop serif display fonts; keep Inter + Heebo + JetBrains Mono"
```

---

## Task 3: Button variants for new look

**Files:**
- Modify: `components/ui/button.tsx`

The Figma uses:
- Full-width pill CTAs (teal, rounded-2xl, large)
- Pill toggles (range selector, sport chip)
- Circular icon buttons
- Ghost text buttons

- [ ] **Step 1: Rewrite the button variants**

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent-soft disabled:text-white",
        accent:
          "rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent-soft disabled:text-white",
        outline:
          "rounded-2xl border border-hairline bg-transparent text-foreground hover:bg-subtle",
        ghost:
          "rounded-md text-foreground hover:bg-subtle",
        secondary:
          "rounded-2xl bg-subtle text-foreground hover:bg-subtle/70",
        link:
          "text-accent underline-offset-4 hover:underline",
        destructive:
          "rounded-2xl bg-transparent text-destructive hover:bg-destructive/10",
        pill:
          "rounded-pill bg-subtle text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        "icon-circle":
          "rounded-full bg-accent text-accent-foreground hover:bg-accent/90",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-[13px]",
        xs: "h-7 px-2.5 text-xs",
        lg: "h-14 px-5 text-[15px]",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

- [ ] **Step 2: Smoke-check**

`npm run dev`, visit `/login`. Expect: "Continue with Google" button renders as a teal pill.

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.tsx
git commit -m "style: button variants for Figma pill/circle look"
```

---

## Task 4: Sheet primitive — white surface, drop heavy shadow

**Files:**
- Modify: `components/ui/sheet.tsx`

- [ ] **Step 1: Update `SheetOverlay` and `SheetContent`**

Replace the `SheetOverlay` block:

```tsx
function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/30 transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}
```

Replace the `SheetContent` block:

```tsx
function SheetContent({
  className,
  children,
  side = "bottom",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "bg-surface text-foreground fixed z-50 flex flex-col gap-3 shadow-[0_-8px_24px_rgba(15,17,21,0.08)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none data-ending-style:opacity-0 data-starting-style:opacity-0",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:rounded-t-[20px] data-[side=bottom]:px-5 data-[side=bottom]:pb-[max(env(safe-area-inset-bottom),1.25rem)] data-[side=bottom]:pt-5 data-[side=bottom]:data-ending-style:translate-y-3 data-[side=bottom]:data-starting-style:translate-y-full",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:rounded-b-[20px] data-[side=top]:p-5 data-[side=top]:data-ending-style:-translate-y-3 data-[side=top]:data-starting-style:-translate-y-full",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:p-5 data-[side=left]:border-r data-[side=left]:data-ending-style:-translate-x-3 data-[side=left]:data-starting-style:-translate-x-full",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:p-5 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-3 data-[side=right]:data-starting-style:translate-x-full",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className="text-foreground hover:bg-subtle absolute end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          >
            <XIcon className="h-5 w-5" strokeWidth={1.5} />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}
```

Note: the grey drag-handle bar is removed; Figma uses a clean rounded top.

- [ ] **Step 2: Smoke-check**

`npm run dev`. Open any sheet (e.g., tap `+` on a meal slot). Expect: white sheet with rounded top, no grey drag bar, lighter overlay.

- [ ] **Step 3: Commit**

```bash
git add components/ui/sheet.tsx
git commit -m "style: sheet uses white surface and softer overlay, drop drag bar"
```

---

## Task 5: Bottom nav — icon + label, teal active

**Files:**
- Modify: `components/layout/bottom-nav.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Scale, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";

export function BottomNav() {
  const pathname = usePathname();
  const today = getJerusalemDateString();

  const links = [
    {
      href: `/day/${today}`,
      label: "Today",
      icon: Home,
      match: (p: string) => p === "/" || p.startsWith("/day/"),
    },
    {
      href: "/weight",
      label: "Weight",
      icon: Scale,
      match: (p: string) => p === "/weight",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: SettingsIcon,
      match: (p: string) => p === "/settings",
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-background"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[480px] items-stretch">
        {links.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs transition-colors",
                active ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Smoke-check**

Visit `/day/<today>`, `/weight`, `/settings`. Expect: 3-tab nav with icons; active tab is teal.

- [ ] **Step 3: Commit**

```bash
git add components/layout/bottom-nav.tsx
git commit -m "style: bottom nav with icons and teal active state"
```

---

## Task 6: Day header — chevrons + bold centered date

**Files:**
- Modify: `components/layout/day-header.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatWeekday, formatMonthDay } from "@/lib/dates/jerusalem";

interface DayHeaderProps {
  date: string;
  onPrev: () => void;
  onNext: () => void;
}

export function DayHeader({ date, onPrev, onNext }: DayHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-hairline py-4">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous day"
        className="inline-flex h-9 w-9 items-center justify-center text-foreground transition-opacity hover:opacity-60"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2} />
      </button>
      <h1 className="text-[17px] font-bold text-foreground">
        {formatWeekday(date)}, {formatMonthDay(date)}
      </h1>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next day"
        className="inline-flex h-9 w-9 items-center justify-center text-foreground transition-opacity hover:opacity-60"
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2} />
      </button>
    </header>
  );
}
```

Note: drops the `formatYear` call and "Today ·" prefix to match Figma exactly.

- [ ] **Step 2: Smoke-check**

Visit `/day/<today>`. Expect: chevrons left/right, centered bold date like "Thu, May 28".

- [ ] **Step 3: Commit**

```bash
git add components/layout/day-header.tsx
git commit -m "style: day header matches Figma chevron + centered date"
```

---

## Task 7: CalorieHero — Figma layout

**Files:**
- Modify: `components/meals/calorie-progress.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { cn } from "@/lib/utils";

interface CalorieHeroProps {
  consumed: number;
  target: number;
  remaining: number;
}

export function CalorieHero({ consumed, target, remaining }: CalorieHeroProps) {
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const over = consumed > target;

  return (
    <section className="border-b border-hairline py-5">
      <div className="flex items-baseline gap-2">
        <span className="text-[36px] font-bold leading-none tabular-nums text-foreground">
          {consumed.toLocaleString()}
        </span>
        <span className="text-[16px] text-muted-foreground">
          / {target.toLocaleString()} kcal
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-subtle">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            over ? "bg-warning" : "bg-accent"
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <p className={cn("mt-3 text-sm tabular-nums", over ? "text-warning" : "text-accent")}>
        {over
          ? `${(consumed - target).toLocaleString()} kcal over`
          : `${remaining.toLocaleString()} kcal remaining`}
      </p>
    </section>
  );
}

export const CalorieProgress = CalorieHero;
```

- [ ] **Step 2: Smoke-check**

Visit `/day/<today>` (must have at least one meal or set consumed via fixtures). Expect: big bold number, thin rounded teal bar, "X kcal remaining" in teal.

- [ ] **Step 3: Commit**

```bash
git add components/meals/calorie-progress.tsx
git commit -m "style: CalorieHero matches Figma (bold number, rounded bar, teal remaining)"
```

---

## Task 8: Sport toggle — pill chip

**Files:**
- Modify: `components/meals/sport-toggle.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setDayMetaSport } from "@/lib/firestore/day-meta";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import { cn } from "@/lib/utils";

interface SportToggleProps {
  uid: string;
  date: string;
  active: boolean;
  bonusKcal: number;
}

export function SportToggle({ uid, date, active, bonusKcal }: SportToggleProps) {
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (pending) return;
    setPending(true);
    try {
      await setDayMetaSport(uid, date, !active);
    } catch (err) {
      console.error("Failed to toggle sport", err);
      toast.error("Couldn't save sport flag");
    } finally {
      setPending(false);
    }
  }

  const bonus = bonusKcal || SPORT_BONUS_KCAL;

  return (
    <div className="border-b border-hairline py-3">
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={active}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors",
          active
            ? "bg-accent text-accent-foreground"
            : "bg-subtle text-foreground hover:bg-subtle/70"
        )}
      >
        <span>🏃</span>
        <span>Sport</span>
        <span className="tabular-nums opacity-80">+{bonus} kcal</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Smoke-check**

Visit `/day/<today>`. Expect: small "🏃 Sport +400 kcal" pill chip under the calorie hero. Toggling changes between teal-filled and grey.

- [ ] **Step 3: Commit**

```bash
git add components/meals/sport-toggle.tsx
git commit -m "style: sport toggle as pill chip matching Figma"
```

---

## Task 9: Meal slot section — circular + button, hairline divider

**Files:**
- Modify: `components/meals/meal-slot-section.tsx`

- [ ] **Step 1: Look up emoji map**

Open `types/meal.ts` (or wherever `MEAL_SLOTS` is exported) to confirm the slot labels. The Figma shows: 🥐 Breakfast, 🥗 Lunch, 🍽️ Dinner, 🍫 Snacks. If `MEAL_SLOTS` does not already carry emojis, add them in this file via a local map keyed by slot.

- [ ] **Step 2: Rewrite the file**

```tsx
"use client";

import { Plus } from "lucide-react";
import { MealEntryRow } from "./meal-entry-row";
import type { Meal, MealSlot } from "@/types/meal";

const SLOT_EMOJI: Record<MealSlot, string> = {
  breakfast: "🥐",
  lunch: "🥗",
  dinner: "🍽️",
  snacks: "🍫",
};

interface MealSlotSectionProps {
  label: string;
  slot: MealSlot;
  meals: Meal[];
  onAdd: (slot: MealSlot) => void;
  onSelectMeal: (meal: Meal) => void;
  onShowDetail: (meal: Meal) => void;
}

export function MealSlotSection({
  label,
  slot,
  meals,
  onAdd,
  onSelectMeal,
  onShowDetail,
}: MealSlotSectionProps) {
  const isEmpty = meals.length === 0;

  return (
    <section className="border-b border-hairline py-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[17px] font-bold text-foreground">
          <span aria-hidden>{SLOT_EMOJI[slot]}</span>
          {label}
        </h2>
        <button
          type="button"
          onClick={() => onAdd(slot)}
          aria-label={`Add to ${label}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="mt-3">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground">No meals logged</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {meals.map((meal) => (
              <MealEntryRow
                key={meal.id}
                meal={meal}
                onEdit={() => onSelectMeal(meal)}
                onShowDetail={() => onShowDetail(meal)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

Note: `onSelectMeal` is now wired to the quick-edit flow; `onShowDetail` is the new ⓘ-tap path. Both props are required from the parent (DayView is updated in Task 23).

If `MealSlot` values differ from the literals above, adjust the `SLOT_EMOJI` keys accordingly. (Check with `grep -R "MealSlot" types/`.)

- [ ] **Step 3: Smoke-check (compile only)**

`npm run dev`. TypeScript will fail in `day-view.tsx` because `onShowDetail` is missing. That's expected and fixed in Task 23. For this task, accept the compile error and move on.

- [ ] **Step 4: Commit**

```bash
git add components/meals/meal-slot-section.tsx
git commit -m "style: meal slot section with emoji header and circular + button"
```

---

## Task 10: Meal entry row — Hebrew text + kcal + ⓘ

**Files:**
- Modify: `components/meals/meal-entry-row.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { Info } from "lucide-react";
import type { Meal } from "@/types/meal";
import { cn } from "@/lib/utils";

interface MealEntryRowProps {
  meal: Meal;
  onEdit: () => void;
  onShowDetail: () => void;
}

export function MealEntryRow({ meal, onEdit, onShowDetail }: MealEntryRowProps) {
  const pending = meal.pending || meal.calories === null;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-start"
      >
        <span
          dir="auto"
          lang="he"
          className="min-w-0 flex-1 truncate text-[15px] leading-snug text-foreground"
        >
          {meal.text}
        </span>
        <span
          className={cn(
            "shrink-0 text-[17px] font-bold tabular-nums text-foreground",
            pending && "text-muted-foreground"
          )}
        >
          {pending ? <span className="pulse-dot">·</span> : meal.calories}
        </span>
      </button>
      <button
        type="button"
        onClick={onShowDetail}
        aria-label="Meal details"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-accent transition-opacity hover:opacity-70"
      >
        <Info className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Smoke-check (compile only)**

Same as Task 9 — still expects `day-view.tsx` to be updated.

- [ ] **Step 3: Commit**

```bash
git add components/meals/meal-entry-row.tsx
git commit -m "style: meal entry row with bold kcal and info icon"
```

---

## Task 11: Quick edit sheet (new)

**Files:**
- Create: `components/meals/quick-edit-sheet.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Meal } from "@/types/meal";

interface QuickEditSheetProps {
  open: boolean;
  meal: Meal | null;
  onOpenChange: (open: boolean) => void;
  onSaveText: (text: string) => Promise<void>;
  onSaveCalories: (calories: number) => Promise<void>;
}

export function QuickEditSheet({
  open,
  meal,
  onOpenChange,
  onSaveText,
  onSaveCalories,
}: QuickEditSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={true}>
        {meal && (
          <QuickEditForm
            key={meal.id}
            meal={meal}
            onSaveText={onSaveText}
            onSaveCalories={onSaveCalories}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function QuickEditForm({
  meal,
  onSaveText,
  onSaveCalories,
  onClose,
}: {
  meal: Meal;
  onSaveText: (text: string) => Promise<void>;
  onSaveCalories: (calories: number) => Promise<void>;
  onClose: () => void;
}) {
  const [text, setText] = useState(meal.text);
  const [cal, setCal] = useState(meal.calories?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => textareaRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  const textChanged = text.trim() !== meal.text.trim();
  const calChanged = cal !== (meal.calories?.toString() ?? "");
  const calNum = parseInt(cal, 10);
  const calValid = !Number.isNaN(calNum) && calNum >= 0;
  const canSave = (textChanged && text.trim().length > 0) || (calChanged && calValid);

  async function handleSave() {
    setSaving(true);
    try {
      if (textChanged && text.trim().length > 0) {
        await onSaveText(text.trim());
      } else if (calChanged && calValid) {
        await onSaveCalories(calNum);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-2">
      <header className="flex items-center justify-between border-b border-hairline pb-3 pr-10">
        <h2 className="text-[18px] font-bold text-foreground">Edit entry</h2>
      </header>

      <div className="flex flex-col gap-2">
        <label className="text-[15px] font-bold text-foreground">What did you eat?</label>
        <textarea
          ref={textareaRef}
          dir="auto"
          lang="he"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full resize-none rounded-xl bg-subtle p-4 text-[15px] leading-snug text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
        <p className="text-xs text-muted-foreground">Editing text will re-run the AI estimate.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[15px] font-bold text-foreground">Calories</label>
        <input
          type="number"
          inputMode="numeric"
          value={cal}
          onChange={(e) => setCal(e.target.value)}
          className="w-full rounded-xl bg-subtle px-4 py-3 text-[17px] tabular-nums text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
        <p className="text-xs text-muted-foreground">Override the calorie count manually.</p>
      </div>

      <Button
        type="button"
        variant="accent"
        size="lg"
        disabled={!canSave || saving}
        onClick={() => void handleSave()}
        className="w-full"
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Smoke-check (compile only)**

The component is unused yet — it gets wired up in Task 23. `npm run dev` should still compile this file.

- [ ] **Step 3: Commit**

```bash
git add components/meals/quick-edit-sheet.tsx
git commit -m "feat: add QuickEditSheet for fast meal text/calorie edits"
```

---

## Task 12: Add meal sheet — Figma simple flow

The Figma shows a much simpler add flow than the current one (no in-sheet preview/estimate phase — the meal is saved immediately and shows a `…` pending state in the list while estimation runs in the background).

The current sheet has an estimate→preview→save phase. To match Figma, we change the default path: **tap "Add meal" immediately persists the row** (with pending estimate that DayView's existing `runEstimateAfterEdit` flow handles). The fallback panels (clarification, manual entry after failure) move into the meal detail sheet (already there).

**Files:**
- Modify: `components/meals/add-meal-sheet.tsx` (drop preview/failed phases — they live in detail sheet)

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { fetchMealEstimate, EstimateCancelledError } from "@/lib/estimation/fetch-estimate";
import type { MealEstimate } from "@/lib/anthropic/schemas";
import type { MealSlot } from "@/types/meal";
import { MEAL_SLOTS } from "@/types/meal";

type EstimateSource = "AI" | "AI_CACHED";

interface AddMealSheetProps {
  open: boolean;
  slot: MealSlot | null;
  uid: string | undefined;
  onOpenChange: (open: boolean) => void;
  onConfirm: (params: {
    text: string;
    estimate: MealEstimate;
    source: EstimateSource;
  }) => Promise<void>;
  onManualSave: (params: { text: string; calories: number }) => Promise<void>;
}

export function AddMealSheet({
  open,
  slot,
  uid,
  onOpenChange,
  onConfirm,
  onManualSave,
}: AddMealSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={true}>
        {slot && uid && (
          <AddMealForm
            key={slot}
            slot={slot}
            uid={uid}
            onConfirm={onConfirm}
            onManualSave={onManualSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function AddMealForm({
  slot,
  uid,
  onConfirm,
  onManualSave,
  onClose,
}: {
  slot: MealSlot;
  uid: string;
  onConfirm: AddMealSheetProps["onConfirm"];
  onManualSave: AddMealSheetProps["onManualSave"];
  onClose: () => void;
}) {
  const slotMeta = MEAL_SLOTS.find((s) => s.slot === slot);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const { estimate, source } = await fetchMealEstimate(uid, trimmed, ctrl.signal);
      if (ctrl.signal.aborted) return;
      await onConfirm({ text: trimmed, estimate, source });
      onClose();
    } catch (err) {
      if (err instanceof EstimateCancelledError) return;
      // AI failed — fall back to saving with calories=null; user can fix in detail sheet
      try {
        await onManualSave({ text: trimmed, calories: 0 });
        const message = err instanceof Error ? err.message : "Estimate failed";
        toast.error(message, { description: "Open the entry to set calories manually." });
        onClose();
      } finally {
        setSubmitting(false);
      }
      return;
    } finally {
      setSubmitting(false);
    }
  }

  const canAdd = text.trim().length > 0 && !submitting;

  return (
    <div className="flex flex-col gap-5 pb-2">
      <header className="flex items-center justify-between border-b border-hairline pb-3 pr-10">
        <h2 className="text-[18px] font-bold text-foreground">
          Add {slotMeta?.label.toLowerCase()} entry
        </h2>
      </header>

      <div className="flex flex-col gap-2">
        <label className="text-[15px] font-bold text-foreground">What did you eat?</label>
        <textarea
          ref={inputRef}
          dir="auto"
          lang="he"
          rows={4}
          placeholder="…חביתה משתי ביצים עם פרוסת לחם"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              void handleAdd();
            }
          }}
          className="w-full resize-none rounded-xl bg-subtle p-4 text-[15px] leading-snug text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
        <p className="text-xs text-muted-foreground">Type in Hebrew for AI calorie estimation</p>
      </div>

      <Button
        type="button"
        variant="accent"
        size="lg"
        disabled={!canAdd}
        onClick={() => void handleAdd()}
        className="w-full"
      >
        {submitting ? "Estimating…" : "Add meal"}
      </Button>
    </div>
  );
}
```

Trade-off notes:
- The clarification (low-confidence) and refine flow that used to live here is dropped. Users see the AI estimate immediately in the list and can refine it via the ⓘ detail sheet if needed. This matches the Figma's single-step add flow.
- On AI failure, the row is saved with `calories: 0` and a toast directs the user to the detail sheet. (If `onManualSave` rejects `calories: 0`, change the fallback to `1` — verify by reading `createMealManual` in `lib/firestore/meals.ts` before this task and adjust the literal.)

- [ ] **Step 2: Verify `createMealManual` accepts the chosen calorie literal**

Open `lib/firestore/meals.ts`, find `createMealManual`. If it requires `calories >= 1`, change the fallback in the file above from `0` to `1`. If it allows `0`, keep `0`.

- [ ] **Step 3: Smoke-check**

`npm run dev`, visit `/day/<today>`, tap `+` on Breakfast. Expect: simple sheet with textarea + "Add meal" pill. Type something, tap Add → sheet closes, row appears in list with pending dot, then resolves to a calorie number a few seconds later.

- [ ] **Step 4: Commit**

```bash
git add components/meals/add-meal-sheet.tsx
git commit -m "feat: simplified add-meal sheet matches Figma single-step flow"
```

---

## Task 13: Meal detail sheet — restyle and absorb breakdown editing

**Files:**
- Modify: `components/meals/meal-detail-sheet.tsx` (restyle, keep breakdown editing inline)
- Delete: `components/meals/breakdown-edit-sheet.tsx`

The breakdown-edit-sheet became a *nested* sheet — a UX smell. Merge that form into the detail sheet's breakdown section: tapping a row reveals the inline editor (grams or calories), with Save / Remove buttons.

- [ ] **Step 1: Rewrite `components/meals/meal-detail-sheet.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { BreakdownItem, Meal } from "@/types/meal";
import {
  scaleBreakdownItemGrams,
  updateBreakdownItemCalories,
} from "@/lib/meals/breakdown";
import { cn } from "@/lib/utils";

interface MealDetailSheetProps {
  open: boolean;
  meal: Meal | null;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
  onUpdateBreakdown: (breakdown: BreakdownItem[]) => Promise<void>;
  onRetryEstimate: () => Promise<void>;
}

function isSuspicious(calories: number | null): boolean {
  if (calories === null) return false;
  return calories < 10 || calories > 3000;
}

function MealDetailContent({
  meal,
  onClose,
  onDelete,
  onUpdateBreakdown,
  onRetryEstimate,
}: Omit<MealDetailSheetProps, "open" | "onOpenChange"> & {
  meal: Meal;
  onClose: () => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isPending = meal.pending || meal.calories === null;
  const suspicious = isSuspicious(meal.calories);
  const annotations: string[] = [];
  if (meal.searched) annotations.push("web");
  if (meal.confidence === "low") annotations.push("low confidence");
  if (suspicious && !isPending) annotations.push("verify");

  function keyFor(item: BreakdownItem) {
    return `${item.itemEn}__${item.itemHe}`;
  }

  return (
    <div className="flex max-h-[78dvh] flex-col gap-5 overflow-y-auto pb-2">
      <header className="border-b border-hairline pb-3 pr-10">
        <p
          dir="auto"
          lang="he"
          className="truncate text-[18px] font-bold text-foreground"
        >
          {meal.text}
        </p>
      </header>

      <section className="flex items-baseline justify-between">
        <span className="text-[36px] font-bold leading-none tabular-nums text-foreground">
          {isPending ? <span className="pulse-dot text-muted-foreground">·</span> : meal.calories}
        </span>
        <span className="text-sm text-muted-foreground">kcal</span>
      </section>

      {annotations.length > 0 && (
        <p className="text-xs text-muted-foreground">{annotations.join(" · ")}</p>
      )}

      {meal.confidence === "low" && meal.needsClarificationHe && (
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-3">
          <p dir="auto" lang="he" className="text-end text-sm text-warning">
            {meal.needsClarificationHe}
          </p>
        </div>
      )}

      {meal.breakdown.length > 0 && (
        <section className="border-t border-hairline pt-4">
          <h3 className="mb-2 text-[15px] font-bold text-foreground">Breakdown</h3>
          <ul className="flex flex-col">
            {meal.breakdown.map((item) => (
              <li key={keyFor(item)} className="border-b border-hairline last:border-b-0">
                {editingKey === keyFor(item) ? (
                  <BreakdownEditor
                    item={item}
                    onCancel={() => setEditingKey(null)}
                    onSave={async (updated) => {
                      const next = meal.breakdown.map((b) =>
                        b.itemEn === item.itemEn && b.itemHe === item.itemHe ? updated : b
                      );
                      await onUpdateBreakdown(next);
                      setEditingKey(null);
                    }}
                    onRemove={async () => {
                      const next = meal.breakdown.filter(
                        (b) => b.itemEn !== item.itemEn || b.itemHe !== item.itemHe
                      );
                      if (next.length === 0) {
                        toast.error("Cannot remove the only component");
                        return;
                      }
                      await onUpdateBreakdown(next);
                      setEditingKey(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingKey(keyFor(item))}
                    className="flex w-full items-center justify-between gap-3 py-3 text-start"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span dir="auto" lang="he" className="text-[15px] text-foreground">
                        {item.itemHe}
                      </span>
                      {item.portionGrams != null && (
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {item.portionGrams} g
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-[15px] font-bold tabular-nums text-foreground">
                      {item.calories}
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(meal.reasoningHe || meal.assumptionsHe.length > 0) && (
        <details className="group border-t border-hairline pt-4">
          <summary className="cursor-pointer text-[13px] font-medium text-accent">
            <span className="group-open:hidden">Show reasoning</span>
            <span className="hidden group-open:inline">Hide reasoning</span>
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {meal.reasoningHe && (
              <p dir="auto" lang="he" className="text-end text-sm text-foreground/85">
                {meal.reasoningHe}
              </p>
            )}
            {meal.assumptionsHe.length > 0 && (
              <ul className="flex flex-col gap-1" dir="auto" lang="he">
                {meal.assumptionsHe.map((a) => (
                  <li key={a} className="text-end text-sm text-foreground/70">· {a}</li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}

      {meal.searched && meal.sources.length > 0 && (
        <section className="border-t border-hairline pt-4">
          <h3 className="mb-2 text-[13px] font-medium text-muted-foreground">Sources</h3>
          <ul className="flex flex-col gap-1">
            {meal.sources.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent underline-offset-2 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                  {url.replace(/^https?:\/\//, "").slice(0, 48)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        {isPending && (
          <Button variant="outline" size="lg" className="w-full" onClick={onRetryEstimate}>
            Re-estimate
          </Button>
        )}

        {!confirmingDelete ? (
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            Delete entry
          </Button>
        ) : (
          <div className={cn("flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3")}>
            <p className="text-sm text-destructive">Delete this entry?</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmingDelete(false)}>
                Keep
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  await onDelete();
                  onClose();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownEditor({
  item,
  onCancel,
  onSave,
  onRemove,
}: {
  item: BreakdownItem;
  onCancel: () => void;
  onSave: (updated: BreakdownItem) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const hasGrams = item.originalPortionGrams != null;
  const [grams, setGrams] = useState(item.portionGrams?.toString() ?? "");
  const [calories, setCalories] = useState(item.calories.toString());
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  function handleGramsChange(v: string) {
    setGrams(v);
    const g = parseFloat(v);
    if (!Number.isNaN(g) && g > 0 && item.originalPortionGrams) {
      setCalories(scaleBreakdownItemGrams(item, g).calories.toString());
    }
  }

  async function handleSave() {
    if (hasGrams) {
      const g = parseFloat(grams);
      if (Number.isNaN(g) || g <= 0) return;
      await onSave(scaleBreakdownItemGrams(item, g));
    } else {
      const c = parseInt(calories, 10);
      if (Number.isNaN(c) || c < 0) return;
      await onSave(updateBreakdownItemCalories(item, c));
    }
  }

  return (
    <div className="flex flex-col gap-3 py-3">
      <p dir="auto" lang="he" className="text-end text-[15px] font-bold text-foreground">
        {item.itemHe}
      </p>
      {hasGrams ? (
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="decimal"
            value={grams}
            autoFocus
            onChange={(e) => handleGramsChange(e.target.value)}
            className="flex-1 rounded-xl bg-subtle px-3 py-2 text-[15px] tabular-nums text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
          />
          <span className="text-xs text-muted-foreground">g</span>
          <span className="text-[15px] font-bold tabular-nums text-foreground">{calories}</span>
          <span className="text-xs text-muted-foreground">kcal</span>
        </div>
      ) : (
        <input
          type="number"
          inputMode="numeric"
          value={calories}
          autoFocus
          onChange={(e) => setCalories(e.target.value)}
          className="w-full rounded-xl bg-subtle px-3 py-2 text-[15px] tabular-nums text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="accent" size="sm" className="flex-1" onClick={() => void handleSave()}>
          Save
        </Button>
      </div>
      {!confirmingRemove ? (
        <button
          type="button"
          onClick={() => setConfirmingRemove(true)}
          className="text-xs text-destructive underline-offset-2 hover:underline"
        >
          Remove this component
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-destructive">Remove?</span>
          <button
            type="button"
            onClick={() => setConfirmingRemove(false)}
            className="text-muted-foreground"
          >
            No
          </button>
          <button
            type="button"
            onClick={() => void onRemove()}
            className="font-bold text-destructive"
          >
            Yes, remove
          </button>
        </div>
      )}
    </div>
  );
}

export function MealDetailSheet({
  open,
  meal,
  onOpenChange,
  onDelete,
  onUpdateBreakdown,
  onRetryEstimate,
}: MealDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={true}>
        {meal && (
          <MealDetailContent
            key={meal.id}
            meal={meal}
            onClose={() => onOpenChange(false)}
            onDelete={onDelete}
            onUpdateBreakdown={onUpdateBreakdown}
            onRetryEstimate={onRetryEstimate}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
```

Note: `onEditText` and `onManualCalories` props are removed because those flows now live in the QuickEditSheet (Task 11). DayView (Task 23) is updated to drop those props.

- [ ] **Step 2: Delete `breakdown-edit-sheet.tsx`**

```bash
rm components/meals/breakdown-edit-sheet.tsx
```

- [ ] **Step 3: Smoke-check (compile)**

`npm run dev`. DayView will still have type errors — fixed in Task 23.

- [ ] **Step 4: Commit**

```bash
git add components/meals/meal-detail-sheet.tsx
git rm components/meals/breakdown-edit-sheet.tsx
git commit -m "feat: meal detail sheet absorbs breakdown editor, drops nested sheet"
```

---

## Task 14: Done-logging button — full-width pill

**Files:**
- Modify: `components/meals/done-logging-button.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setDayMetaDoneLogging } from "@/lib/firestore/day-meta";
import { cn } from "@/lib/utils";

interface DoneLoggingButtonProps {
  uid: string;
  date: string;
  done: boolean;
  onCelebrate: () => void;
}

export function DoneLoggingButton({
  uid,
  date,
  done,
  onCelebrate,
}: DoneLoggingButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    const next = !done;
    try {
      await setDayMetaDoneLogging(uid, date, next);
      if (next) onCelebrate();
    } catch (err) {
      console.error("Failed to toggle doneLogging", err);
      toast.error("Couldn't save — try again");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "mt-5 mb-2 w-full rounded-2xl py-4 text-[15px] font-semibold transition-colors",
        done
          ? "bg-subtle text-muted-foreground"
          : "bg-accent text-accent-foreground hover:bg-accent/90"
      )}
    >
      {done ? "✓ Logged today · tap to undo" : "Done logging for today"}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/meals/done-logging-button.tsx
git commit -m "style: done-logging button as full-width teal pill"
```

---

## Task 15: Streak celebration — white background with confetti

**Files:**
- Modify: `components/meals/streak-celebration.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface StreakCelebrationProps {
  streak: number;
  onClose: () => void;
}

export function StreakCelebration({ streak, onClose }: StreakCelebrationProps) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fire = (origin: { x: number; y: number }, angle: number) =>
      confetti({
        particleCount: 80,
        spread: 70,
        origin,
        angle,
        startVelocity: 45,
        gravity: 0.9,
        colors: ["#4FB6A5", "#7DD3C0", "#f9d423", "#ff6b6b", "#a78bfa"],
      });

    const t = setTimeout(() => {
      fire({ x: 0.1, y: 1 }, 60);
      fire({ x: 0.9, y: 1 }, 120);
    }, 80);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    if (streak === 0) {
      el.textContent = "0";
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * streak);
      if (el) el.textContent = String(current);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [streak]);

  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95"
      onClick={onClose}
    >
      <div className="pointer-events-none flex select-none flex-col items-center gap-3">
        <span
          ref={numRef}
          className="text-[96px] font-bold leading-none tabular-nums text-accent"
        >
          0
        </span>
        <span className="text-xl text-foreground">🔥 days in a row</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/meals/streak-celebration.tsx
git commit -m "style: streak celebration on white background with teal number"
```

---

## Task 16: Weight chart — line, grid, tooltip

**Files:**
- Modify: `components/weight/weight-chart.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightEntry } from "@/types/weight";
import { formatMonthDay } from "@/lib/dates/jerusalem";

interface WeightChartProps {
  data: WeightEntry[];
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-14 text-center text-sm text-muted-foreground">
        Log a weight to see your trend
      </p>
    );
  }

  const chartData = data.map((e) => ({
    date: e.date,
    label: formatMonthDay(e.date),
    weight: Math.round(e.weightKg * 10) / 10,
  }));

  const min = Math.min(...chartData.map((d) => d.weight));
  const max = Math.max(...chartData.map((d) => d.weight));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--hairline)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis
            domain={[Math.floor((min - 0.5) * 10) / 10, Math.ceil((max + 0.5) * 10) / 10]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            width={42}
          />
          <Tooltip
            cursor={{ stroke: "var(--hairline)", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { label: string; weight: number };
              return (
                <div className="rounded-xl border border-hairline bg-surface px-3 py-2 shadow-md">
                  <p className="text-[13px] font-bold text-foreground">{p.label}</p>
                  <p className="text-xs text-accent">
                    weight : <span className="tabular-nums">{p.weight.toFixed(1)}</span>
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--accent)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--accent)", stroke: "var(--accent)" }}
            activeDot={{ r: 5, fill: "var(--accent)", stroke: "var(--background)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Smoke-check**

Visit `/weight` with some entries. Expect: line chart with horizontal dashed grid, teal line + dots, date labels along the X axis, weight labels along the Y axis.

- [ ] **Step 3: Commit**

```bash
git add components/weight/weight-chart.tsx
git commit -m "style: weight chart matches Figma (line, grid, axis ticks, tooltip)"
```

---

## Task 17: Weight entry list — pill rows with edit/trash

**Files:**
- Modify: `components/weight/weight-entry-list.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { WeightEntry } from "@/types/weight";
import { formatMonthDay, formatYear } from "@/lib/dates/jerusalem";

interface WeightEntryListProps {
  entries: WeightEntry[];
  onEdit: (entry: WeightEntry) => void;
  onDelete: (entry: WeightEntry) => void;
}

function WeightRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: WeightEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-subtle px-4 py-3">
      <span className="flex-1 text-[14px] text-muted-foreground">
        {formatMonthDay(entry.date)}, {formatYear(entry.date)}
      </span>
      <span className="text-[15px] font-bold tabular-nums text-foreground">
        {entry.weightKg.toFixed(1)} kg
      </span>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit weight"
        className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete weight"
        className="inline-flex h-7 w-7 items-center justify-center text-destructive transition-opacity hover:opacity-70"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function WeightEntryList({ entries, onEdit, onDelete }: WeightEntryListProps) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[15px] font-bold text-foreground">Recent entries</h2>
      <div className="flex flex-col gap-2">
        {entries.slice(0, 30).map((entry) => (
          <WeightRow
            key={entry.id}
            entry={entry}
            onEdit={() => onEdit(entry)}
            onDelete={() => onDelete(entry)}
          />
        ))}
      </div>
    </section>
  );
}
```

Note: drops the swipe-to-reveal pattern in favor of always-visible icons (Figma shows them inline).

- [ ] **Step 2: Smoke-check**

`/weight` with entries — expect light gray pill rows with date, weight, pencil, trash icons.

- [ ] **Step 3: Commit**

```bash
git add components/weight/weight-entry-list.tsx
git commit -m "style: weight entry list as pill rows with inline edit/trash"
```

---

## Task 18: Log weight sheet — Figma styling

**Files:**
- Modify: `components/weight/log-weight-sheet.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";

interface LogWeightSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultWeight?: number;
  onSave: (date: string, weightKg: number) => Promise<void>;
}

function LogWeightForm({
  defaultDate,
  defaultWeight,
  onSave,
  onCancel,
}: {
  defaultDate?: string;
  defaultWeight?: number;
  onSave: (date: string, weightKg: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(defaultDate ?? getJerusalemDateString());
  const [weight, setWeight] = useState(defaultWeight?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kg = parseFloat(weight);
    if (Number.isNaN(kg) || kg <= 0) return;
    setSaving(true);
    try {
      await onSave(date, Math.round(kg * 10) / 10);
    } finally {
      setSaving(false);
    }
  }

  const isEdit = defaultWeight != null;
  const canSave = !saving && weight.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2">
      <header className="flex items-center justify-between border-b border-hairline pb-3 pr-10">
        <h2 className="text-[18px] font-bold text-foreground">
          {isEdit ? "Edit weight" : "Log weight"}
        </h2>
      </header>

      <div className="flex flex-col gap-2">
        <label htmlFor="weight-kg" className="text-[15px] font-bold text-foreground">
          Weight (kg)
        </label>
        <div className="flex items-center gap-2">
          <input
            id="weight-kg"
            ref={inputRef}
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="78.4"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 rounded-xl bg-subtle px-4 py-3 text-[17px] tabular-nums text-foreground outline-none ring-2 ring-accent focus:ring-accent"
            style={{ MozAppearance: "textfield" } as React.CSSProperties}
          />
          <span className="text-sm text-muted-foreground">kg</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="weight-date" className="text-[15px] font-bold text-foreground">
          Date
        </label>
        <input
          id="weight-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl bg-subtle px-4 py-3 text-[15px] text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={!canSave}
        className="w-full"
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

export function LogWeightSheet({
  open,
  onOpenChange,
  defaultDate,
  defaultWeight,
  onSave,
}: LogWeightSheetProps) {
  const formKey = open ? `${defaultDate ?? "new"}-${defaultWeight ?? "new"}` : "closed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={true}>
        {open && (
          <LogWeightForm
            key={formKey}
            defaultDate={defaultDate}
            defaultWeight={defaultWeight}
            onSave={async (date, weightKg) => {
              await onSave(date, weightKg);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/weight/log-weight-sheet.tsx
git commit -m "style: log weight sheet matches Figma input + CTA"
```

---

## Task 19: Weight page — Figma layout

**Files:**
- Modify: `app/(app)/weight/page.tsx`
- Delete: `components/weight/weight-today-card.tsx` (its functionality is replaced by an inline strip in DayView in Task 23)

- [ ] **Step 1: Rewrite `app/(app)/weight/page.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/weight/weight-chart";
import { WeightEntryList } from "@/components/weight/weight-entry-list";
import { LogWeightSheet } from "@/components/weight/log-weight-sheet";
import { useAuth } from "@/components/providers/auth-provider";
import { useWeights } from "@/hooks/use-weights";
import {
  deleteWeight,
  filterWeightsByRange,
  getWeightDelta,
  upsertWeight,
} from "@/lib/firestore/weights";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";
import type { WeightEntry } from "@/types/weight";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: null as number | null },
] as const;

function deltaClass(value: number | null): string {
  if (value == null || value === 0) return "text-muted-foreground";
  return value < 0 ? "text-accent" : "text-destructive";
}

function deltaText(value: number | null): string {
  if (value == null) return "—";
  if (value === 0) return "0 kg";
  const sign = value < 0 ? "-" : "+";
  return `${sign}${Math.abs(value).toFixed(1)} kg`;
}

export default function WeightPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const { entries, loading } = useWeights(uid);
  const today = getJerusalemDateString();

  const [rangeDays, setRangeDays] = useState<number | null>(30);
  const [logOpen, setLogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<WeightEntry | null>(null);

  const chartData = useMemo(() => filterWeightsByRange(entries, rangeDays), [entries, rangeDays]);

  const latest = entries.find((e) => e.date <= today);
  const delta7 = latest ? getWeightDelta(entries, 7, today) : null;
  const delta30 = latest ? getWeightDelta(entries, 30, today) : null;

  return (
    <div className="editorial-in">
      <header className="border-b border-hairline py-4">
        <h1 className="text-[22px] font-bold text-foreground">Weight</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="pulse-dot text-2xl text-muted-foreground">·</span>
        </div>
      ) : (
        <>
          <section className="border-b border-hairline py-5">
            <p className="text-sm text-muted-foreground">Current</p>
            {latest ? (
              <p className="mt-1 text-[36px] font-bold leading-none tabular-nums text-foreground">
                {latest.weightKg.toFixed(1)} kg
              </p>
            ) : (
              <p className="mt-1 text-[24px] text-muted-foreground">No weight logged yet</p>
            )}
          </section>

          <section className="grid grid-cols-2 gap-4 border-b border-hairline py-4">
            <div>
              <p className="text-sm text-muted-foreground">vs. 7 days ago</p>
              <p className={cn("mt-1 text-[17px] font-bold tabular-nums", deltaClass(delta7))}>
                {deltaText(delta7)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">vs. 30 days ago</p>
              <p className={cn("mt-1 text-[17px] font-bold tabular-nums", deltaClass(delta30))}>
                {deltaText(delta30)}
              </p>
            </div>
          </section>

          <section className="border-b border-hairline py-4">
            <div className="flex gap-2">
              {RANGES.map(({ label, days }) => {
                const active = rangeDays === days;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setRangeDays(days)}
                    className={cn(
                      "rounded-pill px-3.5 py-1.5 text-[13px] font-bold tabular-nums transition-colors",
                      active ? "bg-accent text-accent-foreground" : "bg-subtle text-foreground"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="border-b border-hairline py-4">
            <WeightChart data={chartData} />
          </section>

          <div className="pt-5">
            <Button variant="accent" size="lg" className="w-full" onClick={() => setLogOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Log weight
            </Button>
          </div>

          <WeightEntryList
            entries={entries}
            onEdit={(entry) => {
              setEditEntry(entry);
              setLogOpen(true);
            }}
            onDelete={async (entry) => {
              if (!uid) return;
              await deleteWeight(uid, entry.date);
            }}
          />
        </>
      )}

      <LogWeightSheet
        open={logOpen}
        onOpenChange={(open) => {
          setLogOpen(open);
          if (!open) setEditEntry(null);
        }}
        defaultDate={editEntry?.date}
        defaultWeight={editEntry?.weightKg}
        onSave={async (date, weightKg) => {
          if (!uid) return;
          await upsertWeight(uid, date, weightKg);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Delete the now-unused weight-today-card**

```bash
rm components/weight/weight-today-card.tsx
```

- [ ] **Step 3: Smoke-check**

Visit `/weight`. Expect: title, current weight, two deltas, range pills, chart, log-weight CTA, recent list.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/weight/page.tsx
git rm components/weight/weight-today-card.tsx
git commit -m "feat: weight page restructured to match Figma; delete weight-today-card"
```

---

## Task 20: Settings page — clean light form

**Files:**
- Modify: `app/(app)/settings/page.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useRef, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getClientDb } from "@/lib/firebase/client";
import { userDoc } from "@/lib/firestore/paths";
import {
  DEFAULT_WEEKDAY_TARGET,
  DEFAULT_WEEKEND_TARGET,
} from "@/types/user";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const uid = user?.uid;
  const { profile, loading } = useUserProfile(uid);

  return (
    <div className="editorial-in">
      <header className="border-b border-hairline py-4">
        <h1 className="text-[22px] font-bold text-foreground">Settings</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="pulse-dot text-2xl text-muted-foreground">·</span>
        </div>
      ) : (
        <div className="flex flex-col">
          <section className="border-b border-hairline py-5">
            <p className="text-[15px] font-bold text-foreground">Daily calorie target</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Israeli week — weekend is Friday & Saturday.
            </p>
            <div className="mt-5 flex flex-col gap-5">
              <TargetField
                key={`wd-${profile?.weekdayCalorieTarget}`}
                uid={uid}
                field="weekdayCalorieTarget"
                label="Sun – Thu"
                initial={profile?.weekdayCalorieTarget ?? DEFAULT_WEEKDAY_TARGET}
              />
              <TargetField
                key={`we-${profile?.weekendCalorieTarget}`}
                uid={uid}
                field="weekendCalorieTarget"
                label="Fri – Sat"
                initial={profile?.weekendCalorieTarget ?? DEFAULT_WEEKEND_TARGET}
              />
            </div>
          </section>

          <section className="border-b border-hairline py-5">
            <p className="text-[15px] font-bold text-foreground">Account</p>
            <p className="mt-2 text-sm text-foreground/85">{user?.email}</p>
            <Button
              variant="destructive"
              size="default"
              className="mt-4"
              onClick={() => void signOut()}
            >
              Sign out
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}

interface TargetFieldProps {
  uid: string | undefined;
  field: "weekdayCalorieTarget" | "weekendCalorieTarget";
  label: string;
  initial: number;
}

function TargetField({ uid, field, label, initial }: TargetFieldProps) {
  const [value, setValue] = useState(String(initial));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function commit() {
    if (!uid) return;
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 500 || parsed > 10000) {
      toast.error("Target must be between 500 and 10,000");
      setValue(String(initial));
      return;
    }
    if (parsed === initial) return;
    setSaving(true);
    try {
      await updateDoc(doc(getClientDb(), userDoc(uid)), { [field]: parsed });
      toast.success("Target updated");
    } catch {
      toast.error("Couldn't save target");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-foreground/85">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") inputRef.current?.blur();
          }}
          className="flex-1 rounded-xl bg-subtle px-4 py-3 text-[17px] tabular-nums text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
        <span className="text-sm text-muted-foreground">{saving ? "saving…" : "kcal"}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Smoke-check**

Visit `/settings`. Expect: title, two numeric inputs in light gray pills, "Sign out" destructive button.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/settings/page.tsx
git commit -m "style: settings page matches Figma light form"
```

---

## Task 21: Login page — single teal CTA

**Files:**
- Modify: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FirebaseSetupHelp } from "@/components/auth/firebase-setup-help";
import { useAuth } from "@/components/providers/auth-provider";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase/config";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [showSetupHelp, setShowSetupHelp] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(`/day/${getJerusalemDateString()}`);
    }
  }, [user, loading, router]);

  async function handleSignIn() {
    setSigningIn(true);
    setShowSetupHelp(false);
    try {
      await signInWithGoogle();
      router.replace(`/day/${getJerusalemDateString()}`);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      const code = error instanceof FirebaseError ? error.code : "unknown";
      const message =
        getFirebaseAuthErrorMessage(code) ??
        (error instanceof Error ? error.message : "Sign-in failed");
      toast.error(message);
      if (code === "auth/configuration-not-found" || code === "auth/operation-not-allowed") {
        setShowSetupHelp(true);
      }
    } finally {
      setSigningIn(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <span className="pulse-dot text-2xl text-muted-foreground">·</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-10 bg-background px-6">
      <div className="text-center">
        <h1 className="text-[32px] font-bold leading-none text-foreground">Diet</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A quiet calorie & weight journal
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button
          variant="accent"
          size="lg"
          className="w-full"
          onClick={handleSignIn}
          disabled={signingIn}
        >
          {signingIn ? "Signing in…" : "Continue with Google"}
        </Button>
        {showSetupHelp && <FirebaseSetupHelp />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Smoke-check**

Sign out, visit `/login`. Expect: white background, centered "Diet" title, teal pill CTA.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/login/page.tsx
git commit -m "style: login page minimal centered with teal CTA"
```

---

## Task 22: Inline weight strip helper

Build a tiny component for the inline weight strip used on Today (replaces `WeightTodayCard`).

**Files:**
- Create: `components/weight/weight-today-strip.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import Link from "next/link";
import { useWeights } from "@/hooks/use-weights";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";
import { getWeightDelta } from "@/lib/firestore/weights";
import { cn } from "@/lib/utils";

interface WeightTodayStripProps {
  uid: string;
}

export function WeightTodayStrip({ uid }: WeightTodayStripProps) {
  const { entries, loading } = useWeights(uid);
  const today = getJerusalemDateString();
  const latest = entries.find((e) => e.date <= today);

  if (loading || !latest) return null;

  const delta7 = getWeightDelta(entries, 7, today);
  const showDelta = delta7 != null && delta7 !== 0;
  const dropping = delta7 != null && delta7 < 0;

  return (
    <Link
      href="/weight"
      className="flex items-center justify-between border-b border-hairline py-3"
    >
      <span className="text-sm text-muted-foreground">Weight:</span>
      <span className="flex items-baseline gap-2">
        <span className="text-[15px] font-bold tabular-nums text-foreground">
          {latest.weightKg.toFixed(1)} kg
        </span>
        {showDelta && (
          <span className={cn("text-sm tabular-nums", dropping ? "text-accent" : "text-destructive")}>
            {dropping ? "" : "+"}
            {delta7!.toFixed(1)} kg (7d)
          </span>
        )}
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/weight/weight-today-strip.tsx
git commit -m "feat: add WeightTodayStrip for inline weight row on Today"
```

---

## Task 23: DayView assembly — wire everything together

**Files:**
- Modify: `components/meals/day-view.tsx`

This task wires up all the new pieces: replaces `WeightTodayCard` with the strip, splits row taps between quick-edit and detail, and drops `onEditText`/`onManualCalories` from the detail sheet props.

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";
import { DayHeader } from "@/components/layout/day-header";
import { CalorieHero } from "./calorie-progress";
import { MealSlotSection } from "./meal-slot-section";
import { AddMealSheet } from "./add-meal-sheet";
import { MealDetailSheet } from "./meal-detail-sheet";
import { QuickEditSheet } from "./quick-edit-sheet";
import { WeightTodayStrip } from "@/components/weight/weight-today-strip";
import { useAuth } from "@/components/providers/auth-provider";
import { useMealsForDate, useDayTotals } from "@/hooks/use-meals-for-date";
import { getTargetForDate, useUserProfile } from "@/hooks/use-user-profile";
import { useDayMeta } from "@/hooks/use-day-meta";
import { SportToggle } from "./sport-toggle";
import { DoneLoggingButton } from "./done-logging-button";
import { StreakCelebration } from "./streak-celebration";
import { useStreak } from "@/hooks/use-streak";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import {
  addDaysToDateString,
  getJerusalemDateString,
  subtractDaysFromDateString,
} from "@/lib/dates/jerusalem";
import {
  applyEstimateToMeal,
  createMealFromEstimate,
  createMealManual,
  deleteMeal,
  updateMealBreakdown,
  updateMealManualCalories,
  updateMealText,
} from "@/lib/firestore/meals";
import { fetchMealEstimate } from "@/lib/estimation/fetch-estimate";
import { MEAL_SLOTS, type MealSlot } from "@/types/meal";

interface DayViewProps {
  date: string;
}

export function DayView({ date }: DayViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const uid = user?.uid;
  const { profile } = useUserProfile(uid);
  const { bySlot, meals, loading } = useMealsForDate(uid, date);
  const { meta } = useDayMeta(uid, date);
  const baseTarget = getTargetForDate(profile, date);
  const sportBonus = meta?.sport ? meta.sportBonusKcal || SPORT_BONUS_KCAL : 0;
  const target = baseTarget + sportBonus;
  const { consumed, remaining } = useDayTotals(meals, target);

  const { streak, todayDone } = useStreak(uid);
  const isToday = date === getJerusalemDateString();

  const [addSlot, setAddSlot] = useState<MealSlot | null>(null);
  const [quickEditMealId, setQuickEditMealId] = useState<string | null>(null);
  const [detailMealId, setDetailMealId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const quickEditMeal = useMemo(
    () => (quickEditMealId ? meals.find((m) => m.id === quickEditMealId) ?? null : null),
    [quickEditMealId, meals]
  );
  const detailMeal = useMemo(
    () => (detailMealId ? meals.find((m) => m.id === detailMealId) ?? null : null),
    [detailMealId, meals]
  );

  const goToDate = useCallback(
    (next: string) => router.push(`/day/${next}`),
    [router]
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => goToDate(addDaysToDateString(date, 1)),
    onSwipedRight: () => goToDate(subtractDaysFromDateString(date, 1)),
    trackMouse: false,
    delta: 40,
  });

  async function runEstimateAfterEdit(mealId: string, text: string) {
    if (!uid) return;
    try {
      const { estimate, source } = await fetchMealEstimate(uid, text);
      await applyEstimateToMeal(uid, mealId, estimate, source);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not estimate calories";
      toast.error(msg, { description: "Tap the entry to enter calories manually." });
    }
  }

  async function handleConfirmAdd(params: {
    text: string;
    estimate: Awaited<ReturnType<typeof fetchMealEstimate>>["estimate"];
    source: "AI" | "AI_CACHED";
  }) {
    if (!uid || !addSlot) return;
    await createMealFromEstimate(uid, { date, slot: addSlot, ...params });
  }

  async function handleManualAdd(params: { text: string; calories: number }) {
    if (!uid || !addSlot) return;
    await createMealManual(uid, {
      date,
      slot: addSlot,
      text: params.text,
      calories: params.calories,
    });
  }

  return (
    <div {...handlers} className="editorial-in">
      <DayHeader
        date={date}
        onPrev={() => goToDate(subtractDaysFromDateString(date, 1))}
        onNext={() => goToDate(addDaysToDateString(date, 1))}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="pulse-dot text-xl text-muted-foreground">·</span>
        </div>
      ) : (
        <>
          <CalorieHero consumed={consumed} target={target} remaining={remaining} />
          {uid && <WeightTodayStrip uid={uid} />}
          {uid && (
            <SportToggle
              uid={uid}
              date={date}
              active={Boolean(meta?.sport)}
              bonusKcal={meta?.sportBonusKcal ?? SPORT_BONUS_KCAL}
            />
          )}

          {MEAL_SLOTS.map(({ slot, label }) => (
            <MealSlotSection
              key={slot}
              slot={slot}
              label={label}
              meals={bySlot[slot]}
              onAdd={(s) => setAddSlot(s)}
              onSelectMeal={(meal) => setQuickEditMealId(meal.id)}
              onShowDetail={(meal) => setDetailMealId(meal.id)}
            />
          ))}

          {uid && isToday && (
            <DoneLoggingButton
              uid={uid}
              date={date}
              done={todayDone}
              onCelebrate={() => setCelebrating(true)}
            />
          )}

          {celebrating && (
            <StreakCelebration streak={streak} onClose={() => setCelebrating(false)} />
          )}
        </>
      )}

      <AddMealSheet
        open={addSlot !== null}
        slot={addSlot}
        uid={uid}
        onOpenChange={(open) => {
          if (!open) setAddSlot(null);
        }}
        onConfirm={handleConfirmAdd}
        onManualSave={handleManualAdd}
      />

      <QuickEditSheet
        open={quickEditMealId !== null}
        meal={quickEditMeal}
        onOpenChange={(open) => {
          if (!open) setQuickEditMealId(null);
        }}
        onSaveText={async (text) => {
          if (!uid || !quickEditMealId) return;
          await updateMealText(uid, quickEditMealId, text);
          void runEstimateAfterEdit(quickEditMealId, text);
        }}
        onSaveCalories={async (calories) => {
          if (!uid || !quickEditMealId) return;
          await updateMealManualCalories(uid, quickEditMealId, calories);
        }}
      />

      <MealDetailSheet
        open={detailMealId !== null}
        meal={detailMeal}
        onOpenChange={(open) => {
          if (!open) setDetailMealId(null);
        }}
        onDelete={async () => {
          if (!uid || !detailMealId) return;
          await deleteMeal(uid, detailMealId);
          setDetailMealId(null);
        }}
        onUpdateBreakdown={async (breakdown) => {
          if (!uid || !detailMealId) return;
          await updateMealBreakdown(uid, detailMealId, breakdown);
        }}
        onRetryEstimate={async () => {
          if (!detailMeal) return;
          await runEstimateAfterEdit(detailMeal.id, detailMeal.text);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Smoke-check**

Visit `/day/<today>`. Expect:
- Day header, calorie hero, weight strip, sport pill, four meal sections, done-logging pill.
- Tap a meal row → QuickEditSheet opens. Tap ⓘ → MealDetailSheet opens with breakdown editing.
- Add a meal → AddMealSheet → row appears in list.

- [ ] **Step 3: Commit**

```bash
git add components/meals/day-view.tsx
git commit -m "feat: DayView assembles new components and splits row tap behavior"
```

---

## Task 24: App layout shell — keep it but verify

**Files:**
- Inspect: `app/(app)/layout.tsx`

- [ ] **Step 1: Verify no changes needed**

Open the file. It already does `max-w-[480px]`, `px-5`, `pb-28`, and renders `<BottomNav />`. No changes required for this task.

If the file uses any dark-only colors (it should not), update them.

- [ ] **Step 2: Smoke-check**

`npm run dev`, navigate between `/day/<today>`, `/weight`, `/settings`. Expect: layout consistent across screens, bottom nav stays fixed.

- [ ] **Step 3: No commit needed** if no changes were made.

---

## Task 25: Final visual walkthrough

**Files:** none modified

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Walk through every screen and feature**

Sign in (or already signed in). Visit each screen and verify against the Figma:

| Screen | What to verify |
|---|---|
| `/day/<today>` | Header chevrons + date · calorie hero (bold number, teal bar, teal "remaining") · weight strip · sport pill chip · 4 meal sections with emoji + circular `+` · done-logging pill · bottom nav with teal active "Today" |
| Add meal | Bottom sheet, Hebrew textarea, "Add meal" teal pill · row appears with `…` then resolves to a kcal value |
| Row tap | Opens QuickEditSheet · changing text re-estimates · changing calories overrides manually |
| Row ⓘ tap | Opens MealDetailSheet · tap breakdown row → inline editor · Delete entry → confirmation → row removed |
| Sport toggle | Pill chip toggles between teal-filled and grey · target updates in calorie hero |
| Done logging | Pill changes between "Done logging for today" and "✓ Logged today" · celebrates with confetti on transition to done |
| `/weight` | Title · Current weight · 7d/30d deltas (teal if down, red if up) · range pills · line chart with grid and tooltip · "+ Log weight" teal pill · recent entries as light gray pill rows |
| Log weight | Bottom sheet with number input + date · Save pill |
| `/settings` | Title · two calorie target inputs · Sign out red ghost |
| `/login` (sign out first) | White background · centered "Diet" + teal CTA |

- [ ] **Step 3: Check for stragglers**

Run a quick grep to find any forgotten dark-mode classes or removed font references:

```bash
grep -rn "font-display\|var(--font-display)\|var(--font-heading)\|font-heading\|\\.dark " components app
```

Expected: no results, or only false positives in third-party comments. Fix any remaining references inline.

- [ ] **Step 4: Final commit (only if step 3 produced fixes)**

```bash
git add -A
git commit -m "style: clean up straggling dark-mode + serif font references"
```

- [ ] **Step 5: Optional — uninstall unused dependency**

`next-themes` is no longer used. Confirm with `grep -r "next-themes" app components hooks lib` (expect no results), then:

```bash
npm uninstall next-themes
git add package.json package-lock.json
git commit -m "chore: drop unused next-themes dep"
```

---

## Self-review notes

- **Spec coverage:** Each section of the spec maps to a task — tokens (1), layout/fonts (2), button (3), sheet (4), bottom nav (5), day header (6), calorie hero (7), sport toggle (8), meal slot (9), meal row + ⓘ (10), quick edit (11), add meal (12), meal detail merged with breakdown editor (13), done logging (14), streak (15), weight chart (16), weight list (17), log weight (18), weight page (19), settings (20), login (21), inline weight strip (22), DayView assembly (23), final walkthrough (25).
- **Card.tsx, progress.tsx, input.tsx, dialog.tsx, label.tsx:** The spec lists these for cleanup but the new components above don't import them (they use raw `<input>`, `<label>`, etc., styled inline). They can be left as-is; if the engineer wants to scrub dark-mode classes from them for hygiene, that's a discretionary follow-up.
- **Compile errors between tasks:** Tasks 9, 10, 13 intentionally leave the tree with type errors that Task 23 resolves. The plan is sized so the engineer reaches Task 23 in the same session.
- **AI failure fallback in add-meal-sheet:** The fallback persists a row with `calories: 0`. If `createMealManual` rejects zero, Task 12 step 2 asks the engineer to switch to `1`. Don't skip that step.
