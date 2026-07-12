import { Job, JobFilter } from "@/types/job";

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Applied: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
  Interview: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
  "Phone Screen": { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
  "Technical Round": { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300" },
  "Final Round": { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300" },
  Offer: { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-300" },
  Accepted: { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
  Rejected: { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300" },
  Pending: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300" },
  Negotiating: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
  Withdrawn: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" },
  "On Hold": { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300" },
  "Follow Up": { bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-700 dark:text-cyan-300" },
};

export const INTERVIEW_STATUSES = [
  "Interview",
  "Phone Screen",
  "Technical Round",
  "Final Round",
  "Negotiating",
];

export const KANBAN_COLUMNS = [
  { key: "Applied", statuses: ["Applied", "Pending", "Follow Up"] },
  { key: "Interview", statuses: INTERVIEW_STATUSES },
  { key: "Offer", statuses: ["Offer", "Accepted", "Negotiating"] },
  { key: "Rejected", statuses: ["Rejected", "Withdrawn", "On Hold"] },
] as const;

export function getStatusStyle(status: string | null) {
  if (!status) return { bg: "bg-muted", text: "text-muted-foreground" };
  return STATUS_COLORS[status] ?? { bg: "bg-muted", text: "text-muted-foreground" };
}

export function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function isThisWeek(dateStr: string | null): boolean {
  const d = parseDate(dateStr);
  if (!d) return false;
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return d >= start;
}

export function daysSince(dateStr: string | null): number | null {
  const d = parseDate(dateStr);
  if (!d) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isFollowUpDue(job: Job): boolean {
  const d = parseDate(job.nextFollowUpDate);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d <= today;
}

export function filterJobs(jobs: Job[], filter: JobFilter): Job[] {
  switch (filter) {
    case "thisWeek":
      return jobs.filter((j) => isThisWeek(j.appliedDate));
    case "interviewing":
      return jobs.filter((j) => j.status && INTERVIEW_STATUSES.includes(j.status));
    case "noResponse14":
      return jobs.filter(
        (j) =>
          (j.status === "Applied" || j.status === "Pending") &&
          (daysSince(j.appliedDate) ?? 0) >= 14
      );
    case "followUpDue":
      return jobs.filter(isFollowUpDue);
    case "offers":
      return jobs.filter((j) =>
        ["Offer", "Accepted", "Negotiating"].includes(j.status ?? "")
      );
    default:
      return jobs;
  }
}

export function computeStats(jobs: Job[]) {
  const total = jobs.length;
  const interviewing = jobs.filter(
    (j) => j.status && INTERVIEW_STATUSES.includes(j.status)
  ).length;
  const offers = jobs.filter((j) =>
    ["Offer", "Accepted", "Negotiating"].includes(j.status ?? "")
  ).length;
  const rejected = jobs.filter((j) => j.status === "Rejected").length;
  const responded = jobs.filter(
    (j) => j.status && !["Applied", "Pending"].includes(j.status)
  ).length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const followUpDue = jobs.filter(isFollowUpDue).length;

  return { total, interviewing, offers, rejected, responseRate, followUpDue };
}

export function parseTagsInput(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function formatTags(tags: string[] | null | undefined): string {
  return (tags ?? []).join(", ");
}
