import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Simple test without MongoDB...');
    
    // Test environment variable
    const uri = process.env.DATABASE_URL;
    console.log('📊 DATABASE_URL exists:', !!uri);
    
    // Test basic operations
    const timestamp = new Date().toISOString();
    console.log('⏰ Timestamp:', timestamp);
    
    return NextResponse.json({
      success: true,
      message: 'Simple test successful',
      details: {
        hasDbUrl: !!uri,
        dbUrlPreview: uri ? uri.substring(0, 30) + '...' : 'Not set',
        timestamp,
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('❌ Simple test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'SIMPLE_TEST_FAILED',
      message: error instanceof Error ? error.message : 'Simple test failed'
    }, { status: 500 });
  }
}