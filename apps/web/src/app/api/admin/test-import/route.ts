import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing MongoDB import...');
    
    // Test if we can import MongoDB
    const { MongoClient, ServerApiVersion } = await import('mongodb');
    console.log('✅ MongoDB import successful');
    
    // Test if we can import bcryptjs
    const bcrypt = await import('bcryptjs');
    console.log('✅ bcryptjs import successful');
    
    // Check environment
    const hasDbUrl = !!process.env.DATABASE_URL;
    console.log('📊 DATABASE_URL exists:', hasDbUrl);
    
    return NextResponse.json({
      success: true,
      message: 'Import test successful',
      details: {
        mongoClientAvailable: !!MongoClient,
        serverApiVersionAvailable: !!ServerApiVersion,
        bcryptAvailable: !!bcrypt,
        hasDbUrl,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Import test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'IMPORT_FAILED',
        message: error instanceof Error ? error.message : 'Import test failed',
        details: {
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}