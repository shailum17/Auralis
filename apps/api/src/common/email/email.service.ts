import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter?: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    // Check if email is configured
    if (!smtpHost || !smtpUser || !smtpPass || smtpUser === 'your-email@gmail.com') {
      this.logger.warn('Email service not configured. OTPs will be logged to console only.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates for development
      },
    });

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email service configuration error:', error);
        this.logger.warn('Falling back to console-only OTP logging. Set SMTP_* env vars correctly to enable real emails.');
        // Disable transporter so sendOtpEmail uses console fallback
        this.transporter = undefined;
      } else {
        this.logger.log('Email service is ready to send messages');
      }
    });
  }

  async sendOtpEmail(to: string, otp: string, type: string): Promise<boolean> {
    const subject = this.getEmailSubject(type);
    const html = this.getEmailTemplate(otp, type);

    // If transporter is not configured, just log the OTP
    if (!this.transporter) {
      this.logger.log(`OTP for ${to} (${type}): ${otp}`);
      this.logger.warn('Email not sent - SMTP not configured. Check your .env file.');
      return true; // Return true for development purposes
    }

    try {
      const mailOptions = {
        from: {
          name: 'Auralis Student Community',
          address: this.configService.get<string>('SMTP_USER'),
        },
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${to}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}:`, error);
      // Fallback: log OTP to console if email fails
      this.logger.log(`FALLBACK - OTP for ${to} (${type}): ${otp}`);
      return false;
    }
  }

  private getEmailSubject(type: string): string {
    switch (type) {
      case 'email_verification':
        return 'Verify Your Email - Auralis Student Community';
      case 'login':
        return 'Your Login Code - Auralis Student Community';
      case 'password-login':
        return 'Secure Login Verification - Auralis Student Community';
      case 'password_reset':
        return 'Password Reset Code - Auralis Student Community';
      default:
        return 'Verification Code - Auralis Student Community';
    }
  }

  private getEmailTemplate(otp: string, type: string): string {
    const baseTemplate = `
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
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 20px 0;
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

    return baseTemplate;
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
      
      case 'password-login':
        return `
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">🔐 Secure Login Verification</h2>
          <p class="message">Your password has been verified successfully! For additional security, please use the verification code below to complete your login.</p>
          <div class="otp-container">
            <p style="margin: 0; font-size: 18px; color: #4b5563;">Your security verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">This code expires in 5 minutes</p>
          </div>
          <div class="warning">
            <strong>Enhanced Security:</strong> This extra step helps protect your account from unauthorized access. Never share this code with anyone.
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
}