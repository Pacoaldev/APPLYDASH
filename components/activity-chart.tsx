"use client";

import { useMemo, useState } from "react";
import { Job } from "@/types/job";
import { useLocale } from "@/components/locale-provider";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";

type Props = { jobs: Job[] };

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  // Get Monday of the week
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

function formatWeekLabel(weekKey: string, locale: string): string {
  const d = new Date(weekKey);
  if (isNaN(d.getTime())) return weekKey;
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function ActivityChart({ jobs }: Props) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);

  const chartData = useMemo(() => {
    if (jobs.length === 0) return [];

    // Group jobs by week
    const byWeek = new Map<string, number>();
    for (const job of jobs) {
      if (!job.appliedDate) continue;
      const key = getWeekKey(job.appliedDate);
      if (!key) continue;
      byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
    }

    if (byWeek.size === 0) return [];

    // Fill gaps between first and last week
    const sorted = Array.from(byWeek.keys()).sort();
    const first = new Date(sorted[0]);
    const last = new Date(sorted[sorted.length - 1]);
    const data: { week: string; label: string; count: number }[] = [];

    const cursor = new Date(first);
    while (cursor <= last) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      data.push({
        week: key,
        label: formatWeekLabel(key, locale),
        count: byWeek.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 7);
    }

    return data;
  }, [jobs, locale]);

  if (chartData.length < 2) return null;

  const totalWeeks = chartData.length;
  const peakWeek = chartData.reduce((a, b) => (b.count > a.count ? b : a));
  const avgPerWeek = (jobs.filter(j => j.appliedDate).length / totalWeeks).toFixed(1);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm mb-3 overflow-hidden">
      {/* Header — always visible, click to toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">
            {locale === "es" ? "Actividad semanal" : "Weekly activity"}
          </span>
          <span className="text-xs text-muted-foreground">
            · {locale === "es" ? `${avgPerWeek}/semana` : `${avgPerWeek}/week`}
          </span>
          <span className="text-xs text-muted-foreground">
            · {locale === "es" ? `pico: ${peakWeek.count} (${peakWeek.label})` : `peak: ${peakWeek.count} (${peakWeek.label})`}
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {/* Chart — collapsible */}
      {open && (
        <div className="px-4 pb-4 pt-1">
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                itemStyle={{ color: "#3b82f6" }}
                formatter={(v: number) => [v, locale === "es" ? "candidaturas" : "applications"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorCount)"
                dot={{ fill: "#3b82f6", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
