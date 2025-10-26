import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, rememberMe, sessionDuration } = body;

    // Validate required fields
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!email && !username) {
      return NextResponse.json(
        { success: false, error: 'Either email or username is required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for security
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Call backend enhanced login endpoint
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/enhanced/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': clientIP,
        'user-agent': userAgent,
      },
      body: JSON.stringify({
        email,
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || data.error || 'Authentication failed',
          requiresVerification: data.requiresVerification || false
        },
        { status: response.status }
      );
    }

    // Check if user needs email verification
    if (data.user && !data.user.emailVerified) {
      return NextResponse.json({
        success: false,
        error: 'Please verify your email address before signing in',
        requiresVerification: true,
        user: {
          email: data.user.email,
          username: data.user.username,
        }
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Enhanced login API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}