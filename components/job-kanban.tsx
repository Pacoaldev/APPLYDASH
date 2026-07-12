"use client";

import { useState } from "react";
import { Job } from "@/types/job";
import { KANBAN_COLUMNS, getStatusStyle, isFollowUpDue } from "@/lib/job-utils";
import { updateJob } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { ExternalLink, History, Bell } from "lucide-react";

type Props = {
  jobs: Job[];
  onHistory: (job: Job) => void;
  onJobsChange: (jobs: Job[]) => void;
};

export function JobKanban({ jobs, onHistory, onJobsChange }: Props) {
  const { t } = useLocale();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const columnLabels: Record<string, string> = {
    Applied: t.dashboard.kanbanColumns.applied,
    Interview: t.dashboard.kanbanColumns.interview,
    Offer: t.dashboard.kanbanColumns.offer,
    Rejected: t.dashboard.kanbanColumns.rejected,
  };

  const getColumnJobs = (statuses: readonly string[]) =>
    jobs.filter((j) => j.status && statuses.includes(j.status));

  const handleDrop = async (targetStatus: string) => {
    if (!draggingId) return;
    const job = jobs.find((j) => j.id === draggingId);
    if (!job || job.status === targetStatus) {
      setDraggingId(null);
      return;
    }

    const updated = { ...job, status: targetStatus };
    const result = await updateJob(updated);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success && result.data) {
      toast.success(t.dashboard.statusUpdated);
      onJobsChange(jobs.map((j) => (j.id === job.id ? { ...j, ...result.data, status: targetStatus } : j)));
    }
    setDraggingId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[400px]">
      {KANBAN_COLUMNS.map((col) => (
        <div
          key={col.key}
          className="rounded-xl border border-border bg-muted/30 p-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            const defaultStatus = col.statuses[0];
            handleDrop(defaultStatus);
          }}
        >
          <h3 className="font-semibold text-sm text-foreground mb-3 px-1">{columnLabels[col.key] ?? col.key}</h3>
          <div className="space-y-2 min-h-[200px]">
            {getColumnJobs(col.statuses).map((job) => {
              const style = getStatusStyle(job.status);
              return (
                <div
                  key={job.id}
                  draggable
                  onDragStart={() => setDraggingId(job.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className="rounded-lg border border-border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{job.company || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{job.position}</p>
                    </div>
                    {isFollowUpDue(job) && (
                      <span title={t.dashboard.followUpDue}>
                        <Bell className="h-4 w-4 text-cyan-500 shrink-0" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${style.bg} ${style.text}`}>
                      {job.status}
                    </span>
                    {job.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      defaultValue={job.status ?? ""}
                      onBlur={async (e) => {
                        const newStatus = e.target.value.trim();
                        if (!newStatus || newStatus === (job.status ?? "")) return;
                        const result = await updateJob({ ...job, status: newStatus });
                        if (result.success && result.data) {
                          onJobsChange(jobs.map((j) => (j.id === job.id ? { ...j, ...result.data } : j)));
                          toast.success(t.dashboard.statusUpdated);
                        }
                      }}
                      className="text-xs border border-border rounded px-1.5 py-0.5 bg-background min-w-[80px] flex-1"
                      placeholder={t.dashboard.columns.status}
                    />
                    {job.applicationLink && (
                      <a
                        href={job.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onHistory(job)}
                      className="text-muted-foreground hover:text-foreground ml-auto"
                      title={t.dashboard.history}
                    >
                      <History className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
