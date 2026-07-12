import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Check if we can connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Execute raw SQL to create tables if they don't exist
    const migrations = [
      // Create enum if it doesn't exist
      `DO $$ BEGIN
        CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'MODERATOR');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
      
      // Create users table
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID NOT NULL,
        "email" TEXT,
        "display_name" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );`,
      
      // Create jobs table
      `CREATE TABLE IF NOT EXISTS "jobs" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "userid" UUID NOT NULL,
        "company" TEXT,
        "position" TEXT,
        "type" TEXT DEFAULT 'Remote',
        "applicationlink" TEXT,
        "status" TEXT DEFAULT 'Applied',
        "applieddate" DATE DEFAULT CURRENT_TIMESTAMP,
        "location" TEXT DEFAULT 'undisclosed',
        "platform" TEXT,
        "salary" TEXT DEFAULT '0',
        "notes" TEXT DEFAULT ' ',
        CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
      );`,
      
      // Create Admin table
      `CREATE TABLE IF NOT EXISTS "Admin" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "role" "AdminRole" NOT NULL DEFAULT 'MODERATOR',
        CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
      );`,
      
      // Create unique index on Admin email
      `CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");`,
      
      // Add foreign key constraint
      `DO $$ BEGIN
        ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userid_fkey" 
        FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,

      // v2: follow-up, tags
      `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "nextfollowupdate" DATE;`,
      `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];`,

      // Status history table
      `CREATE TABLE IF NOT EXISTS "job_status_history" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "jobid" UUID NOT NULL,
        "oldstatus" TEXT,
        "newstatus" TEXT,
        "changedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "job_status_history_pkey" PRIMARY KEY ("id")
      );`,

      `DO $$ BEGIN
        ALTER TABLE "job_status_history" ADD CONSTRAINT "job_status_history_jobid_fkey"
        FOREIGN KEY ("jobid") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`
    ];
    
    for (const migration of migrations) {
      try {
        await prisma.$executeRawUnsafe(migration);
        console.log('✅ Migration executed successfully');
      } catch (error) {
        console.log('⚠️ Migration already exists or error:', error);
      }
    }
    
    // Verify tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'jobs', 'Admin', 'job_status_history')
    `;
    
    console.log('📊 Tables found:', tables);
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      tables,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}