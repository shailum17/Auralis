import { NextRequest, NextResponse } from 'next/server';
import { registrationService } from '@/lib/registration-service';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const testEmail = body.email || `test_${Date.now()}@example.com`;
    
    console.log('🧪 Testing registration flow for:', testEmail);

    // Test registration
    const registrationResult = await registrationService.registerUser({
      email: testEmail,
      password: 'TestPassword123!',
      username: `testuser_${Date.now()}`,
      fullName: 'Test User',
      bio: 'This is a test user account',
      academicInfo: {
        institution: 'Test University',
        major: 'Computer Science',
        year: 2024
      },
      interests: ['Programming', 'AI', 'Web Development'],
      acceptMarketing: false
    });

    let emailVerificationResult = null;
    if (registrationResult.success) {
      // Test email verification
      emailVerificationResult = await registrationService.verifyUserEmail(testEmail);
    }

    return NextResponse.json({
      success: true,
      data: {
        registration: registrationResult,
        emailVerification: {
          success: emailVerificationResult,
          message: emailVerificationResult ? 'Email verified successfully' : 'Email verification failed'
        },
        summary: {
          registrationMethod: registrationResult.data?.method,
          savedToDatabase: registrationResult.data?.savedToDatabase,
          emailVerified: emailVerificationResult,
          testEmail: testEmail
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      details: 'Registration flow test failed'
    }, { status: 500 });
  }
}