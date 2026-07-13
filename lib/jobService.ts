import { Job, JobStatusHistoryEntry } from "@/types/job";

function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapHistory(
  entries: { id: string; jobId: string; oldStatus: string | null; newStatus: string | null; changedAt: Date }[]
): JobStatusHistoryEntry[] {
  return entries.map((e) => ({
    id: e.id,
    jobId: e.jobId,
    oldStatus: e.oldStatus,
    newStatus: e.newStatus,
    changedAt: e.changedAt.toISOString(),
  }));
}

export async function getJobsForUser(userId: string): Promise<Job[]> {
  const { prisma } = await import("@/lib/prisma");

  try {
    const jobs = await prisma.job.findMany({
      where: { userid: userId },
      orderBy: { createdAt: "asc" },
      include: {
        statusHistory: { orderBy: { changedAt: "desc" }, take: 20 },
      },
    });

    return jobs.map((job) => ({
      id: job.id,
      userid: job.userid,
      company: job.company,
      position: job.position,
      type: job.type,
      applicationLink: job.applicationLink,
      status: job.status,
      appliedDate: formatDate(job.appliedDate),
      location: job.location,
      platform: job.platform,
      salary: job.salary,
      notes: job.notes,
      nextFollowUpDate: formatDate(job.nextFollowUpDate),
      tags: job.tags ?? [],
      statusHistory: mapHistory(job.statusHistory),
    }));
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return [];
  }
}

export async function getJobStatusHistory(jobId: string, userId: string) {
  const { prisma } = await import("@/lib/prisma");

  const job = await prisma.job.findFirst({
    where: { id: jobId, userid: userId },
  });
  if (!job) return [];

  const history = await prisma.jobStatusHistory.findMany({
    where: { jobId },
    orderBy: { changedAt: "desc" },
  });

  return mapHistory(history);
}
