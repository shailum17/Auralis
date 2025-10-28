import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing users collection...');
    
    const collection = await getUsersCollection();
    console.log('✅ Users collection obtained');
    
    // Test basic operations
    const totalUsers = await collection.countDocuments();
    const adminUsers = await collection.countDocuments({
      role: { $in: ['ADMIN', 'MODERATOR'] }
    });
    const regularUsers = await collection.countDocuments({
      role: 'USER'
    });
    
    console.log('📊 Collection stats:', { totalUsers, adminUsers, regularUsers });
    
    // Get sample user (without password)
    const sampleUser = await collection.findOne(
      {},
      { 
        projection: { 
          passwordHash: 0,
          loginAttempts: 0,
          lockedUntil: 0
        } 
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Users collection test successful',
      stats: {
        totalUsers,
        adminUsers,
        regularUsers,
        hasSampleUser: !!sampleUser
      },
      sampleUser: sampleUser ? {
        id: sampleUser.id,
        username: sampleUser.username,
        email: sampleUser.email,
        role: sampleUser.role,
        isActive: sampleUser.isActive,
        createdAt: sampleUser.createdAt
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Users collection test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'USERS_COLLECTION_TEST_FAILED',
        message: error instanceof Error ? error.message : 'Users collection test failed',
        details: {
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}