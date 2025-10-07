import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Delete all jobs first (due to foreign key constraints)
    const deletedJobs = await prisma.job.deleteMany({});
    console.log(`🗑️ Deleted ${deletedJobs.count} jobs`);
    
    // Delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`👥 Deleted ${deletedUsers.count} users`);
    
    // Delete all admins (optional, you might want to keep admin accounts)
    const deletedAdmins = await prisma.admin.deleteMany({});
    console.log(`👑 Deleted ${deletedAdmins.count} admins`);
    
    console.log('✅ Database cleanup completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database cleaned successfully',
      deleted: {
        jobs: deletedJobs.count,
        users: deletedUsers.count,
        admins: deletedAdmins.count
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database cleanup error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}