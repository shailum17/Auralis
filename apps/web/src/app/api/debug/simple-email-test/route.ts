import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }
    
    console.log('🧪 Simple email test to:', email);
    
    // Test nodemailer directly
    try {
      const nodemailer = await import('nodemailer');
      console.log('✅ Nodemailer imported successfully');
      
      // Create transporter with environment variables
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      
      console.log('✅ Transporter created');
      
      // Test connection
      console.log('🔗 Testing SMTP connection...');
      const connectionTest = await transporter.verify();
      console.log('🔗 Connection test result:', connectionTest);
      
      if (!connectionTest) {
        return NextResponse.json({
          success: false,
          error: 'SMTP connection test failed',
          details: 'Could not connect to SMTP server'
        });
      }
      
      // Send test email
      console.log('📧 Sending test email...');
      const mailOptions = {
        from: `Auralis Test <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Test Email from Auralis',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email to verify that nodemailer is working correctly.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <p>If you received this email, the email service is working!</p>
        `
      };
      
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      
      return NextResponse.json({
        success: true,
        data: {
          messageId: result.messageId,
          accepted: result.accepted,
          rejected: result.rejected,
          connectionTest: true
        },
        message: 'Test email sent successfully'
      });
      
    } catch (nodemailerError) {
      console.error('❌ Nodemailer error:', nodemailerError);
      
      return NextResponse.json({
        success: false,
        error: 'Nodemailer test failed',
        details: (nodemailerError as Error).message,
        stack: (nodemailerError as Error).stack?.substring(0, 500)
      });
    }
    
  } catch (error) {
    console.error('❌ Simple email test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check environment variables
    const config = {
      SMTP_HOST: process.env.SMTP_HOST || 'Not set',
      SMTP_PORT: process.env.SMTP_PORT || 'Not set',
      SMTP_USER: process.env.SMTP_USER || 'Not set',
      SMTP_PASS: process.env.SMTP_PASS ? 'Set (length: ' + process.env.SMTP_PASS.length + ')' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    };
    
    console.log('🔍 Environment check:', config);
    
    return NextResponse.json({
      success: true,
      data: config,
      message: 'Environment variables checked'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Environment check failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}