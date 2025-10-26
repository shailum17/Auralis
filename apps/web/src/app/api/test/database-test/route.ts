import { NextRequest, NextResponse } from 'next/server';
import { databaseServer } from '@/lib/database-server';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    const connected = await databaseServer.connect();
    
    if (connected) {
      console.log('✅ Database connection successful');
      await databaseServer.disconnect();
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ Database connection failed');
      
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: `Database test failed: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 Testing database with user creation...');
    
    const connected = await databaseServer.connect();
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 });
    }

    // Test user creation (without actually saving)
    const testUser = {
      email: body.email || 'test@example.com',
      username: body.username || 'testuser',
      fullName: body.fullName || 'Test User',
      passwordHash: 'test-hash',
      emailVerified: false,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date()
    };

    console.log('📝 Test user data prepared:', {
      email: testUser.email,
      username: testUser.username,
      fullName: testUser.fullName
    });

    await databaseServer.disconnect();

    return NextResponse.json({
      success: true,
      message: 'Database test with user data successful',
      testData: {
        email: testUser.email,
        username: testUser.username,
        fullName: testUser.fullName
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database user test error:', error);
    
    return NextResponse.json({
      success: false,
      error: `Database user test failed: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}