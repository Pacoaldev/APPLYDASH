import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import JobGrid from '@/components/jobGrid';
import { getJobsForUser } from '@/lib/jobService';

// Force dynamic rendering for this component
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function JobTable() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const jobs = await getJobsForUser(user.id);

  const formattedJobs = jobs.map((job) => ({
    ...job,
    appliedDate: job.appliedDate?.toISOString().split('T')[0] ?? null,
  }));

  return <JobGrid data={formattedJobs} />;
}