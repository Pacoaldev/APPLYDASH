// Environment variables configuration with runtime detection
function getEnvVar(key: string, fallback: string = ''): string {
  // Try multiple sources for environment variables
  const sources = [
    process.env[key],
    typeof window !== 'undefined' ? (window as any).__ENV__?.[key] : undefined,
    // For DigitalOcean App Platform, sometimes vars are available differently
    typeof global !== 'undefined' ? (global as any).__ENV__?.[key] : undefined
  ];
  
  return sources.find(val => val !== undefined && val !== null && val !== '') || fallback;
}

export const config = {
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  },
  database: {
    url: getEnvVar('DATABASE_URL')
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET')
  },
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  siteUrl: getEnvVar('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
}

// Enhanced validation with detailed logging
export function validateConfig(throwOnMissing = true) {
  console.log('🔍 Validating environment configuration...')
  
  // Log all available environment variables (first 10 chars only for security)
  console.log('Available env vars:', Object.keys(process.env).filter(key => 
    key.includes('SUPABASE') || key.includes('DATABASE') || key.includes('JWT') || key.includes('NODE_ENV')
  ).map(key => `${key}=${process.env[key]?.substring(0, 10)}...`))
  
  const requiredVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: config.supabase.url },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: config.supabase.anonKey },
    { key: 'DATABASE_URL', value: config.database.url },
    { key: 'JWT_SECRET', value: config.jwt.secret }
  ]
  
  const missingVars = requiredVars.filter(({ value }) => !value)
  
  if (missingVars.length > 0) {
    const message = `❌ Missing required environment variables: ${missingVars.map(v => v.key).join(', ')}`
    console.error(message)
    console.error('🔧 Debugging info:')
    console.error('- NODE_ENV:', process.env.NODE_ENV)
    console.error('- Platform:', process.platform)
    console.error('- Available env keys:', Object.keys(process.env).length)
    
    if (throwOnMissing) {
      throw new Error(`Missing environment variables: ${missingVars.map(v => v.key).join(', ')}`)
    }
    return false
  }
  
  console.log('✅ All environment variables are configured')
  return true
}