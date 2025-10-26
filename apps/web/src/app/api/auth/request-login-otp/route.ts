import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username } = body;

    // Validate required fields
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

    // Call backend request login OTP endpoint
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/enhanced/otp/request-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': clientIP,
        'user-agent': userAgent,
      },
      body: JSON.stringify({
        email,
        username,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || data.error || 'Failed to send login OTP',
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login verification code sent to your email',
      email: data.email
    });

  } catch (error) {
    console.error('Request login OTP API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}