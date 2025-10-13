import { NextRequest, NextResponse } from 'next/server';
import { registrationService } from '@/lib/registration-service';

// Enhanced registration endpoint with guaranteed database saving
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the registration request for debugging
    console.log('🚀 Enhanced registration request:', {
      email: body.email,
      username: body.username,
      fullName: body.fullName,
      hasAcademicInfo: !!body.academicInfo,
      interestsCount: body.interests?.length || 0,
      acceptMarketing: body.acceptMarketing,
    });

    // Validate required fields
    if (!body.email || !body.password || !body.username || !body.fullName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, password, username, and fullName are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(body.username) || body.username.length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Username must be at least 3 characters and contain only letters, numbers, hyphens, and underscores'
      }, { status: 400 });
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }

    // Use comprehensive registration service
    const result = await registrationService.registerUser({
      email: body.email,
      password: body.password,
      username: body.username,
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      bio: body.bio,
      academicInfo: body.academicInfo,
      interests: body.interests,
      acceptMarketing: body.acceptMarketing
    });

    if (result.success && result.data) {
      // Store user data for OTP verification regardless of save method
      globalThis.pendingUsers = globalThis.pendingUsers || {};
      globalThis.pendingUsers[body.email.toLowerCase()] = result.data.user;

      console.log(`✅ Registration completed via ${result.data.method}:`, {
        email: result.data.user.email,
        username: result.data.user.username,
        fullName: result.data.user.fullName,
        savedToDatabase: result.data.savedToDatabase,
        method: result.data.method
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: result.data.user.id,
            email: result.data.user.email,
            username: result.data.user.username,
            fullName: result.data.user.fullName,
            emailVerified: result.data.user.emailVerified,
            role: result.data.user.role,
            createdAt: result.data.user.createdAt,
          },
          message: result.data.message,
          savedToDatabase: result.data.savedToDatabase,
          method: result.data.method
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Registration failed'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Enhanced registration error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.'
    }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}