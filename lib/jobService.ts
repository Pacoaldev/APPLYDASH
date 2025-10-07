import { prisma } from './prisma';

export async function getJobsForUser(userId: string) {
  try {
    console.log('🔍 Attempting to fetch jobs for user:', userId);
    
    // Test database connection first
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    const jobs = await prisma.job.findMany({
      where: { userid: userId } as any,
      orderBy: { appliedDate: 'desc' },
    });
    
    console.log('✅ Jobs fetched successfully:', jobs.length, 'jobs found');
    return jobs;
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    
    // Return empty array instead of throwing to prevent app crash
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
