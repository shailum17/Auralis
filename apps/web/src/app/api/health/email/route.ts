import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function GET() {
  try {
    // Test email configuration
    const isConfigured = await emailService.testEmailConfiguration();
    
    return NextResponse.json({
      success: true,
      data: {
        emailConfigured: isConfigured,
        message: isConfigured 
          ? 'Email service is properly configured and ready to send emails'
          : 'Email service is not configured or has connection issues',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check email service health',
      details: (error as Error).message
    }, { status: 500 });
  }
}