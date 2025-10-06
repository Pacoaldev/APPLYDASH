import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    // Show actual values for debugging (remove in production)
    DEBUG_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    DEBUG_DATABASE_URL: process.env.DATABASE_URL?.substring(0, 30) + '...',
  }
  
  return NextResponse.json(envVars)
}