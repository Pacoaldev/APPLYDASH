import { createBrowserClient } from '@supabase/ssr'
import { config, validateConfig } from '../../lib/config'

export function createClient() {
  // During build time, environment variables might not be available
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // This is likely during build - return a dummy client to prevent build failures
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  
  if (!validateConfig()) {
    throw new Error('Cannot create Supabase client: Missing environment variables')
  }
  
  return createBrowserClient(config.supabase.url, config.supabase.anonKey)
}