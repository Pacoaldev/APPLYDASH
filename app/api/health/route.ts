import { NextResponse } from 'next/server';
import { validateConfig } from '@/lib/config';
import { loadEnvironmentVariables } from '@/lib/env-loader';

export async function GET() {
  try {
    // Load and check environment variables
    const envStatus = loadEnvironmentVariables();
    const configValid = validateConfig(false);
    
    // Get all environment variable keys for debugging
    const allEnvKeys = Object.keys(process.env);
    const relevantEnvKeys = allEnvKeys.filter(key => 
      key.includes('SUPABASE') || 
      key.includes('DATABASE') || 
      key.includes('JWT') || 
      key.includes('NODE_ENV') ||
      key.includes('SITE_URL')
    );
    
    const healthCheck = {
      status: configValid ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      platform: process.platform,
      nodeVersion: process.version,
      configValid,
      envStatus,
      variables: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      },
      debug: {
        totalEnvVars: allEnvKeys.length,
        relevantEnvKeys,
        workingDirectory: process.cwd(),
        // Solo mostrar los primeros caracteres por seguridad
        variablesPeek: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT_SET',
          databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...' || 'NOT_SET',
          nodeEnv: process.env.NODE_ENV || 'NOT_SET',
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.substring(0, 30) + '...' || 'NOT_SET',
        }
      }
    };

    const statusCode = configValid ? 200 : 503;
    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        debug: {
          errorStack: error instanceof Error ? error.stack : 'No stack trace',
          totalEnvVars: Object.keys(process.env).length
        }
      },
      { status: 500 }
    );
  }
}