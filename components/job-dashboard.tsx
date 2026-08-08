"use client";

import { useEffect, useMemo, useState } from "react";
import { Job, JobFilter, DashboardView } from "@/types/job";
import { filterJobs, canonicalStatus } from "@/lib/job-utils";
import { DashboardStats } from "@/components/dashboard-stats";
import { ActivityChart } from "@/components/activity-chart";
import { QuickFilters } from "@/components/quick-filters";
import { StatusHistoryPanel } from "@/components/status-history-panel";
import { JobDetailPanel } from "@/components/job-detail-panel";
import JobGrid from "@/components/jobGrid";
import { MatchingHistoryPanel } from "@/components/matching-history-panel";
import { JobKanban } from "@/components/job-kanban";
import { useLocale } from "@/components/locale-provider";
import { LayoutGrid, Table2, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";

type Props = { data: Job[] };

export function JobDashboard({ data }: Props) {
  const { t, locale } = useLocale();
  const [jobs, setJobs] = useState<Job[]>(data);
  const [filter, setFilter] = useState<JobFilter>("all");
  const [hideRejected, setHideRejected] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem("applydash-hide-rejected") === "true"; } catch { return false; }
  });
  const [hideGhosted, setHideGhosted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem("applydash-hide-ghosted") === "true"; } catch { return false; }
  });
  const [view, setView] = useState<DashboardView>("table");
  const [historyJob, setHistoryJob] = useState<Job | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [matchingJob, setMatchingJob] = useState<Job | null>(null);
  const [showStats, setShowStats] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem("applydash-show-stats") === "true"; } catch { return false; }
  });

  useEffect(() => {
    setJobs(data);
  }, [data]);

  const rejectedCount = useMemo(() => 
    jobs.filter((j) => {
      const status = canonicalStatus(j.status);
      return status === "Rejected" || status === "Closed";
    }).length,
    [jobs]
  );

  const ghostedCount = useMemo(() => 
    jobs.filter((j) => {
      const status = canonicalStatus(j.status);
      return status === "Archived" || (j.tags && (j.tags.includes("Archivado") || j.tags.includes("Archived")));
    }).length,
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    let byFilter = filterJobs(jobs, filter);
    if (hideRejected) {
      byFilter = byFilter.filter((j) => {
        const status = canonicalStatus(j.status);
        return status !== "Rejected" && status !== "Closed";
      });
    }
    if (hideGhosted) {
      byFilter = byFilter.filter((j) => {
        const status = canonicalStatus(j.status);
        const isArchived = status === "Archived" || (j.tags && (j.tags.includes("Archivado") || j.tags.includes("Archived")));
        return !isArchived;
      });
    }
    return byFilter;
  }, [jobs, filter, hideRejected, hideGhosted]);

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
      <div className="flex items-center justify-between gap-3 mb-2">
        <DashboardHeader />
        <button
          type="button"
          onClick={() => setShowStats((prev) => {
            const next = !prev;
            try { localStorage.setItem("applydash-show-stats", String(next)); } catch {}
            return next;
          })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200 shadow-xs"
        >
          <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
          <span>
            {showStats
              ? (locale === "es" ? "Ocultar estadísticas" : "Hide statistics")
              : (locale === "es" ? "Mostrar estadísticas" : "Show statistics")}
          </span>
          {showStats ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {showStats && (
        <div className="transition-all duration-300 ease-in-out">
          <DashboardStats jobs={jobs} />
          <ActivityChart jobs={jobs} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <QuickFilters
            active={filter}
            onChange={setFilter}
            className="mb-0"
            extra={
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHideRejected((v) => {
                  const next = !v;
                  try { localStorage.setItem("applydash-hide-rejected", String(next)); } catch {}
                  return next;
                })}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    hideRejected
                      ? "bg-red-600 text-white shadow"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {hideRejected
                    ? `${t.dashboard.filters.showRejected}${rejectedCount > 0 ? ` (${rejectedCount})` : ""}`
                    : t.dashboard.filters.hideRejected}
                </button>
                <button
                  type="button"
                  onClick={() => setHideGhosted((v) => {
                  const next = !v;
                  try { localStorage.setItem("applydash-hide-ghosted", String(next)); } catch {}
                  return next;
                })}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    hideGhosted
                      ? "bg-fuchsia-700 text-white shadow"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {hideGhosted
                    ? `${t.dashboard.filters.showGhosted}${ghostedCount > 0 ? ` (${ghostedCount})` : ""}`
                    : t.dashboard.filters.hideGhosted}
                </button>
              </div>
            }
          />
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
          onShowMatching={setMatchingJob}
          onRowDoubleClick={setDetailJob}
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
      <JobDetailPanel
        job={detailJob}
        onClose={() => setDetailJob(null)}
        onSave={(updated) => {
          handleJobsChange(jobs.map((j) => j.id === updated.id ? updated : j));
          setDetailJob(null);
        }}
      />
      <MatchingHistoryPanel
        jobId={matchingJob?.id ?? null}
        company={matchingJob?.company ?? null}
        applicationLink={matchingJob?.applicationLink ?? null}
        onClose={() => setMatchingJob(null)}
      />
    </div>
  );
}
