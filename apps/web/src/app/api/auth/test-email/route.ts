import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Test email configuration
    const isConfigured = await emailService.testEmailConfiguration();
    
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Email service is not properly configured. Please check your SMTP settings.'
      }, { status: 500 });
    }

    // Send test email
    const testOtp = '123456';
    const emailSent = await emailService.sendOtpEmail(body.email, testOtp, 'email_verification');
    
    return NextResponse.json({
      success: emailSent,
      data: {
        message: emailSent 
          ? `Test email sent successfully to ${body.email}` 
          : `Failed to send test email to ${body.email}`,
        emailSent
      }
    });

  } catch (error) {
    console.error('Test email error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email'
    }, { status: 500 });
  }
}