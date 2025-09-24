const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email configuration...');
  
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  console.log('SMTP Configuration:');
  console.log('Host:', smtpHost);
  console.log('Port:', smtpPort);
  console.log('User:', smtpUser);
  console.log('Pass:', smtpPass ? '***configured***' : 'NOT SET');
  
  if (!smtpHost || !smtpUser || !smtpPass || smtpUser === 'your-email@gmail.com') {
    console.log('❌ Email not configured. Please update your .env file.');
    console.log('📧 Test OTP: 123456 (would be logged to console)');
    return;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    
    // Test connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    const testOtp = '123456';
    const result = await transporter.sendMail({
      from: {
        name: 'Auralis Student Community',
        address: smtpUser,
      },
      to: smtpUser, // Send to yourself for testing
      subject: 'Test OTP - Auralis Student Community',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 8px; color: white; font-weight: bold; font-size: 24px; line-height: 48px;">A</div>
            <h1 style="color: #1f2937; margin: 10px 0;">Auralis</h1>
            <p style="color: #6b7280; margin: 0;">Student Community Platform</p>
          </div>
          
          <h2 style="color: #1f2937; text-align: center;">Email Test Successful!</h2>
          <p style="color: #4b5563; font-size: 16px;">Your email configuration is working correctly. Here's your test OTP:</p>
          
          <div style="background: linear-gradient(135deg, #eff6ff, #f3e8ff); border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="margin: 0; font-size: 18px; color: #4b5563;">Test OTP Code:</p>
            <div style="font-size: 36px; font-weight: bold; color: #1f2937; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace;">${testOtp}</div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Email service is ready for production!</p>
          </div>
          
          <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; color: #047857;">
            <strong>Success!</strong> Your OTP email system is now fully functional and ready to send verification codes to users.
          </div>
        </div>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📬 Check your email inbox for the test message.');
    
  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    console.log('📧 Fallback OTP: 123456 (would be logged to console)');
  }
}

testEmail().catch(console.error);