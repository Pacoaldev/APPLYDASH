import { prisma } from './prisma';

export async function getJobsForUser(userId: string) {
  return prisma.job.findMany({
    where: { userid: userId } as any,
    orderBy: { appliedDate: 'desc' },
  });
}
