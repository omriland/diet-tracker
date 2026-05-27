"use client";

import {
  Area,
  AreaChart,
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
      <p
        className="text-muted-foreground py-14 text-center text-sm italic"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Log a weight to see your trend
      </p>
    );
  }

  const chartData = data.map((e) => ({
    date: e.date,
    label: formatMonthDay(e.date),
    weightKg: e.weightKg,
  }));

  const min = Math.min(...chartData.map((d) => d.weightKg));
  const max = Math.max(...chartData.map((d) => d.weightKg));
  const firstLabel = chartData[0]?.label ?? "";
  const lastLabel = chartData[chartData.length - 1]?.label ?? "";

  return (
    <div className="relative h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 14, right: 4, left: 4, bottom: 24 }}
        >
          <defs>
            <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={false}
            axisLine={false}
            tickLine={false}
            height={0}
          />
          <YAxis
            domain={[min - 0.6, max + 0.6]}
            hide
          />
          <Tooltip
            cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { label: string; weightKg: number };
              return (
                <div className="bg-elevated border-hairline rounded-lg border px-3 py-2 shadow-lg shadow-black/40">
                  <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
                    {p.label}
                  </p>
                  <p
                    className="text-foreground mt-0.5 tabular-nums text-sm"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {p.weightKg.toFixed(1)} kg
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="weightKg"
            stroke="var(--accent)"
            strokeWidth={1.5}
            fill="url(#weight-fill)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "var(--accent)",
              stroke: "var(--background)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* X axis: just first/last label below the chart */}
      <div className="text-muted-foreground absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] tracking-[0.16em] uppercase">
        <span>{firstLabel}</span>
        <span>{lastLabel}</span>
      </div>
    </div>
  );
}
