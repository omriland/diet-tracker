"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useStats } from "@/hooks/use-stats";
import { cn } from "@/lib/utils";

function StatCard({
  n,
  c,
  tone,
}: {
  n: string;
  c: string;
  tone?: "good" | "bad";
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 text-center",
        tone === "good"
          ? "bg-green-light"
          : tone === "bad"
            ? "bg-red-light"
            : "bg-muted"
      )}
    >
      <div className="text-2xl font-extrabold tabular-nums text-foreground">{n}</div>
      <div className="mt-0.5 text-[13px] text-subtle-foreground">{c}</div>
    </div>
  );
}

export function StatsView() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { stats, streaks, loading } = useStats(user?.uid, profile);
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
      <div
        className={cn(
          "-mx-5 rounded-b-2xl px-5 py-8 text-center",
          good ? "bg-green-light" : "bg-red-light"
        )}
      >
        <div className="text-[44px] font-extrabold leading-none tabular-nums text-foreground">
          {stats.pctDaysOnTarget}%
        </div>
        <div className="mt-1 text-sm text-subtle-foreground">
          of logged days within your calorie target
        </div>
      </div>

      <h2 className="mt-6 text-center text-[13px] font-extrabold uppercase tracking-wide text-muted-foreground">
        General statistics
      </h2>

      <div className="mt-4 flex flex-col gap-3">
        <StatCard n={`${streaks.current} days`} c="current streak" tone="good" />
        <StatCard n={`${streaks.best} days`} c="best streak" />
        <StatCard n={String(stats.mealsLogged)} c="meals logged" />
        <div className="flex gap-3">
          <div className="flex-1">
            <StatCard n={String(stats.daysOnTarget)} c="days on target" tone="good" />
          </div>
          <div className="flex-1">
            <StatCard n={String(stats.daysOverTarget)} c="days over target" tone="bad" />
          </div>
        </div>
        <StatCard
          n={`${stats.avgCaloriesPerDay.toLocaleString()} kcal`}
          c="average per day"
        />
      </div>
    </div>
  );
}
