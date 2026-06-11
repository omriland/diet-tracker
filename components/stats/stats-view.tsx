"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useStats } from "@/hooks/use-stats";
import { WeeklyCaloriesChart } from "./weekly-calories-chart";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";
import { cn } from "@/lib/utils";

function StatCard({
  n,
  c,
  tone,
  stagger,
}: {
  n: string;
  c: string;
  tone?: "good" | "bad";
  stagger: number;
}) {
  return (
    <div
      className="glass stagger-in rounded-2xl p-4 text-center"
      style={{ "--stagger": stagger } as React.CSSProperties}
    >
      <div
        className={cn(
          "font-display text-[26px] font-bold leading-none tabular-nums",
          tone === "good"
            ? "text-accent"
            : tone === "bad"
              ? "text-red-dark"
              : "text-foreground"
        )}
      >
        {n}
      </div>
      <div className="mt-1.5 text-[12px] font-medium text-muted-foreground">{c}</div>
    </div>
  );
}

export function StatsView() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { stats, streaks, weekEntries, loading } = useStats(user?.uid, profile);
  const today = getJerusalemDateString();
  const good = stats.pctDaysOnTarget >= 50;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="pulse-dot text-xl text-muted-foreground">·</span>
      </div>
    );
  }

  return (
    <div className="editorial-in">
      <header className="pt-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Your numbers
        </p>
        <h1 className="font-display mt-0.5 text-[34px] font-bold leading-none text-foreground">
          Stats
        </h1>
      </header>

      <section className="glass relative mt-4 overflow-hidden rounded-3xl px-5 py-8 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            backgroundColor: good
              ? "rgba(205, 251, 81, 0.14)"
              : "rgba(255, 122, 110, 0.14)",
          }}
        />
        <div
          className={cn(
            "font-display relative text-[72px] font-bold leading-none tabular-nums",
            good ? "text-gradient-volt" : "text-gradient-ember"
          )}
        >
          {stats.pctDaysOnTarget}%
        </div>
        <div className="relative mt-2 text-sm font-medium text-muted-foreground">
          of logged days within your calorie target
        </div>
      </section>

      <div className="mt-4">
        <WeeklyCaloriesChart entries={weekEntries} today={today} />
      </div>

      <h2 className="mt-7 text-[12px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
        General statistics
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <StatCard n={`${streaks.current}`} c="day streak" tone="good" stagger={0} />
        <StatCard n={`${streaks.best}`} c="best streak" stagger={1} />
        <StatCard n={String(stats.daysOnTarget)} c="days on target" tone="good" stagger={2} />
        <StatCard n={String(stats.daysOverTarget)} c="days over target" tone="bad" stagger={3} />
        <StatCard n={String(stats.mealsLogged)} c="meals logged" stagger={4} />
        <StatCard
          n={stats.avgCaloriesPerDay.toLocaleString()}
          c="avg kcal per day"
          stagger={5}
        />
      </div>
    </div>
  );
}
