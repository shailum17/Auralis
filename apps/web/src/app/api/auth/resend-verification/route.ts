import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage (in production, use Redis or database)
const resendAttempts = new Map<string, { count: number; lastAttempt: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email is required',
          details: [{ field: 'email', message: 'Email is required' }]
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

    // Check rate limiting
    const now = Date.now();
    const userAttempts = resendAttempts.get(email);
    const maxAttempts = 3;
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const minInterval = 60 * 1000; // 1 minute between requests

    if (userAttempts) {
      // Reset counter if window has passed
      if (now > userAttempts.resetTime) {
        resendAttempts.delete(email);
      } else {
        // Check if too many attempts
        if (userAttempts.count >= maxAttempts) {
          const remainingTime = Math.ceil((userAttempts.resetTime - now) / 1000 / 60);
          return NextResponse.json(
            {
              success: false,
              message: 'Too many resend attempts',
              details: [{ 
                field: 'resend', 
                message: `Too many attempts. Please try again in ${remainingTime} minutes.` 
              }]
            },
            { status: 429 }
          );
        }

        // Check minimum interval
        if (now - userAttempts.lastAttempt < minInterval) {
          const remainingTime = Math.ceil((minInterval - (now - userAttempts.lastAttempt)) / 1000);
          return NextResponse.json(
            {
              success: false,
              message: 'Please wait before requesting another code',
              details: [{ 
                field: 'resend', 
                message: `Please wait ${remainingTime} seconds before requesting another code.` 
              }]
            },
            { status: 429 }
          );
        }
      }
    }

    // Call backend API for resend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/v1/auth/otp/request-email-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle backend errors
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
            message: 'Rate limit exceeded',
            details: [{ field: 'resend', message: 'Too many requests. Please try again later.' }]
          },
          { status: 429 }
        );
      }

      // Generic server error
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to resend verification code',
          details: [{ field: 'general', message: 'Server error. Please try again later.' }]
        },
        { status: 500 }
      );
    }

    // Update rate limiting
    const currentAttempts = resendAttempts.get(email);
    if (currentAttempts) {
      resendAttempts.set(email, {
        count: currentAttempts.count + 1,
        lastAttempt: now,
        resetTime: currentAttempts.resetTime
      });
    } else {
      resendAttempts.set(email, {
        count: 1,
        lastAttempt: now,
        resetTime: now + windowMs
      });
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      email: result.email
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    
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