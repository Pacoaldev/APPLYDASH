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

  // Try to get from environment variables first
  const envConfig = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  };

  // If we have all variables from env, use them
  if (envConfig.supabaseUrl && envConfig.supabaseAnonKey) {
    cachedConfig = envConfig;
    return cachedConfig;
  }

  // Fallback: try to load from runtime config file
  try {
    const response = await fetch('/runtime-config.json');
    if (response.ok) {
      const runtimeConfig = await response.json();
      cachedConfig = {
        supabaseUrl: runtimeConfig.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseAnonKey: runtimeConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        siteUrl: runtimeConfig.NEXT_PUBLIC_SITE_URL || '',
      };
      return cachedConfig;
    }
  } catch (error) {
    console.warn('Could not load runtime config:', error);
  }

  // Last resort: return env config even if incomplete
  cachedConfig = envConfig;
  return cachedConfig;
}

export function getClientConfigSync(): ClientConfig {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  };
}