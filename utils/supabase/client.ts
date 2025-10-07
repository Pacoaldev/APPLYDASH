import { createBrowserClient } from '@supabase/ssr'
import { config } from '../../lib/config'

export function createClient() {
  // During build time, environment variables might not be available
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // This is likely during build - return a dummy client to prevent build failures
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  
  // For client-side, get the variables directly from the environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || config.supabase.url;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || config.supabase.anonKey;
  
  // Validate that we have the required variables for client-side
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl?.substring(0, 30) + '...',
    });
    
    // Return a dummy client instead of throwing to prevent app crash
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}