import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config, validateConfig } from '../../lib/config'

export async function createClient() {
  // During build time, environment variables might not be available
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // This is likely during build - return a dummy client to prevent build failures
    const cookieStore = await cookies()
    return createServerClient('https://placeholder.supabase.co', 'placeholder-key', {
      cookies: {
        getAll() { return [] },
        setAll() { }
      }
    })
  }
  
  if (!validateConfig()) {
    throw new Error('Cannot create Supabase server client: Missing environment variables')
  }
  
  const cookieStore = await cookies()

  return createServerClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}