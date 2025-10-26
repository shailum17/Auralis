// Run this script to generate Ethereal email credentials
// npm install nodemailer
// node ethereal-email-setup.js

const nodemailer = require('nodemailer');

async function createEtherealAccount() {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    console.log('=== Ethereal Email Credentials ===');
    console.log('SMTP_HOST=smtp.ethereal.email');
    console.log('SMTP_PORT=587');
    console.log('SMTP_SECURE=false');
    console.log(`SMTP_USER=${testAccount.user}`);
    console.log(`SMTP_PASS=${testAccount.pass}`);
    console.log(`SMTP_FROM=${testAccount.user}`);
    console.log('');
    console.log('Preview URL: https://ethereal.email/');
    console.log('Use these credentials in your .env.local file');
  } catch (error) {
    console.error('Error creating Ethereal account:', error);
  }
}

createEtherealAccount();