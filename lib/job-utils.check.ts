import { canonicalStatus, computeStats, displayStatus, filterJobs, getStatusStyle, isFollowUpDue, STATUS_COLORS } from "./job-utils";
import type { Job } from "@/types/job";

if (canonicalStatus("En Proceso") !== "In Progress") throw new Error("En Proceso map mismatch");
if (displayStatus("In Progress", "es") !== "En Proceso") throw new Error("In Progress display mismatch");

for (const [key, style] of Object.entries(STATUS_COLORS)) {
  if (!style.shadow.includes("0_3px_0_0")) {
    throw new Error(`STATUS_COLORS[${key}] missing unified 3D shadow`);
  }
}
if (!getStatusStyle("Closed").shadow.includes("0_3px_0_0")) {
  throw new Error("Closed status should keep 3D shadow");
}

// ponytail: minimal self-check — fails if filter/stats logic breaks
const sample: Job[] = [
  {
    id: "1",
    userid: "u",
    company: "A",
    position: "Dev",
    type: "Remote",
    applicationLink: null,
    status: "Applied",
    appliedDate: new Date().toISOString().split("T")[0],
    location: null,
    platform: null,
    salary: null,
    notes: null,
    nextFollowUpDate: "2000-01-01",
    tags: [],
  },
];

const stats = computeStats(sample);
if (stats.total !== 1) throw new Error("computeStats total mismatch");
if (filterJobs(sample, "thisWeek").length !== 1) throw new Error("filterJobs thisWeek mismatch");
if (!isFollowUpDue(sample[0])) throw new Error("isFollowUpDue should be true for past date");
