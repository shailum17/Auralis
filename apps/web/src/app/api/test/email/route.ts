import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Test email sending
    const result = await emailService.sendOTPEmail({
      to: email,
      otp: '123456',
      fullName: 'Test User',
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check email service health
    const healthCheck = await emailService.healthCheck();
    const configTest = await emailService.testEmailConfiguration();

    return NextResponse.json({
      configured: healthCheck.configured,
      provider: healthCheck.provider,
      configurationValid: configTest,
      environment: process.env.NODE_ENV,
      smtpHost: process.env.SMTP_HOST,
      smtpUser: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-10) : 'not set',
    });
  } catch (error) {
    console.error('Email health check error:', error);
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}