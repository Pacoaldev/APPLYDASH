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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            <span className="text-[11px] text-muted-foreground truncate leading-tight">{card.label}</span>
          </div>
          <p className="text-lg font-bold text-foreground leading-none">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
