import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getUsersCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test basic connection
    const { client, db } = await connectToDatabase();
    console.log('✅ Database connection successful');
    
    // Test users collection access
    const usersCollection = await getUsersCollection();
    console.log('✅ Users collection access successful');
    
    // Test collection operations
    const usersCount = await usersCollection.countDocuments();
    const adminCount = await usersCollection.countDocuments({
      role: { $in: ['ADMIN', 'MODERATOR'] }
    });
    console.log('📊 Total users count:', usersCount);
    console.log('📊 Admin users count:', adminCount);
    
    // Test database ping
    await db.admin().ping();
    console.log('🏓 Database ping successful');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      details: {
        connected: true,
        usersCollectionAccessible: true,
        totalUsersCount: usersCount,
        adminUsersCount: adminCount,
        databaseName: db.databaseName,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    
    // Log more details for debugging
    console.error('Database URL exists:', !!process.env.DATABASE_URL);
    console.error('Database URL preview:', process.env.DATABASE_URL?.substring(0, 30) + '...');
    
    return NextResponse.json(
      {
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: error instanceof Error ? error.message : 'Database connection test failed',
        details: {
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorCode: (error as any)?.code || 'Unknown',
          timestamp: new Date().toISOString(),
          hasDbUrl: !!process.env.DATABASE_URL,
          dbUrlPreview: process.env.DATABASE_URL?.substring(0, 30) + '...' || 'Not set'
        }
      },
      { status: 500 }
    );
  }
}