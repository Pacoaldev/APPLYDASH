import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ensureUserExists } from '@/lib/userService';

export async function POST() {
  try {
    console.log('🔄 Syncing current user...');
    
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: 'User not authenticated'
      }, { status: 401 });
    }
    
    console.log('👤 Current user:', user.id, user.email);
    
    const syncedUser = await ensureUserExists(
      user.id, 
      user.email, 
      user.user_metadata?.display_name
    );
    
    return NextResponse.json({
      success: true,
      message: 'User synchronized successfully',
      user: syncedUser,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ User sync error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}