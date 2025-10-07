import { createBrowserClient } from '@supabase/ssr'
import { getClientConfigSync } from '../../lib/client-config'

export function createClient() {
  // During build time, environment variables might not be available
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // This is likely during build - return a dummy client to prevent build failures
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  
  // Get client configuration
  const clientConfig = getClientConfigSync();
  
  // Validate that we have the required variables for client-side
  if (!clientConfig.supabaseUrl || !clientConfig.supabaseAnonKey) {
    console.error('Missing Supabase configuration:', {
      hasUrl: !!clientConfig.supabaseUrl,
      hasKey: !!clientConfig.supabaseAnonKey,
      url: clientConfig.supabaseUrl?.substring(0, 30) + '...',
      // Debug info
      envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
    });
    
    // Return a dummy client instead of throwing to prevent app crash
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  
  console.log('✅ Creating Supabase client with:', {
    url: clientConfig.supabaseUrl.substring(0, 30) + '...',
    hasKey: !!clientConfig.supabaseAnonKey
  });
  
  return createBrowserClient(clientConfig.supabaseUrl, clientConfig.supabaseAnonKey)
}