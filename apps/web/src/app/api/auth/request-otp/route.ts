import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, type } = body;

    // Validate required fields
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

    // Get client IP and user agent for security
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Route to appropriate backend endpoint based on type
    let backendEndpoint = '';
    const requestBody = {
      email,
      username,
    };

    switch (type) {
      case 'LOGIN':
        backendEndpoint = `${API_BASE_URL}/api/v1/auth/enhanced/otp/request-login`;
        break;
      case 'EMAIL_VERIFICATION':
        backendEndpoint = `${API_BASE_URL}/api/v1/auth/otp/request-email-verification`;
        break;
      case 'PASSWORD_RESET':
        backendEndpoint = `${API_BASE_URL}/api/v1/auth/password/request-reset`;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid OTP type' },
          { status: 400 }
        );
    }

    // Call backend request OTP endpoint
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
          error: data.message || data.error || 'Failed to send OTP',
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'OTP sent successfully',
      email: data.email
    });

  } catch (error) {
    console.error('Request OTP API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}