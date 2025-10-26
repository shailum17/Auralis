import { NextRequest, NextResponse } from 'next/server';
import { profileService } from '@/lib/profile-service';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const testUserId = body.userId || 'test-user-123';
    
    console.log('🧪 Testing profile update for user:', testUserId);

    // Test profile update
    const updateResult = await profileService.updateProfile(testUserId, {
      fullName: 'Test User Updated',
      bio: 'This is an updated test bio',
      academicInfo: {
        institution: 'Updated University',
        major: 'Updated Computer Science',
        year: 2025
      },
      interests: ['Updated Programming', 'Updated AI', 'Updated Testing'],
    });

    let profileFetchResult = null;
    if (updateResult.success) {
      // Test profile fetch
      profileFetchResult = await profileService.getProfile(testUserId);
    }

    return NextResponse.json({
      success: true,
      data: {
        update: updateResult,
        fetch: {
          success: !!profileFetchResult,
          data: profileFetchResult,
          message: profileFetchResult ? 'Profile fetched successfully' : 'Profile fetch failed'
        },
        summary: {
          updateMethod: 'profile service',
          savedToDatabase: updateResult.success,
          profilePersisted: !!profileFetchResult,
          testUserId: testUserId
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      details: 'Profile update test failed'
    }, { status: 500 });
  }
}