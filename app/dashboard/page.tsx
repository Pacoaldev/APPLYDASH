import { getJobsForUser } from "@/lib/jobService";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { JobDashboard } from "@/components/job-dashboard";
import { JobGridSkeleton } from "@/components/skeletons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const jobs = await getJobsForUser(user.id);

    return (
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl">
        <div className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ApplyDash
            </span>{" "}
            Dashboard
          </h1>
        </div>
        <Suspense fallback={<JobGridSkeleton />}>
          <JobDashboard data={jobs} />
        </Suspense>
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl">
        <div className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 leading-tight text-red-600">
            Dashboard Error
          </h1>
          <p className="text-muted-foreground mb-4">
            There was an error loading your dashboard. Please try again.
          </p>
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-red-700 dark:text-red-300">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
          <div className="mt-6">
            <a
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </a>
          </div>
        </div>
      </main>
    );
  }
}
