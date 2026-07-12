export interface JobStatusHistoryEntry {
  id: string;
  jobId: string;
  oldStatus: string | null;
  newStatus: string | null;
  changedAt: string;
}

export interface Job {
  id: string;
  userid: string;
  company: string | null;
  position: string | null;
  type: string | null;
  applicationLink: string | null;
  status: string | null;
  appliedDate: string | null;
  location: string | null;
  platform: string | null;
  salary: string | null;
  notes: string | null;
  nextFollowUpDate: string | null;
  tags: string[];
  statusHistory?: JobStatusHistoryEntry[];
}

export type JobFilter =
  | "all"
  | "thisWeek"
  | "interviewing"
  | "noResponse14"
  | "followUpDue"
  | "offers";

export type DashboardView = "table" | "kanban";
