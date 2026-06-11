"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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
  // Dots add noise on dense ranges; show them only when each point is scannable.
  const showDots = chartData.length <= 35;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.16} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
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
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { label: string; weight: number };
              return (
                <div className="rounded-xl border border-hairline bg-surface px-3 py-2 shadow-md">
                  <p className="text-[13px] font-bold text-foreground">{p.label}</p>
                  <p className="text-xs tabular-nums text-accent">{p.weight.toFixed(1)} kg</p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="var(--accent)"
            strokeWidth={2.5}
            fill="url(#weightFill)"
            dot={showDots ? { r: 3, fill: "var(--accent)", stroke: "var(--accent)" } : false}
            activeDot={{ r: 5, fill: "var(--accent)", stroke: "var(--background)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
