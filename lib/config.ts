// Environment variables configuration - NO HARDCODED VALUES
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  },
  database: {
    url: process.env.DATABASE_URL || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || ''
  }
}

// Validate required environment variables
export function validateConfig(throwOnMissing = true) {
  const missingVars = []
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!process.env.DATABASE_URL) missingVars.push('DATABASE_URL')
  if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET')
  
  if (missingVars.length > 0) {
    const message = `❌ Missing required environment variables: ${missingVars.join(', ')}`
    console.error(message)
    console.error('Please check your deployment environment variables configuration')
    
    if (throwOnMissing) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
    }
    return false
  }
  
  console.log('✅ All environment variables are configured')
  return true
}