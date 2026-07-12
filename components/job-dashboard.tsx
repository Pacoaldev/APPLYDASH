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
      const next = prev
        .filter((j) => !filteredIds.has(j.id) || updatedMap.has(j.id))
        .map((j) => updatedMap.get(j.id) ?? j);
      for (const j of updated) {
        if (!next.some((n) => n.id === j.id)) next.push(j);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <DashboardStats jobs={jobs} />

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-3">
        <QuickFilters active={filter} onChange={setFilter} className="mb-0 flex-1" />
        <div className="flex items-center gap-2 shrink-0">
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
