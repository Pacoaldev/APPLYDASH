import { createBrowserClient } from '@supabase/ssr'
import { config, validateConfig } from '../../lib/config'

export function createClient() {
  if (!validateConfig()) {
    throw new Error('Cannot create Supabase client: Missing environment variables')
  }
  
  return createBrowserClient(config.supabase.url, config.supabase.anonKey)
}