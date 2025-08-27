import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Zod schema for validating the incoming job data from the extension
const jobSchema = z.object({
  company: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  applicationLink: z.url().nullable().optional(),
  status: z.string().nullable().optional(),
  appliedDate: z.iso.date().nullable().optional(),
  location: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  salary: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Helper function to handle date formatting for Prisma
// function addOneDay(dateStr: string): Date {
//   const d = new Date(dateStr);
//   d.setDate(d.getDate() + 1);
//   return d;
// }

export async function POST(request: Request) {
  // Create a Supabase client that automatically reads the user's session from the request cookies
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is found in the session, return an unauthorized error
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = jobSchema.safeParse(body);

    if (!validation.success) {
      console.error('Zod Validation Error:', validation.error.issues);
      return NextResponse.json({ error: 'Invalid data provided.' }, { status: 400 });
    }

    const { appliedDate, ...jobData } = validation.data;

    // Use your existing Prisma client to create the new job record
    const newJob = await prisma.job.create({
      data: {
        ...jobData,
        appliedDate: appliedDate ? new Date(appliedDate) : null,
        userId: user.id, // Associate the job with the authenticated user
      },
    });

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Database error: Could not save the job.' }, { status: 500 });
  }
}