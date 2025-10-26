import { NextRequest, NextResponse } from 'next/server';
import { databaseServer } from '@/lib/database-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, testData } = body;
    
    console.log('🧪 Testing profile update for email:', email);
    console.log('📝 Test data:', testData);
    
    // Test database connection
    const connected = await databaseServer.connect();
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: 'Could not establish connection to MongoDB'
      });
    }
    
    console.log('✅ Database connected successfully');
    
    // Try to find the user first
    const existingUser = await databaseServer.getUserByEmail(email);
    
    if (!existingUser) {
      await databaseServer.disconnect();
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: `No user found with email: ${email}`
      });
    }
    
    console.log('👤 Found user:', {
      id: existingUser._id,
      email: existingUser.email,
      username: existingUser.username
    });
    
    // Try to update the user
    const updateResult = await databaseServer.updateUser(email, testData);
    await databaseServer.disconnect();
    
    if (updateResult) {
      return NextResponse.json({
        success: true,
        message: 'Profile update test successful',
        data: {
          originalUser: {
            id: existingUser._id,
            email: existingUser.email,
            fullName: existingUser.fullName,
            bio: existingUser.bio
          },
          updatedUser: {
            id: updateResult._id,
            email: updateResult.email,
            fullName: updateResult.fullName,
            bio: updateResult.bio
          },
          testData
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Update failed',
        details: 'Database update returned null'
      });
    }
    
  } catch (error) {
    console.error('❌ Profile update test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: (error as Error).message
    });
  }
}

export async function GET() {
  try {
    // Test basic database connection
    const connected = await databaseServer.connect();
    
    if (connected) {
      await databaseServer.disconnect();
      return NextResponse.json({
        success: true,
        message: 'Database connection test successful',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      });
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: (error as Error).message
    });
  }
}