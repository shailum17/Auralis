import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { userDataSync } from '@/lib/user-sync';

// API route for requesting email verification OTP with direct email sending

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate email
    if (!body.email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Generate OTP (in real implementation, this would be random)
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate random 6-digit OTP
    
    // Log the OTP request for debugging
    console.log(`📧 OTP Request for ${body.email}`);
    console.log(`🔐 Generated OTP: ${otp}`);
    
    // Try to send email directly first
    let emailSent = false;
    try {
      emailSent = await emailService.sendOtpEmail(body.email, otp, 'email_verification');
      if (emailSent) {
        console.log(`✅ Email sent successfully to ${body.email} via direct service`);
      } else {
        console.log(`⚠️ Direct email service failed, trying backend API for ${body.email}`);
        
        // Fallback to backend API
        try {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/send-otp-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: body.email,
              otp: otp,
              type: 'email_verification'
            })
          });
          
          if (emailResponse.ok) {
            emailSent = true;
            console.log(`✅ Email sent successfully to ${body.email} via backend API`);
          } else {
            console.log(`⚠️ Backend email service also unavailable for ${body.email}`);
          }
        } catch (backendError) {
          console.log(`⚠️ Backend API error for ${body.email}:`, (backendError as Error).message);
        }
      }
    } catch (error) {
      console.log(`⚠️ Email service error for ${body.email}:`, (error as Error).message);
    }

    // Store OTP in memory for verification (both development and production fallback)
    globalThis.otpStore = globalThis.otpStore || {};
    globalThis.otpStore[body.email.toLowerCase()] = {
      otp: otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    };

    console.log(`✅ OTP ${emailSent ? 'sent via email' : 'ready for verification'} for ${body.email}`);

    return NextResponse.json({
      success: true,
      data: {
        message: emailSent 
          ? `Verification code sent to ${body.email}` 
          : `Verification code generated for ${body.email}`,
        email: body.email,
        expiresIn: 600, // 10 minutes in seconds
        emailSent: emailSent,
        // Only return OTP in development when email wasn't sent
        ...(process.env.NODE_ENV === 'development' && !emailSent && { otp })
      }
    });

  } catch (error) {
    console.error('OTP request error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send verification code'
    }, { status: 500 });
  }
}