import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { 
  EmailTemplateFactory, 
  WelcomeEmailTemplate, 
  OTPEmailTemplate, 
  PasswordResetEmailTemplate,
  OTPType 
} from './templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter?: nodemailer.Transporter;
  private welcomeTemplate: WelcomeEmailTemplate;
  private otpTemplate: OTPEmailTemplate;
  private passwordResetTemplate: PasswordResetEmailTemplate;

  constructor(private configService: ConfigService) {
    this.createTransporter();
    this.initializeTemplates();
  }

  private initializeTemplates() {
    this.welcomeTemplate = EmailTemplateFactory.createWelcomeTemplate();
    this.otpTemplate = EmailTemplateFactory.createOTPTemplate();
    this.passwordResetTemplate = EmailTemplateFactory.createPasswordResetTemplate();
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

    // Verify connection configuration (non-blocking)
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email service configuration error:', error);
        this.logger.warn('Email service will attempt to send emails despite verification error. Check SMTP configuration if emails fail.');
        // Don't disable transporter - let individual send attempts handle errors
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

  /**
   * Send welcome email with verification instructions using new template system
   */
  async sendWelcomeEmail(to: string, recipientName?: string, otp?: string): Promise<boolean> {
    const template = this.welcomeTemplate.generate({
      recipientEmail: to,
      recipientName,
      otp
    });

    const result = await this.sendTemplatedEmail(to, template, `welcome-${Date.now()}`);
    return result.success;
  }

  /**
   * Send OTP email using new template system
   */
  async sendOTPEmail(to: string, otp: string, otpType: OTPType, recipientName?: string): Promise<boolean> {
    const template = this.otpTemplate.generate({
      recipientEmail: to,
      recipientName,
      otp,
      otpType
    });

    const result = await this.sendTemplatedEmail(to, template, `otp-${otpType}-${Date.now()}`);
    return result.success;
  }

  /**
   * Send password reset email using new template system
   */
  async sendPasswordResetEmail(to: string, otp?: string, resetLink?: string, recipientName?: string): Promise<boolean> {
    const template = this.passwordResetTemplate.generate({
      recipientEmail: to,
      recipientName,
      otp,
      resetLink
    });

    const result = await this.sendTemplatedEmail(to, template, `password-reset-${Date.now()}`);
    return result.success;
  }

  /**
   * Send templated email with full response details
   */
  async sendTemplatedEmailWithDetails(
    to: string, 
    template: { subject: string; html: string; text: string },
    trackingId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplatedEmail(to, template, trackingId);
  }

  /**
   * Generic method to send templated emails with delivery tracking
   */
  private async sendTemplatedEmail(
    to: string, 
    template: { subject: string; html: string; text: string },
    trackingId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // If transporter is not configured, just log the email details
    if (!this.transporter) {
      this.logger.log(`Email for ${to}: ${template.subject}`);
      this.logger.warn('Email not sent - SMTP not configured. Check your .env file.');
      return { success: true, messageId: 'dev-mode-' + Date.now() }; // Return success for development
    }

    try {
      const mailOptions = {
        from: {
          name: 'Auralis Student Community',
          address: this.configService.get<string>('SMTP_USER'),
        },
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        headers: trackingId ? { 'X-Tracking-ID': trackingId } : undefined,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}. Subject: ${template.subject}. Message ID: ${result.messageId}`);
      
      return { 
        success: true, 
        messageId: result.messageId 
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      this.logger.log(`FALLBACK - Email details for ${to}: ${template.subject}`);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown email error' 
      };
    }
  }

  /**
   * Check email delivery status (mock implementation)
   */
  async getDeliveryStatus(messageId: string): Promise<{
    status: 'pending' | 'delivered' | 'failed' | 'bounced';
    deliveredAt?: Date;
    error?: string;
  }> {
    // In a real implementation, this would integrate with your email provider's API
    // For now, return a mock successful delivery
    return {
      status: 'delivered',
      deliveredAt: new Date()
    };
  }

  /**
   * Verify email service configuration
   */
  async verifyConfiguration(): Promise<{ configured: boolean; error?: string }> {
    if (!this.transporter) {
      return { 
        configured: false, 
        error: 'SMTP not configured. Check your environment variables.' 
      };
    }

    try {
      await this.transporter.verify();
      return { configured: true };
    } catch (error) {
      return { 
        configured: false, 
        error: error instanceof Error ? error.message : 'SMTP verification failed' 
      };
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