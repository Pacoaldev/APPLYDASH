import { Job, JobFilter } from "@/types/job";
import type { Locale } from "@/lib/i18n/translations";

export const STATUS_ES_TO_EN: Record<string, string> = {
  Aplicado: "Applied",
  Entrevista: "Interview",
  Rechazado: "Rejected",
  Pendiente: "Pending",
  Oferta: "Offer",
  Negociando: "Negotiating",
  Aceptado: "Accepted",
  Retirado: "Withdrawn",
  "En espera": "On Hold",
  Seguimiento: "Follow Up",
  "Llamada telefónica": "Phone Screen",
  "Prueba técnica": "Technical Round",
  "Entrevista final": "Final Round",
};

const STATUS_EN_TO_ES: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_ES_TO_EN).map(([es, en]) => [en, es])
);

export function canonicalStatus(status: string | null | undefined): string {
  if (!status) return "";
  return STATUS_ES_TO_EN[status] ?? status;
}

export function displayStatus(
  status: string | null | undefined,
  locale: Locale = "en"
): string {
  if (!status) return "—";
  const en = canonicalStatus(status);
  if (locale === "es") return STATUS_EN_TO_ES[en] ?? status;
  return en;
}

function hasStatus(status: string | null | undefined, candidates: readonly string[]): boolean {
  const key = canonicalStatus(status);
  return Boolean(key && candidates.includes(key));
}

export const STATUS_COLORS: Record<string, { bg: string; text: string; shadow: string }> = {
  // Entry point — soft blue
  Applied:         { bg: "bg-blue-100 dark:bg-blue-900/50",       text: "text-blue-700 dark:text-blue-200",       shadow: "shadow-[0_2px_0_0_#93c5fd] dark:shadow-[0_2px_0_0_#1d4ed8]" },
  Pending:         { bg: "bg-slate-100 dark:bg-slate-700/60",      text: "text-slate-600 dark:text-slate-200",     shadow: "shadow-[0_2px_0_0_#94a3b8] dark:shadow-[0_2px_0_0_#475569]" },
  "Follow Up":     { bg: "bg-cyan-100 dark:bg-cyan-900/50",        text: "text-cyan-700 dark:text-cyan-200",       shadow: "shadow-[0_2px_0_0_#67e8f9] dark:shadow-[0_2px_0_0_#0e7490]" },
  // Moving forward — amber → orange progression
  "Phone Screen":  { bg: "bg-amber-100 dark:bg-amber-900/50",      text: "text-amber-700 dark:text-amber-200",     shadow: "shadow-[0_2px_0_0_#fcd34d] dark:shadow-[0_2px_0_0_#b45309]" },
  Interview:       { bg: "bg-amber-200 dark:bg-amber-800/60",      text: "text-amber-800 dark:text-amber-100",     shadow: "shadow-[0_2px_0_0_#f59e0b] dark:shadow-[0_2px_0_0_#92400e]" },
  "Technical Round":{ bg: "bg-orange-200 dark:bg-orange-800/60",   text: "text-orange-800 dark:text-orange-100",   shadow: "shadow-[0_2px_0_0_#fb923c] dark:shadow-[0_2px_0_0_#9a3412]" },
  "Final Round":   { bg: "bg-orange-300 dark:bg-orange-700/70",    text: "text-orange-900 dark:text-orange-50",    shadow: "shadow-[0_2px_0_0_#ea580c] dark:shadow-[0_2px_0_0_#7c2d12]" },
  Negotiating:     { bg: "bg-purple-200 dark:bg-purple-800/60",    text: "text-purple-800 dark:text-purple-100",   shadow: "shadow-[0_2px_0_0_#c084fc] dark:shadow-[0_2px_0_0_#6b21a8]" },
  // Positive outcomes — light green → bright green
  Offer:           { bg: "bg-green-200 dark:bg-green-800/60",      text: "text-green-800 dark:text-green-100",     shadow: "shadow-[0_2px_0_0_#4ade80] dark:shadow-[0_2px_0_0_#166534]" },
  Accepted:        { bg: "bg-emerald-400 dark:bg-emerald-500",     text: "text-white",                             shadow: "shadow-[0_3px_0_0_#059669] dark:shadow-[0_3px_0_0_#064e3b]" },
  // Negative outcomes — red
  Rejected:        { bg: "bg-red-500 dark:bg-red-600",             text: "text-white",                             shadow: "shadow-[0_3px_0_0_#b91c1c] dark:shadow-[0_3px_0_0_#7f1d1d]" },
  Withdrawn:       { bg: "bg-gray-200 dark:bg-gray-700",           text: "text-gray-600 dark:text-gray-300",       shadow: "shadow-[0_2px_0_0_#9ca3af] dark:shadow-[0_2px_0_0_#374151]" },
  "On Hold":       { bg: "bg-slate-200 dark:bg-slate-700",         text: "text-slate-600 dark:text-slate-300",     shadow: "shadow-[0_2px_0_0_#94a3b8] dark:shadow-[0_2px_0_0_#334155]" },
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
  if (!status) return { bg: "bg-muted", text: "text-muted-foreground", shadow: "" };
  return STATUS_COLORS[canonicalStatus(status)] ?? { bg: "bg-muted", text: "text-muted-foreground", shadow: "" };
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
      return jobs.filter((j) => hasStatus(j.status, INTERVIEW_STATUSES));
    case "noResponse14":
      return jobs.filter(
        (j) =>
          hasStatus(j.status, ["Applied", "Pending"]) &&
          (daysSince(j.appliedDate) ?? 0) >= 14
      );
    case "followUpDue":
      return jobs.filter(isFollowUpDue);
    case "offers":
      return jobs.filter((j) => hasStatus(j.status, ["Offer", "Accepted", "Negotiating"]));
    default:
      return jobs;
  }
}

export function computeStats(jobs: Job[]) {
  const total = jobs.length;
  const interviewing = jobs.filter((j) => hasStatus(j.status, INTERVIEW_STATUSES)).length;
  const offers = jobs.filter((j) => hasStatus(j.status, ["Offer", "Accepted", "Negotiating"])).length;
  const rejected = jobs.filter((j) => canonicalStatus(j.status) === "Rejected").length;
  const responded = jobs.filter(
    (j) => j.status && !hasStatus(j.status, ["Applied", "Pending"])
  ).length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const followUpDue = jobs.filter(isFollowUpDue).length;

  return { total, interviewing, offers, rejected, responseRate, followUpDue };
}

export function formatDateDDMMYY(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d =
    value instanceof Date
      ? value
      : new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (isNaN(d.getTime())) return String(value);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
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
