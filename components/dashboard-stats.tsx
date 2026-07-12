"use client";

import { Job } from "@/types/job";
import { computeStats } from "@/lib/job-utils";
import { useLocale } from "@/components/locale-provider";
import { Briefcase, TrendingUp, Users, Trophy, XCircle, Bell } from "lucide-react";

type Props = { jobs: Job[] };

export function DashboardStats({ jobs }: Props) {
  const { t } = useLocale();
  const stats = computeStats(jobs);

  const cards = [
    { label: t.dashboard.stats.total, value: stats.total, icon: Briefcase, color: "text-blue-600" },
    { label: t.dashboard.stats.responseRate, value: `${stats.responseRate}%`, icon: TrendingUp, color: "text-green-600" },
    { label: t.dashboard.stats.interviewing, value: stats.interviewing, icon: Users, color: "text-amber-600" },
    { label: t.dashboard.stats.offers, value: stats.offers, icon: Trophy, color: "text-emerald-600" },
    { label: t.dashboard.stats.rejected, value: stats.rejected, icon: XCircle, color: "text-red-600" },
    { label: t.dashboard.stats.followUpDue, value: stats.followUpDue, icon: Bell, color: "text-cyan-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <card.icon className={`h-4 w-4 ${card.color}`} />
            <span className="text-xs text-muted-foreground truncate">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
