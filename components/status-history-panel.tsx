"use client";

import { useEffect, useState } from "react";
import { fetchStatusHistory } from "@/app/dashboard/actions";
import { JobStatusHistoryEntry } from "@/types/job";
import { useLocale } from "@/components/locale-provider";
import { Loader2, X } from "lucide-react";
import { getStatusStyle, displayStatus } from "@/lib/job-utils";

type Props = {
  jobId: string | null;
  company: string | null;
  onClose: () => void;
};

export function StatusHistoryPanel({ jobId, company, onClose }: Props) {
  const { t, locale } = useLocale();
  const [history, setHistory] = useState<JobStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    fetchStatusHistory(jobId).then((result) => {
      if (result.success && result.data) setHistory(result.data);
      setLoading(false);
    });
  }, [jobId]);

  if (!jobId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="font-semibold text-foreground">{t.dashboard.historyTitle}</h3>
            <p className="text-sm text-muted-foreground">{company}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.dashboard.noHistory}</p>
          ) : (
            <ul className="space-y-3">
              {history.map((entry) => {
                const style = getStatusStyle(entry.newStatus);
                return (
                  <li key={entry.id} className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {new Date(entry.changedAt).toLocaleDateString()}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                      {displayStatus(entry.newStatus, locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
