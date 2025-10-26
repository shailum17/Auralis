import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type = 'login' } = body;
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }
    
    console.log('🧪 Testing email service for:', email);
    
    // Import email service
    const { emailService } = await import('@/lib/email-service');
    
    // Test email configuration first
    const configTest = await emailService.testEmailConfiguration();
    
    if (!configTest) {
      return NextResponse.json({
        success: false,
        error: 'Email service configuration test failed',
        details: 'Check SMTP settings in environment variables'
      });
    }
    
    // Generate test OTP
    const testOtp = '123456';
    
    // Send test email
    const emailSent = await emailService.sendOTPEmail({ to: email, otp: testOtp });
    
    return NextResponse.json({
      success: true,
      data: {
        configurationTest: configTest,
        emailSent,
        testOtp,
        email,
        type
      },
      message: emailSent 
        ? 'Test email sent successfully' 
        : 'Email service not configured - check console for OTP'
    });
    
  } catch (error) {
    console.error('❌ Email service test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Email service test failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('🔍 Checking email service configuration...');
    
    // Check environment variables
    const config = {
      SMTP_HOST: process.env.SMTP_HOST || 'Not set',
      SMTP_PORT: process.env.SMTP_PORT || 'Not set',
      SMTP_USER: process.env.SMTP_USER || 'Not set',
      SMTP_PASS: process.env.SMTP_PASS ? '***configured***' : 'Not set'
    };
    
    // Import and test email service
    const { emailService } = await import('@/lib/email-service');
    const configTest = await emailService.testEmailConfiguration();
    
    return NextResponse.json({
      success: true,
      data: {
        environmentVariables: config,
        configurationTest: configTest,
        isConfigured: !!(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS !== 'Not set')
      },
      message: 'Email service configuration check completed'
    });
    
  } catch (error) {
    console.error('❌ Email configuration check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Email configuration check failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}