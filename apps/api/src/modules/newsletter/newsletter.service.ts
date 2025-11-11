import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // Type-safe accessor for newsletterSubscription
  private get newsletterSubscription() {
    return (this.prisma as any).newsletterSubscription;
  }

  async subscribeToNewsletter(email: string) {
    // Check if email already exists
    const existing = await this.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new Error('Email already subscribed');
      }
      // Reactivate subscription
      const updated = await this.newsletterSubscription.update({
        where: { email },
        data: {
          isActive: true,
          subscribedAt: new Date(),
        },
      });

      // Send welcome back email
      await this.sendWelcomeEmail(email);

      return { email: updated.email, subscribedAt: updated.subscribedAt };
    }

    // Create new subscription
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    
    const subscription = await this.newsletterSubscription.create({
      data: {
        email,
        unsubscribeToken,
        isActive: true,
      },
    });

    // Send welcome email
    await this.sendWelcomeEmail(email);

    return { email: subscription.email, subscribedAt: subscription.subscribedAt };
  }

  async unsubscribeFromNewsletter(email: string, token: string) {
    const subscription = await this.newsletterSubscription.findUnique({
      where: { email },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.unsubscribeToken !== token) {
      throw new Error('Invalid unsubscribe token');
    }

    await this.newsletterSubscription.update({
      where: { email },
      data: { 
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    // Send goodbye email
    await this.sendGoodbyeEmail(email);
  }

  private async sendWelcomeEmail(email: string) {
    try {
      const template = this.createNewsletterWelcomeTemplate(email);
      const result = await this.emailService.sendTemplatedEmailWithDetails(
        email,
        template,
        `newsletter-welcome-${Date.now()}`
      );

      if (result.success) {
        this.logger.log(`Newsletter welcome email sent to ${email}. Message ID: ${result.messageId}`);
      } else {
        this.logger.error(`Failed to send newsletter welcome email to ${email}: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending newsletter welcome email to ${email}:`, error);
    }
  }

  private async sendGoodbyeEmail(email: string) {
    try {
      const template = this.createNewsletterGoodbyeTemplate(email);
      const result = await this.emailService.sendTemplatedEmailWithDetails(
        email,
        template,
        `newsletter-goodbye-${Date.now()}`
      );

      if (result.success) {
        this.logger.log(`Newsletter goodbye email sent to ${email}. Message ID: ${result.messageId}`);
      } else {
        this.logger.error(`Failed to send newsletter goodbye email to ${email}: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending newsletter goodbye email to ${email}:`, error);
    }
  }

  private createNewsletterWelcomeTemplate(email: string) {
    const unsubscribeLink = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
    
    return {
      subject: '🎉 Welcome to Auralis Newsletter!',
      text: `Welcome to Auralis Newsletter!\n\nThank you for subscribing! You'll now receive updates about:\n- Student wellness tips and resources\n- Community highlights and success stories\n- New features and platform updates\n- Mental health support resources\n\nWe're excited to have you as part of our community!\n\nTo unsubscribe, visit: ${unsubscribeLink}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Auralis Newsletter</title>
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
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 12px;
                    color: white;
                    font-weight: bold;
                    font-size: 32px;
                    line-height: 64px;
                    margin-bottom: 16px;
                }
                .brand {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1f2937;
                    margin: 0;
                }
                .welcome-box {
                    background: linear-gradient(135deg, #eff6ff, #f3e8ff);
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                }
                .feature-list {
                    list-style: none;
                    padding: 0;
                    margin: 30px 0;
                }
                .feature-item {
                    padding: 15px;
                    margin: 10px 0;
                    background: #f9fafb;
                    border-left: 4px solid #3b82f6;
                    border-radius: 8px;
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
                .unsubscribe {
                    color: #6b7280;
                    font-size: 12px;
                    text-decoration: none;
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
                
                <div class="welcome-box">
                    <h2 style="color: #1f2937; margin: 0 0 10px 0;">🎉 Welcome to Our Newsletter!</h2>
                    <p style="color: #4b5563; margin: 0;">Thank you for joining the Auralis community!</p>
                </div>
                
                <p style="font-size: 16px; color: #4b5563;">
                    We're thrilled to have you on board! You'll now receive regular updates about:
                </p>
                
                <ul class="feature-list">
                    <li class="feature-item">
                        <strong>🧘 Student Wellness Tips</strong><br>
                        <span style="color: #6b7280;">Evidence-based strategies for mental health and well-being</span>
                    </li>
                    <li class="feature-item">
                        <strong>🌟 Community Highlights</strong><br>
                        <span style="color: #6b7280;">Success stories and inspiring moments from fellow students</span>
                    </li>
                    <li class="feature-item">
                        <strong>🚀 Platform Updates</strong><br>
                        <span style="color: #6b7280;">New features and improvements to enhance your experience</span>
                    </li>
                    <li class="feature-item">
                        <strong>💙 Support Resources</strong><br>
                        <span style="color: #6b7280;">Curated mental health resources and crisis support information</span>
                    </li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}" class="button">
                        Visit Auralis →
                    </a>
                </div>
                
                <div class="footer">
                    <p>You're receiving this email because you subscribed to the Auralis newsletter.</p>
                    <p style="margin-top: 10px;">
                        <a href="${unsubscribeLink}" class="unsubscribe">Unsubscribe from this newsletter</a>
                    </p>
                    <p style="margin-top: 20px;">
                        <a href="#" style="color: #3b82f6; text-decoration: none;">Visit Auralis</a> |
                        <a href="#" style="color: #3b82f6; text-decoration: none;">Support</a> |
                        <a href="#" style="color: #3b82f6; text-decoration: none;">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    };
  }

  private createNewsletterGoodbyeTemplate(email: string) {
    return {
      subject: 'Sorry to see you go - Auralis Newsletter',
      text: `We're sorry to see you go!\n\nYou have been successfully unsubscribed from the Auralis newsletter.\n\nIf this was a mistake, you can resubscribe anytime at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}\n\nThank you for being part of our community!`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unsubscribed from Auralis Newsletter</title>
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
                    text-align: center;
                }
                .logo {
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 12px;
                    color: white;
                    font-weight: bold;
                    font-size: 32px;
                    line-height: 64px;
                    margin-bottom: 16px;
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
                <div class="logo">A</div>
                <h1 style="color: #1f2937;">We're Sorry to See You Go</h1>
                <p style="color: #4b5563; font-size: 16px;">
                    You have been successfully unsubscribed from the Auralis newsletter.
                </p>
                <p style="color: #6b7280;">
                    If this was a mistake, you can resubscribe anytime.
                </p>
                <a href="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}" class="button">
                    Resubscribe
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Thank you for being part of our community!
                </p>
            </div>
        </body>
        </html>
      `
    };
  }

  async getAllSubscribers() {
    return await this.newsletterSubscription.findMany({
      where: { isActive: true },
      select: {
        email: true,
        subscribedAt: true,
      },
      orderBy: { subscribedAt: 'desc' },
    });
  }
}
