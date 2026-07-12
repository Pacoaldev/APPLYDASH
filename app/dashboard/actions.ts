"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureUserExists } from "@/lib/userService";
import { getJobStatusHistory } from "@/lib/jobService";
import { jobSchema, updateJobSchema } from "@/validation/jobSchema";

function parseTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

function parseDateField(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateForDisplay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatJob(job: {
  id: string;
  userid: string;
  company: string | null;
  position: string | null;
  type: string | null;
  applicationLink: string | null;
  status: string | null;
  appliedDate: Date | null;
  location: string | null;
  platform: string | null;
  salary: string | null;
  notes: string | null;
  nextFollowUpDate: Date | null;
  tags: string[];
}) {
  return {
    ...job,
    appliedDate: job.appliedDate ? formatDateForDisplay(job.appliedDate) : null,
    nextFollowUpDate: job.nextFollowUpDate
      ? formatDateForDisplay(job.nextFollowUpDate)
      : null,
    tags: job.tags ?? [],
  };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function createJob(data: unknown) {
  const user = await requireUser();
  if (!user) return { error: "You must be logged in to add a job." };

  const validation = jobSchema.safeParse(data);
  if (!validation.success) {
    return { error: "Invalid data provided. Please check the fields." };
  }

  const { appliedDate, nextFollowUpDate, tags, ...jobData } = validation.data;

  try {
    await ensureUserExists(user.id, user.email, user.user_metadata?.display_name);

    const newJob = await prisma.job.create({
      data: {
        ...jobData,
        appliedDate: parseDateField(appliedDate),
        nextFollowUpDate: parseDateField(nextFollowUpDate),
        tags: parseTags(tags),
        userid: user.id,
      },
    });

    if (newJob.status) {
      await prisma.jobStatusHistory.create({
        data: {
          jobId: newJob.id,
          oldStatus: null,
          newStatus: newJob.status,
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, data: formatJob(newJob) };
  } catch (error) {
    console.error("Failed to create job:", error);
    return {
      error: `Database error: Could not save the job. ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function updateJob(data: unknown) {
  const user = await requireUser();
  if (!user) return { error: "Authentication required." };

  const validation = updateJobSchema.safeParse(data);
  if (!validation.success) {
    return { error: "Invalid data for update." };
  }

  const { id, appliedDate, nextFollowUpDate, tags, ...jobData } = validation.data;

  try {
    const existing = await prisma.job.findFirst({
      where: { id, userid: user.id },
    });
    if (!existing) return { error: "Job not found." };

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        ...jobData,
        appliedDate: parseDateField(appliedDate),
        nextFollowUpDate: parseDateField(nextFollowUpDate),
        tags: tags !== undefined ? parseTags(tags) : undefined,
      },
    });

    if (existing.status !== updatedJob.status) {
      await prisma.jobStatusHistory.create({
        data: {
          jobId: id,
          oldStatus: existing.status,
          newStatus: updatedJob.status,
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, data: formatJob(updatedJob) };
  } catch (error) {
    console.error("Failed to update job:", error);
    return { error: "Database error: Could not update the job." };
  }
}

export async function deleteJob(id: string) {
  const user = await requireUser();
  if (!user) return { error: "Authentication required." };

  try {
    const existing = await prisma.job.findFirst({
      where: { id, userid: user.id },
    });
    if (!existing) return { error: "Job not found." };

    await prisma.job.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete job:", error);
    return { error: "Database error: Could not delete the job." };
  }
}

export async function fetchStatusHistory(jobId: string) {
  const user = await requireUser();
  if (!user) return { error: "Authentication required." };
  const history = await getJobStatusHistory(jobId, user.id);
  return { success: true, data: history };
}

const importRowSchema = jobSchema;

export async function importJobs(rows: unknown[]) {
  const user = await requireUser();
  if (!user) return { error: "Authentication required." };

  await ensureUserExists(user.id, user.email, user.user_metadata?.display_name);

  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const validation = importRowSchema.safeParse(rows[i]);
    if (!validation.success) {
      errors.push(`Row ${i + 1}: invalid data`);
      continue;
    }

    const { appliedDate, nextFollowUpDate, tags, ...jobData } = validation.data;
    try {
      const job = await prisma.job.create({
        data: {
          ...jobData,
          appliedDate: parseDateField(appliedDate),
          nextFollowUpDate: parseDateField(nextFollowUpDate),
          tags: parseTags(tags),
          userid: user.id,
        },
      });
      if (job.status) {
        await prisma.jobStatusHistory.create({
          data: { jobId: job.id, oldStatus: null, newStatus: job.status },
        });
      }
      imported++;
    } catch {
      errors.push(`Row ${i + 1}: database error`);
    }
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    imported,
    errors: errors.length ? errors : undefined,
  };
}
