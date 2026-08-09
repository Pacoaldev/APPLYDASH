import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Endpoint disabled in non-development environments.' }, { status: 403 });
  }

  try {
    console.log('🧪 Cleaning test data...');
    
    // Get all users to see what we're working with
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, createdAt: true }
    });
    
    console.log('👥 Found users:', allUsers);
    
    // Delete all jobs (since they're all test data)
    const deletedJobs = await prisma.job.deleteMany({});
    console.log(`🗑️ Deleted ${deletedJobs.count} jobs`);
    
    // Delete users that look like test accounts
    const testEmailPatterns = [
      'test@',
      'demo@',
      'example@',
      'fralopala2@alu.edu.gva.es' // Your test email
    ];
    
    let deletedTestUsers = 0;
    for (const user of allUsers) {
      const isTestUser = testEmailPatterns.some(pattern => 
        user.email?.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (isTestUser) {
        await prisma.user.delete({ where: { id: user.id } });
        deletedTestUsers++;
        console.log(`🗑️ Deleted test user: ${user.email}`);
      }
    }
    
    console.log('✅ Test data cleanup completed');
    
    return NextResponse.json({
      success: true,
      message: 'Test data cleaned successfully',
      deleted: {
        jobs: deletedJobs.count,
        testUsers: deletedTestUsers,
        totalUsers: allUsers.length
      },
      remainingUsers: allUsers.length - deletedTestUsers,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test data cleanup error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}