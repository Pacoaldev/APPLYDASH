
import JobGrid from "@/components/jobGrid";
import { JobGridSkeleton } from "@/components/skeletons";
import { getJobsForUser } from "@/lib/jobService";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// const prisma = new PrismaClient();


// async function getJobsForUser(): Promise<Job[]> {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/login");
//   }

//   const jobs = await prisma.job.findMany({
//     where: {
//       userId: user.id, 
//     },
//     orderBy: {
//       appliedDate: 'desc', 
//     },
//   });

//   return jobs.map(job => ({
//     ...job,
//     appliedDate: job.appliedDate ? job.appliedDate.toISOString().split('T')[0] : null,
//   }));
// }

// export default async function DashboardPage() {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) redirect('/login');


//   const jobs = await getJobsForUser(user.id);

//   const formattedJobs = jobs.map((job) => ({
//     ...job,
//     appliedDate: job.appliedDate?.toISOString().split('T')[0] ?? null,
//   }));

//   return (
//     <main className="p-6 mx-auto">
//       <h1 className="text-2xl font-bold mb-4 pb-15">Job Tracker</h1>
//       <Suspense fallback={<JobGridSkeleton />}>
//         <JobGrid data={formattedJobs} />
//       </Suspense>
//     </main>
//   );
// }

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('Supabase user:', user);

  if (!user) redirect('/login');

  const jobs = await getJobsForUser(user.id);
  console.log('Jobs from DB:', jobs);

  const formattedJobs = jobs.map((job) => ({
    ...job,
    appliedDate: job.appliedDate
      ? typeof job.appliedDate === 'string'
        ? job.appliedDate
        : job.appliedDate instanceof Date
          ? job.appliedDate.toISOString().split('T')[0]
          : String(job.appliedDate)
      : null,
  }));

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl">
      <div className="text-center my-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 leading-tight">
          Application Dashboard{' '}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Tracker</span>
        </h1>
      </div>
      <Suspense fallback={<JobGridSkeleton />} >
        <JobGrid data={formattedJobs} />
      </Suspense>
    </main>
  );
}