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
  
  // Fallback to hardcoded values (temporary fix)
  console.warn('🚨 Using fallback Supabase configuration');
  return {
    supabaseUrl: 'https://yozhtdvvtpoutamfzmsj.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvemh0ZHZ2dHBvdXRhbWZ6bXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDMzODksImV4cCI6MjA3MTcxOTM4OX0.QD0KzqEoLeRfUhPWMHcKCs6r5gvpGnoXm1-rCnZ-IqM',
    siteUrl: 'https://applydash.pacoal.dev',
  };
}