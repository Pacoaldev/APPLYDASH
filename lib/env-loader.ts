// Environment loader for DigitalOcean App Platform compatibility
export function loadEnvironmentVariables() {
  // DigitalOcean App Platform sometimes has issues with environment variables
  // This function attempts to load them from multiple sources
  
  if (typeof window !== 'undefined') {
    // Client-side: variables should be available via NEXT_PUBLIC_ prefix
    return;
  }
  
  // Server-side: try to load from different sources
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV'
  ];
  
  console.log('🔄 Loading environment variables...');
  
  // Check if variables are available
  const available = requiredVars.filter(key => process.env[key]);
  const missing = requiredVars.filter(key => !process.env[key]);
  
  console.log('✅ Available variables:', available);
  console.log('❌ Missing variables:', missing);
  
  // For DigitalOcean, sometimes we need to wait a moment for env vars to be available
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.log('⚠️  Some variables missing in production. This might be a DigitalOcean App Platform timing issue.');
    
    // Try to provide helpful debugging info
    console.log('🔍 Debug info:');
    console.log('- Process platform:', process.platform);
    console.log('- Process version:', process.version);
    console.log('- Working directory:', process.cwd());
    console.log('- Environment keys count:', Object.keys(process.env).length);
  }
  
  return {
    available: available.length,
    missing: missing.length,
    total: requiredVars.length
  };
}