"use client";

import { JobFilter } from "@/types/job";
import { useLocale } from "@/components/locale-provider";

type Props = {
  active: JobFilter;
  onChange: (filter: JobFilter) => void;
};

const FILTERS: JobFilter[] = [
  "all",
  "thisWeek",
  "interviewing",
  "noResponse14",
  "followUpDue",
  "offers",
];

export function QuickFilters({ active, onChange }: Props) {
  const { t } = useLocale();

  const labels: Record<JobFilter, string> = {
    all: t.dashboard.filters.all,
    thisWeek: t.dashboard.filters.thisWeek,
    interviewing: t.dashboard.filters.interviewing,
    noResponse14: t.dashboard.filters.noResponse14,
    followUpDue: t.dashboard.filters.followUpDue,
    offers: t.dashboard.filters.offers,
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            active === filter
              ? "bg-blue-600 text-white shadow"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          {labels[filter]}
        </button>
      ))}
    </div>
  );
}
