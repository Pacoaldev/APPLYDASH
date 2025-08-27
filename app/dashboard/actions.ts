"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";


// type JobInput = {
//   appliedDate?: string | Date | null;
//   [key: string]: unknown;
// };


const jobSchema = z.object({
  company: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  applicationLink: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  appliedDate: z.string().nullable().optional(), 
  location: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  salary: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

function addOneDay(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d; // return as JS Date object for Prisma
}


function formatDateForDisplay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeAppliedDate(data: unknown): Record<string, unknown> {
  if (
    data &&
    typeof data === "object" &&
    "appliedDate" in data &&
    data.appliedDate instanceof Date
  ) {
    const d = data.appliedDate as Date;
    (data as Record<string, unknown>).appliedDate = isNaN(d.getTime())
      ? null
      : d.toISOString().split("T")[0];
  }
  return data as Record<string, unknown>;
}

export async function createJob(data: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to add a job." };
  }

  const validation = jobSchema.safeParse(normalizeAppliedDate(data));
  if (!validation.success) {
    return { error: "Invalid data provided. Please check the fields." };
  }

  const { appliedDate, ...jobData } = validation.data;

  try {
    const newJob = await prisma.job.create({
      data: {
        ...jobData,
        appliedDate: appliedDate ? addOneDay(appliedDate) : null,
  userid: user.id, // Prisma field name, mapped to userid in DB
      },
    });

  revalidatePath("/dashboard");

    return {
      success: true,

      data: {
        ...newJob,
  // appliedDate: newJob.appliedDate ? newJob.appliedDate.toISOString().split('T')[0] : null,
        appliedDate: newJob.appliedDate ? formatDateForDisplay(newJob.appliedDate)
          : null,
      },
    };
  } catch (error) {
    console.error("Failed to create job:", error);
    return { error: "Database error: Could not save the job." };
  }
}

const updateJobSchema = jobSchema.extend({
  id: z.uuid(),
});

export async function updateJob(data: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }


  // if (typeof data === "object" && data !== null && "appliedDate" in data) {
  //   const draft = data as { appliedDate?: unknown };

  //   if (isDate(draft.appliedDate)) {
  //     const d = draft.appliedDate;
  //     if (isNaN(d.getTime())) {
  //       draft.appliedDate = null;
  //     } else {
  //       draft.appliedDate = formatDateForDisplay(d);
  //     }
  //   }
  // }

  const validation = updateJobSchema.safeParse(normalizeAppliedDate(data));
  if (!validation.success) {
    console.error("Zod validation failed:", validation.error.issues);
    return { error: "Invalid data for update." };
  }

  const { id, appliedDate, ...jobData } = validation.data;

  try {
    const updatedJob = await prisma.job.update({
      where: {
        id: id,
      },
      data: {
        ...jobData,
        appliedDate: appliedDate ? appliedDate : null,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        ...updatedJob,
  // appliedDate: updatedJob.appliedDate ? updatedJob.appliedDate.toISOString().split('T')[0] : null,
          appliedDate: updatedJob.appliedDate ? formatDateForDisplay(updatedJob.appliedDate) : null,
      },
    };
  } catch (error) {
    console.error("Failed to update job:", error);
    return { error: "Database error: Could not update the job." };
  }
}


export async function deleteJob(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  try {
    await prisma.job.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete job:", error);
    return { error: "Database error: Could not delete the job." };
  }
}
