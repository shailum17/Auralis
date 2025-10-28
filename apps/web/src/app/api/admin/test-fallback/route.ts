import { NextRequest, NextResponse } from 'next/server';
import { testMongoConnection } from '@/lib/mongodb-fallback';

export async function GET(request: NextRequest) {
  try {
    const result = await testMongoConnection();
    
    return NextResponse.json({
      success: result.success,
      message: result.message || result.error,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fallback test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'FALLBACK_TEST_FAILED',
        message: error instanceof Error ? error.message : 'Fallback test failed'
      },
      { status: 500 }
    );
  }
}