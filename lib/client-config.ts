// Client-side configuration loader
'use client';

interface ClientConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
}

let cachedConfig: ClientConfig | null = null;

export async function getClientConfig(): Promise<ClientConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  // Use the sync version which has the fallback logic
  cachedConfig = getClientConfigSync();
  return cachedConfig;
}

export function getClientConfigSync(): ClientConfig {
  // Try to get from window.__ENV__ first (injected during build)
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    const env = (window as any).__ENV__;
    if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        siteUrl: env.NEXT_PUBLIC_SITE_URL || '',
      };
    }
  }
  
  // Try process.env
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
    };
  }
  
  // Fallback (forces variables check)
  return {
    supabaseUrl: '',
    supabaseAnonKey: '',
    siteUrl: 'https://applydash.pacoal.dev',
  };
}