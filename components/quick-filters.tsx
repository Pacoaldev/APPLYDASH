"use client";

import { JobFilter } from "@/types/job";
import { useLocale } from "@/components/locale-provider";

type Props = {
  active: JobFilter;
  onChange: (filter: JobFilter) => void;
  className?: string;
  extra?: React.ReactNode;
};

const FILTERS: JobFilter[] = [
  "all",
  "thisWeek",
  "interviewing",
  "noResponse14",
  "noResponse21",
  "followUpDue",
  "offers",
];

export function QuickFilters({ active, onChange, className = "", extra }: Props) {
  const { t } = useLocale();

  const labels: Record<JobFilter, string> = {
    all: t.dashboard.filters.all,
    thisWeek: t.dashboard.filters.thisWeek,
    interviewing: t.dashboard.filters.interviewing,
    noResponse14: t.dashboard.filters.noResponse14,
    noResponse21: t.dashboard.filters.noResponse21,
    followUpDue: t.dashboard.filters.followUpDue,
    offers: t.dashboard.filters.offers,
  };

  return (
    <div
      className={`flex items-center gap-1.5 mb-4 max-md:w-full max-md:min-w-0 max-md:flex-nowrap max-md:overflow-x-auto max-md:overscroll-x-contain max-md:pb-1 max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:flex-wrap ${className}`}
    >
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium transition ${
            active === filter
              ? "bg-blue-600 text-white shadow"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          {labels[filter]}
        </button>
      ))}
      {extra ? <div className="flex shrink-0 gap-2">{extra}</div> : null}
    </div>
  );
}
