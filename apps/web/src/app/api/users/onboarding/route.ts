import { NextRequest, NextResponse } from 'next/server';

// Temporary API route handler for user onboarding
// This should be replaced with actual backend implementation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the request for debugging
    console.log('Onboarding completion request:', body);
    
    // Simulate successful onboarding completion
    const mockUpdatedUser = {
      id: 'user-123',
      email: 'user@example.com',
      username: 'user123',
      role: 'user',
      emailVerified: true,
      fullName: body.fullName || '',
      bio: body.bio || '',
      interests: body.interests || [],
      academicInfo: body.academicInfo || null,
      privacySettings: body.privacySettings || {
        allowDirectMessages: true,
        showOnlineStatus: true,
        allowProfileViewing: true,
        dataCollection: true,
      },
      wellnessSettings: body.wellnessSettings || {
        trackMood: false,
        trackStress: false,
        shareWellnessData: false,
        crisisAlertsEnabled: true,
        allowWellnessInsights: false,
      },
      preferences: body.preferences || {
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          messageNotifications: true,
          wellnessAlerts: true,
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        user: mockUpdatedUser
      }
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to complete onboarding'
    }, { status: 500 });
  }
}