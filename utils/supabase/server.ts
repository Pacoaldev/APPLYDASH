import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config, validateConfig } from '../../lib/config'

export async function createClient() {
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