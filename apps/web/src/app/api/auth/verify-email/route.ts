import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and OTP are required',
          details: [
            ...((!email) ? [{ field: 'email', message: 'Email is required' }] : []),
            ...((!otp) ? [{ field: 'otp', message: 'Verification code is required' }] : [])
          ]
        },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid verification code format',
          details: [{ field: 'otp', message: 'Verification code must be 6 digits' }]
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
          details: [{ field: 'email', message: 'Please enter a valid email address' }]
        },
        { status: 400 }
      );
    }

    // Call backend API for verification
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/v1/auth/otp/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle backend errors
      if (response.status === 400) {
        return NextResponse.json(
          {
            success: false,
            message: result.message || 'Invalid verification code',
            details: result.details || [{ field: 'otp', message: result.message || 'Invalid or expired verification code' }]
          },
          { status: 400 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            message: 'User not found or already verified',
            details: [{ field: 'email', message: 'User not found or email already verified' }]
          },
          { status: 404 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            success: false,
            message: 'Too many verification attempts',
            details: [{ field: 'otp', message: 'Too many failed attempts. Please request a new code.' }]
          },
          { status: 429 }
        );
      }

      // Generic server error
      return NextResponse.json(
        {
          success: false,
          message: 'Verification failed',
          details: [{ field: 'general', message: 'Server error. Please try again later.' }]
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        details: [{ field: 'general', message: 'An unexpected error occurred. Please try again.' }]
      },
      { status: 500 }
    );
  }
}