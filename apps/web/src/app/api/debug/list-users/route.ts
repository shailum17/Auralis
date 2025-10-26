import { NextRequest, NextResponse } from 'next/server';
import { databaseServer } from '@/lib/database-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Listing all users in database...');
    
    // Connect to database
    const connected = await databaseServer.connect();
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 });
    }
    
    // Get all users (be careful in production!)
    const users = await databaseServer.getAllUsers();
    await databaseServer.disconnect();
    
    // Remove sensitive data for display
    const safeUsers = users.map((user: any) => ({
      id: user._id?.toString(),
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      emailVerified: user.emailVerified,
      role: user.role,
      createdAt: user.createdAt,
      hasPassword: !!user.passwordHash
    }));
    
    console.log(`✅ Found ${users.length} users in database`);
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: users.length,
        users: safeUsers
      },
      message: `Found ${users.length} users in database`
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to list users: ' + (error as Error).message
    }, { status: 500 });
  }
}