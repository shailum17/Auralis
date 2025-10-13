import nodemailer, { Transporter } from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Get email configuration from environment variables
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    };

    // Check if email is configured
    if (!config.host || !config.user || !config.pass || config.user === 'your-email@gmail.com') {
      console.warn('Email service not configured. OTPs will be logged to console only.');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465, // true for 465, false for other ports
        auth: {
          user: config.user,
          pass: config.pass,
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates for development
        },
      });

      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  async sendOtpEmail(to: string, otp: string, type: string = 'email_verification'): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log(`📧 OTP for ${to} (${type}): ${otp}`);
      console.warn('⚠️ Email not sent - SMTP not configured. Check your environment variables.');
      console.warn('💡 For Gmail, you need to:');
      console.warn('   1. Enable 2-factor authentication');
      console.warn('   2. Generate an App Password');
      console.warn('   3. Use the App Password in SMTP_PASS');
      return false;
    }

    try {
      // Test connection before sending
      await this.transporter.verify();
      
      const subject = this.getEmailSubject(type);
      const html = this.getEmailTemplate(otp, type);

      const mailOptions = {
        from: `Auralis Student Community <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent successfully to ${to}. Message ID: ${result?.messageId || 'unknown'}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to send OTP email to ${to}:`, error.message);
      
      // Provide specific error guidance
      if (error.code === 'EAUTH') {
        console.error('🔐 Authentication failed. Please check:');
        console.error('   - SMTP_USER is correct');
        console.error('   - SMTP_PASS is an App Password (not regular password)');
        console.error('   - 2-factor authentication is enabled on Gmail');
      } else if (error.code === 'ECONNECTION') {
        console.error('🌐 Connection failed. Please check:');
        console.error('   - Internet connectivity');
        console.error('   - SMTP_HOST and SMTP_PORT are correct');
        console.error('   - Firewall settings');
      }
      
      // Fallback: log OTP to console if email fails
      console.log(`📧 FALLBACK - OTP for ${to} (${type}): ${otp}`);
      return false;
    }
  }

  private getEmailSubject(type: string): string {
    switch (type) {
      case 'email_verification':
        return 'Verify Your Email - Auralis Student Community';
      case 'login':
        return 'Your Login Code - Auralis Student Community';
      case 'password_reset':
        return 'Password Reset Code - Auralis Student Community';
      default:
        return 'Verification Code - Auralis Student Community';
    }
  }

  private getEmailTemplate(otp: string, type: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.getEmailSubject(type)}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                display: inline-block;
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                border-radius: 8px;
                color: white;
                font-weight: bold;
                font-size: 24px;
                line-height: 48px;
                margin-bottom: 16px;
            }
            .brand {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                margin: 0;
            }
            .otp-container {
                background: linear-gradient(135deg, #eff6ff, #f3e8ff);
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
            }
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #1f2937;
                letter-spacing: 8px;
                margin: 20px 0;
                font-family: 'Courier New', monospace;
            }
            .message {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 20px;
            }
            .warning {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                font-size: 14px;
                color: #92400e;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">A</div>
                <h1 class="brand">Auralis</h1>
                <p style="color: #6b7280; margin: 0;">Student Community Platform</p>
            </div>
            
            ${this.getEmailContent(otp, type)}
            
            <div class="footer">
                <p>This email was sent by Auralis Student Community Platform.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <p style="margin-top: 20px;">
                    <a href="#" style="color: #3b82f6; text-decoration: none;">Visit Auralis</a> |
                    <a href="#" style="color: #3b82f6; text-decoration: none;">Support</a> |
                    <a href="#" style="color: #3b82f6; text-decoration: none;">Privacy Policy</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private getEmailContent(otp: string, type: string): string {
    switch (type) {
      case 'email_verification':
        return `
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Verify Your Email Address</h2>
          <p class="message">Welcome to Auralis! Please use the verification code below to confirm your email address and complete your account setup.</p>
          <div class="otp-container">
            <p style="margin: 0; font-size: 18px; color: #4b5563;">Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">This code expires in 10 minutes</p>
          </div>
          <div class="warning">
            <strong>Security Note:</strong> Never share this code with anyone. Auralis will never ask for your verification code via phone or email.
          </div>
        `;
      
      case 'login':
        return `
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Your Login Code</h2>
          <p class="message">You requested to sign in to your Auralis account. Use the code below to complete your login.</p>
          <div class="otp-container">
            <p style="margin: 0; font-size: 18px; color: #4b5563;">Your login code is:</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">This code expires in 10 minutes</p>
          </div>
          <div class="warning">
            <strong>Security Alert:</strong> If you didn't request this login code, someone may be trying to access your account. Please secure your account immediately.
          </div>
        `;
      
      case 'password_reset':
        return `
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Reset Your Password</h2>
          <p class="message">You requested to reset your password for your Auralis account. Use the code below to proceed with password reset.</p>
          <div class="otp-container">
            <p style="margin: 0; font-size: 18px; color: #4b5563;">Your password reset code is:</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">This code expires in 10 minutes</p>
          </div>
          <div class="warning">
            <strong>Security Note:</strong> If you didn't request a password reset, please ignore this email and consider securing your account.
          </div>
        `;
      
      default:
        return `
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Verification Code</h2>
          <p class="message">Here's your verification code for Auralis Student Community Platform.</p>
          <div class="otp-container">
            <p style="margin: 0; font-size: 18px; color: #4b5563;">Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">This code expires in 10 minutes</p>
          </div>
        `;
    }
  }

  async testEmailConfiguration(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.error('❌ Email service not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email configuration test passed');
      return true;
    } catch (error: any) {
      console.error('❌ Email configuration test failed:', error.message);
      
      if (error.code === 'EAUTH') {
        console.error('🔐 Authentication issue - check your Gmail App Password');
      } else if (error.code === 'ECONNECTION') {
        console.error('🌐 Connection issue - check network and SMTP settings');
      }
      
      return false;
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService();