import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, otp, type, rememberMe, sessionDuration } = body;

    // Validate required fields
    if (!otp) {
      return NextResponse.json(
        { success: false, error: 'OTP is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'OTP type is required' },
        { status: 400 }
      );
    }

    if (!email && !username) {
      return NextResponse.json(
        { success: false, error: 'Either email or username is required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid verification code format',
          details: [{ field: 'otp', message: 'Verification code must be 6 digits' }]
        },
        { status: 400 }
      );
    }

    // Get client IP and user agent for security
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Route to appropriate backend endpoint based on type
    let backendEndpoint = '';
    let requestBody: any = {
      email,
      username,
      otp,
    };

    switch (type) {
      case 'LOGIN':
        backendEndpoint = `${API_BASE_URL}/api/v1/auth/enhanced/otp/verify-login`;
        requestBody = {
          ...requestBody,
          rememberMe,
          sessionDuration,
        };
        break;
      case 'EMAIL_VERIFICATION':
        backendEndpoint = `${API_BASE_URL}/api/v1/auth/otp/verify-email`;
        break;
      case 'PASSWORD_RESET':
        backendEndpoint = `${API_BASE_URL}/api/v1/auth/password/verify-reset-otp`;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid OTP type' },
          { status: 400 }
        );
    }

    // Call backend verify OTP endpoint
    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': clientIP,
        'user-agent': userAgent,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || data.error || 'OTP verification failed',
          details: data.details || [{ field: 'otp', message: 'Invalid or expired verification code' }]
        },
        { status: response.status }
      );
    }

    // Return success response with user data and tokens for login
    const responseData: any = {
      success: true,
      message: data.message || 'OTP verified successfully'
    };

    // Include user data and tokens for login verification
    if (type === 'LOGIN' && data.user) {
      responseData.user = data.user;
      responseData.accessToken = data.accessToken;
      responseData.refreshToken = data.refreshToken;
    }

    // Include user data for email verification
    if (type === 'EMAIL_VERIFICATION' && data.user) {
      responseData.user = data.user;
      responseData.accessToken = data.accessToken;
      responseData.refreshToken = data.refreshToken;
    }

    // Include reset token for password reset
    if (type === 'PASSWORD_RESET' && data.resetToken) {
      responseData.resetToken = data.resetToken;
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Verify OTP API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}