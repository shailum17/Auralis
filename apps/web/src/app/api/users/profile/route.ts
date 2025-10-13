import { NextRequest, NextResponse } from 'next/server';

// Temporary API route handler for user profile
// This should be replaced with actual backend implementation

export async function GET(request: NextRequest) {
  try {
    // Mock user profile data
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      username: 'user123',
      role: 'user',
      emailVerified: true,
      fullName: '',
      bio: '',
      interests: [],
      academicInfo: null,
      privacySettings: null,
      wellnessSettings: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockUser
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user profile'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the request for debugging
    console.log('Profile update request:', body);
    
    // Simulate successful update
    const mockUpdatedUser = {
      id: 'user-123',
      email: 'user@example.com',
      username: 'user123',
      role: 'user',
      emailVerified: true,
      ...body, // Merge the update data
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        user: mockUpdatedUser
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update user profile'
    }, { status: 500 });
  }
}