/**
 * Email Service Module
 * 
 * This module handles email sending functionality for the authentication system.
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

interface OTPEmailOptions {
  to: string;
  otp: string;
  fullName?: string;
}

interface WelcomeEmailOptions {
  to: string;
  fullName: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      // Only allow simulation mode in development
      const emailProvider = process.env.EMAIL_PROVIDER;
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (emailProvider === 'simulation' && !isProduction) {
        console.log('📧 Email service running in simulation mode (development only)');
        this.isConfigured = true;
        return;
      }

      // Configure real email transporter
      const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

      // Validate required SMTP configuration
      if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        console.error('❌ Missing required SMTP configuration');
        console.log('Required environment variables: SMTP_HOST, SMTP_USER, SMTP_PASS');
        if (isProduction) {
          throw new Error('SMTP configuration is required in production');
        }
        return;
      }

      this.transporter = nodemailer.createTransport(smtpConfig);
      this.isConfigured = true;
      console.log('✅ Email service configured with SMTP');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check if we're in simulation mode
      if (process.env.EMAIL_PROVIDER === 'simulation' && process.env.NODE_ENV !== 'production') {
        console.log('📧 Simulating email send (development mode)');
        console.log('📧 Simulated email:', {
          to: options.to,
          subject: options.subject,
          preview: options.html?.substring(0, 100) + '...',
        });
        return {
          success: true,
          messageId: `sim_${Date.now()}`,
        };
      }

      if (!this.isConfigured) {
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
          console.error('❌ Email service not configured in production');
          return {
            success: false,
            error: 'Email service not configured',
          };
        }
        // Only simulate in development
        console.log('📧 Email service not configured, simulating email send (development only)');
        console.log('📧 Simulated email:', {
          to: options.to,
          subject: options.subject,
          preview: options.html?.substring(0, 100) + '...',
        });
        return {
          success: true,
          messageId: `sim_${Date.now()}`,
        };
      }

      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@studentcommunity.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log('✅ Email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('❌ Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendOTPEmail(options: OTPEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, otp, fullName } = options;

    const subject = 'Verify Your Email - Auralis';
    const html = this.generateOTPEmailHTML(otp, fullName);
    const text = this.generateOTPEmailText(otp, fullName);

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  async sendWelcomeEmail(options: WelcomeEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, fullName } = options;

    const subject = 'Welcome to Auralis - Your Student Community';
    const html = this.generateWelcomeEmailHTML(fullName);
    const text = this.generateWelcomeEmailText(fullName);

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  private generateOTPEmailHTML(otp: string, fullName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
            .otp-code { 
              font-size: 32px; 
              font-weight: bold; 
              text-align: center; 
              background: #F3F4F6; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              letter-spacing: 4px;
            }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Auralis</div>
              <h1>Verify Your Email Address</h1>
            </div>
            
            ${fullName ? `<p>Hi ${fullName},</p>` : '<p>Hi there,</p>'}
            
            <p>Thank you for joining Auralis! To complete your registration, please verify your email address using the code below:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p>This code will expire in 10 minutes for security reasons.</p>
            
            <p>If you didn't create an account with Auralis, you can safely ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Auralis Team</p>
              <p><small>This is an automated message, please do not reply to this email.</small></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateOTPEmailText(otp: string, fullName?: string): string {
    return `
${fullName ? `Hi ${fullName},` : 'Hi there,'}

Thank you for joining Auralis! To complete your registration, please verify your email address using the code below:

Verification Code: ${otp}

This code will expire in 10 minutes for security reasons.

If you didn't create an account with Auralis, you can safely ignore this email.

Best regards,
The Auralis Team

This is an automated message, please do not reply to this email.
    `.trim();
  }

  private generateWelcomeEmailHTML(fullName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Auralis</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
            .welcome-banner { 
              background: linear-gradient(135deg, #3B82F6, #8B5CF6); 
              color: white; 
              padding: 30px; 
              border-radius: 8px; 
              text-align: center; 
              margin: 20px 0; 
            }
            .features { margin: 20px 0; }
            .feature { margin: 10px 0; padding: 10px; background: #F9FAFB; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Auralis</div>
            </div>
            
            <div class="welcome-banner">
              <h1>Welcome to Auralis, ${fullName}! 🎉</h1>
              <p>Your journey to a supportive student community starts here.</p>
            </div>
            
            <p>We're excited to have you join our community of students who support each other through academic and personal challenges.</p>
            
            <div class="features">
              <h3>What you can do now:</h3>
              <div class="feature">📝 Complete your profile to connect with like-minded students</div>
              <div class="feature">💬 Join discussions and share your experiences anonymously</div>
              <div class="feature">🧠 Access wellness resources and track your mental health</div>
              <div class="feature">👥 Find study groups and academic support</div>
            </div>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Auralis Team</p>
              <p><small>This is an automated message, please do not reply to this email.</small></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateWelcomeEmailText(fullName: string): string {
    return `
Welcome to Auralis, ${fullName}! 🎉

Your journey to a supportive student community starts here.

We're excited to have you join our community of students who support each other through academic and personal challenges.

What you can do now:
- Complete your profile to connect with like-minded students
- Join discussions and share your experiences anonymously
- Access wellness resources and track your mental health
- Find study groups and academic support

If you have any questions or need help getting started, don't hesitate to reach out to our support team.

Best regards,
The Auralis Team

This is an automated message, please do not reply to this email.
    `.trim();
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.log('📧 Email service not configured');
        return false;
      }

      // In a real implementation, this would test the actual email connection
      // For now, we'll just check if configuration exists
      return true;
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return false;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ configured: boolean; provider?: string }> {
    return {
      configured: this.isConfigured,
      provider: process.env.EMAIL_PROVIDER || 'simulation',
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type { EmailOptions, OTPEmailOptions, WelcomeEmailOptions };