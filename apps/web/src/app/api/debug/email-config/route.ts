import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const config = {
    SMTP_HOST: process.env.SMTP_HOST || 'Not set',
    SMTP_PORT: process.env.SMTP_PORT || 'Not set',
    SMTP_USER: process.env.SMTP_USER || 'Not set',
    SMTP_PASS: process.env.SMTP_PASS ? '***configured***' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    success: true,
    config,
    notes: [
      'For Gmail, ensure you use an App Password, not your regular password',
      'Enable 2-factor authentication first',
      'Generate App Password in Google Account > Security > App passwords'
    ]
  });
}