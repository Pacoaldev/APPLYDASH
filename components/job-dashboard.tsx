"use client";

import { useEffect, useMemo, useState } from "react";
import { Job, JobFilter, DashboardView } from "@/types/job";
import { filterJobs } from "@/lib/job-utils";
import { DashboardStats } from "@/components/dashboard-stats";
import { QuickFilters } from "@/components/quick-filters";
import { StatusHistoryPanel } from "@/components/status-history-panel";
import JobGrid from "@/components/jobGrid";
import { JobKanban } from "@/components/job-kanban";
import { useLocale } from "@/components/locale-provider";
import { LayoutGrid, Table2 } from "lucide-react";

type Props = { data: Job[] };

export function JobDashboard({ data }: Props) {
  const { t } = useLocale();
  const [jobs, setJobs] = useState<Job[]>(data);
  const [filter, setFilter] = useState<JobFilter>("all");
  const [view, setView] = useState<DashboardView>("table");
  const [historyJob, setHistoryJob] = useState<Job | null>(null);

  useEffect(() => {
    setJobs(data);
  }, [data]);

  const filteredJobs = useMemo(() => filterJobs(jobs, filter), [jobs, filter]);

  const handleJobsChange = (updated: Job[]) => {
    const updatedMap = new Map(updated.map((j) => [j.id, j]));
    const filteredIds = new Set(filteredJobs.map((j) => j.id));
    setJobs((prev) => {
      // Replace in-place and keep original order — never reorder
      const next = prev
        .filter((j) => !filteredIds.has(j.id) || updatedMap.has(j.id))
        .map((j) => updatedMap.get(j.id) ?? j);
      // Append genuinely new jobs (adds) at the end
      for (const j of updated) {
        if (!next.some((n) => n.id === j.id)) next.push(j);
      }
      // Preserve original insertion order by sorting against prev index
      const prevOrder = new Map(prev.map((j, i) => [j.id, i]));
      next.sort((a, b) => {
        const ai = prevOrder.get(a.id) ?? Infinity;
        const bi = prevOrder.get(b.id) ?? Infinity;
        return ai - bi;
      });
      return next;
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <DashboardStats jobs={jobs} />

      <div className="flex flex-col gap-2 mb-3">
        {/* Filters row */}
        <QuickFilters active={filter} onChange={setFilter} className="mb-0" />
        {/* View toggle — right-aligned, on its own row on mobile */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              view === "table" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <Table2 className="h-4 w-4" />
            {t.dashboard.viewTable}
          </button>
          <button
            type="button"
            onClick={() => setView("kanban")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              view === "kanban" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            {t.dashboard.viewKanban}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {view === "table" ? (
        <JobGrid
          data={filteredJobs}
          onJobsChange={handleJobsChange}
          onShowHistory={setHistoryJob}
        />
        ) : (
        <JobKanban
          jobs={filteredJobs}
          onHistory={setHistoryJob}
          onJobsChange={handleJobsChange}
        />
        )}
      </div>

      <StatusHistoryPanel
        jobId={historyJob?.id ?? null}
        company={historyJob?.company ?? null}
        onClose={() => setHistoryJob(null)}
      />
    </div>
  );
}
