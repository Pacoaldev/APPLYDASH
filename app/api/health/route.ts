import { NextResponse } from 'next/server';
import { validateConfig } from '@/lib/config';

export async function GET() {
  try {
    // Verificar variables de entorno
    const configValid = validateConfig(false);
    
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      configValid,
      variables: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
      },
      // Solo mostrar los primeros caracteres por seguridad
      variablesPeek: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...',
        nodeEnv: process.env.NODE_ENV,
      }
    };

    return NextResponse.json(healthCheck);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}