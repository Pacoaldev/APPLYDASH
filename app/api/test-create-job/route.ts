import { NextRequest, NextResponse } from 'next/server';
import { createJob } from '@/app/dashboard/actions';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test endpoint called');
    
    const body = await request.json();
    console.log('📊 Request body:', body);
    
    const result = await createJob(body);
    console.log('📤 createJob result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      createJobResult: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}