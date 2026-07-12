import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/userService";
import { jobSchema } from "@/validation/jobSchema";

function parseTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = jobSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data provided." }, { status: 400 });
    }

    const { appliedDate, tags, ...jobData } = validation.data;

    await ensureUserExists(user.id, user.email, user.user_metadata?.display_name);

    const parsedAppliedDate = appliedDate ? new Date(appliedDate) : null;

    // Auto-calculate nextFollowUpDate as appliedDate + 7 days
    const nextFollowUpDate = parsedAppliedDate
      ? new Date(new Date(parsedAppliedDate).setDate(parsedAppliedDate.getDate() + 7))
      : null;

    const newJob = await prisma.job.create({
      data: {
        ...jobData,
        appliedDate: parsedAppliedDate,
        nextFollowUpDate,
        tags: parseTags(tags),
        userid: user.id,
      },
    });

    if (newJob.status) {
      await prisma.jobStatusHistory.create({
        data: { jobId: newJob.id, oldStatus: null, newStatus: newJob.status },
      });
    }

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Database error: Could not save the job." },
      { status: 500 }
    );
  }
}
