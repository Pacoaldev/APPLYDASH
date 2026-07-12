import { computeStats, filterJobs, isFollowUpDue } from "./job-utils";
import type { Job } from "@/types/job";

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
