const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfiguration() {
  console.log('🔧 Testing Email Configuration...');
  
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  console.log('📧 Configuration:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    pass: config.auth.pass ? '***' + config.auth.pass.slice(-4) : 'NOT SET'
  });

  try {
    const transporter = nodemailer.createTransport(config);
    
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send test email
    console.log('📤 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: 'Test Email - Auralis Email Service',
      html: `
        <h2>Email Service Test</h2>
        <p>This is a test email to verify the email configuration is working.</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>If you received this, your email service is working correctly!</p>
      `,
      text: `Email Service Test - This is a test email sent at ${new Date().toISOString()}`
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('🎉 Email configuration is working correctly!');
    
  } catch (error) {
    console.error('❌ Email configuration test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error Solutions:');
      console.log('1. Make sure you\'re using a Gmail App Password, not your regular password');
      console.log('2. Enable 2-Factor Authentication on your Gmail account');
      console.log('3. Generate a new App Password at: https://myaccount.google.com/security');
      console.log('4. Update SMTP_PASS in your .env file with the new App Password');
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Connection Error Solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify SMTP_HOST and SMTP_PORT are correct');
      console.log('3. Check if your firewall is blocking the connection');
    }
  }
}

testEmailConfiguration();