import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';
import { ConfigService } from '@nestjs/config';

interface GoalNotificationData {
  goalName: string;
  category: string;
  current: number;
  target: number;
  unit: string;
  completedAt?: Date;
  weekStart: Date;
  weekEnd: Date;
}

@Injectable()
export class WellnessNotificationService {
  private readonly logger = new Logger(WellnessNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send goal completion notification email
   */
  async sendGoalCompletionEmail(userId: string, goalData: GoalNotificationData): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, username: true, fullName: true },
      });

      if (!user || !user.email) {
        this.logger.warn(`Cannot send goal completion email: User ${userId} not found or has no email`);
        return;
      }

      const template = this.createGoalCompletionTemplate(user, goalData);
      const result = await (this.emailService as any).sendTemplatedEmailWithDetails(
        user.email,
        template,
        `goal-completion-${userId}-${Date.now()}`
      );

      if (result?.success) {
        this.logger.log(`Goal completion email sent to ${user.email} for goal "${goalData.goalName}". Message ID: ${result.messageId}`);
      } else {
        this.logger.error(`Failed to send goal completion email to ${user.email}: ${result?.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending goal completion email for user ${userId}:`, error);
    }
  }

  /**
   * Send overdue goal notification email
   */
  async sendOverdueGoalEmail(userId: string, overdueGoals: GoalNotificationData[]): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, username: true, fullName: true },
      });

      if (!user || !user.email) {
        this.logger.warn(`Cannot send overdue goal email: User ${userId} not found or has no email`);
        return;
      }

      const template = this.createOverdueGoalsTemplate(user, overdueGoals);
      const result = await (this.emailService as any).sendTemplatedEmailWithDetails(
        user.email,
        template,
        `overdue-goals-${userId}-${Date.now()}`
      );

      if (result?.success) {
        this.logger.log(`Overdue goals email sent to ${user.email} for ${overdueGoals.length} goal(s). Message ID: ${result.messageId}`);
      } else {
        this.logger.error(`Failed to send overdue goals email to ${user.email}: ${result?.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending overdue goals email for user ${userId}:`, error);
    }
  }

  /**
   * Check and notify users about overdue goals (to be called by a cron job)
   */
  async checkAndNotifyOverdueGoals(): Promise<void> {
    try {
      const now = new Date();
      
      // Find all goals that are overdue but not yet marked as overdue
      const overdueGoals = await this.prisma.weeklyGoal.findMany({
        where: {
          weekEnd: { lt: now },
          isCompleted: false,
          isOverdue: false,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              fullName: true,
            },
          },
        },
      });

      // Group goals by user
      const goalsByUser = new Map<string, any[]>();
      for (const goal of overdueGoals) {
        if (!goalsByUser.has(goal.userId)) {
          goalsByUser.set(goal.userId, []);
        }
        goalsByUser.get(goal.userId)!.push(goal);
      }

      // Send notifications and mark goals as overdue
      for (const [userId, userGoals] of goalsByUser.entries()) {
        const goalData: GoalNotificationData[] = userGoals.map(g => ({
          goalName: g.name,
          category: g.category,
          current: g.current,
          target: g.target,
          unit: g.unit,
          weekStart: g.weekStart,
          weekEnd: g.weekEnd,
        }));

        // Send email notification
        await this.sendOverdueGoalEmail(userId, goalData);

        // Mark goals as overdue
        await this.prisma.weeklyGoal.updateMany({
          where: {
            id: { in: userGoals.map(g => g.id) },
          },
          data: {
            isOverdue: true,
            updatedAt: new Date(),
          },
        });
      }

      this.logger.log(`Processed ${overdueGoals.length} overdue goals for ${goalsByUser.size} users`);
    } catch (error) {
      this.logger.error('Error checking and notifying overdue goals:', error);
    }
  }

  /**
   * Create goal completion email template
   */
  private createGoalCompletionTemplate(user: any, goalData: GoalNotificationData) {
    const displayName = user.fullName || user.username || 'there';
    const appUrl = this.configService.get<string>('NEXT_PUBLIC_API_URL') || 'http://localhost:3000';
    
    const categoryEmojis: Record<string, string> = {
      mood: '😊',
      stress: '🧘',
      sleep: '😴',
      social: '👥',
      exercise: '💪',
      meditation: '🧘‍♀️',
      nutrition: '🥗',
      study: '📚',
    };

    const emoji = categoryEmojis[goalData.category] || '🎯';

    return {
      subject: `🎉 Goal Completed: ${goalData.goalName}!`,
      text: `Congratulations ${displayName}!\n\nYou've completed your wellness goal: "${goalData.goalName}"\n\nProgress: ${goalData.current}/${goalData.target} ${goalData.unit}\nCategory: ${goalData.category}\n\nKeep up the great work! Your commitment to wellness is inspiring.\n\nView your wellness dashboard: ${appUrl}/dashboard\n\n- The Auralis Team`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Goal Completed!</title>
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
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .celebration {
                    font-size: 64px;
                    margin: 20px 0;
                }
                .goal-card {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                }
                .goal-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .progress {
                    font-size: 32px;
                    font-weight: bold;
                    margin: 15px 0;
                }
                .category-badge {
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    margin-top: 10px;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    padding: 14px 28px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 14px;
                    color: #6b7280;
                }
                .motivational-quote {
                    background: #f0fdf4;
                    border-left: 4px solid #10b981;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                    font-style: italic;
                    color: #065f46;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="celebration">${emoji} 🎉 ✨</div>
                    <h1 style="color: #1f2937; margin: 0;">Congratulations, ${displayName}!</h1>
                    <p style="color: #6b7280; font-size: 18px;">You've completed a wellness goal!</p>
                </div>
                
                <div class="goal-card">
                    <div style="font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Goal Completed</div>
                    <div class="goal-name">${goalData.goalName}</div>
                    <div class="progress">${goalData.current}/${goalData.target} ${goalData.unit}</div>
                    <div class="category-badge">${emoji} ${goalData.category.charAt(0).toUpperCase() + goalData.category.slice(1)}</div>
                </div>
                
                <div class="motivational-quote">
                    "Success is the sum of small efforts repeated day in and day out."
                    <div style="text-align: right; margin-top: 10px; font-weight: 600;">— Robert Collier</div>
                </div>
                
                <p style="font-size: 16px; color: #4b5563; text-align: center;">
                    Your commitment to wellness is inspiring! Keep up the amazing work and continue building healthy habits.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}/dashboard" class="button">
                        View Your Dashboard →
                    </a>
                </div>
                
                <div class="footer">
                    <p>Keep tracking your wellness journey with Auralis</p>
                    <p style="margin-top: 10px;">
                        <a href="${appUrl}" style="color: #3b82f6; text-decoration: none;">Visit Auralis</a> |
                        <a href="${appUrl}/wellness" style="color: #3b82f6; text-decoration: none;">Wellness Dashboard</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Create overdue goals email template
   */
  private createOverdueGoalsTemplate(user: any, overdueGoals: GoalNotificationData[]) {
    const displayName = user.fullName || user.username || 'there';
    const appUrl = this.configService.get<string>('NEXT_PUBLIC_API_URL') || 'http://localhost:3000';
    
    const categoryEmojis: Record<string, string> = {
      mood: '😊',
      stress: '🧘',
      sleep: '😴',
      social: '👥',
      exercise: '💪',
      meditation: '🧘‍♀️',
      nutrition: '🥗',
      study: '📚',
    };

    const goalsListHtml = overdueGoals.map(goal => {
      const emoji = categoryEmojis[goal.category] || '🎯';
      const percentage = Math.round((goal.current / goal.target) * 100);
      
      return `
        <div class="goal-item">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">
                ${emoji} ${goal.goalName}
              </div>
              <div style="font-size: 14px; color: #6b7280;">
                ${goal.current}/${goal.target} ${goal.unit} (${percentage}% complete)
              </div>
            </div>
            <div class="progress-badge">${percentage}%</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%;"></div>
          </div>
        </div>
      `;
    }).join('');

    const goalsListText = overdueGoals.map(goal => 
      `- ${goal.goalName}: ${goal.current}/${goal.target} ${goal.unit}`
    ).join('\n');

    return {
      subject: `⏰ Wellness Goals Update - ${overdueGoals.length} Goal${overdueGoals.length > 1 ? 's' : ''} Need Attention`,
      text: `Hi ${displayName},\n\nYour weekly wellness goals have ended, and we wanted to check in with you.\n\nGoals that need attention:\n${goalsListText}\n\nDon't worry! Every journey has its ups and downs. What matters is that you keep moving forward.\n\nSet new goals for this week: ${appUrl}/wellness\n\nRemember: Progress, not perfection!\n\n- The Auralis Team`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wellness Goals Update</title>
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
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .icon {
                    font-size: 48px;
                    margin: 20px 0;
                }
                .goal-item {
                    background: #f9fafb;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 15px 0;
                    border-left: 4px solid #f59e0b;
                }
                .progress-bar {
                    background: #e5e7eb;
                    height: 8px;
                    border-radius: 4px;
                    margin-top: 10px;
                    overflow: hidden;
                }
                .progress-fill {
                    background: linear-gradient(90deg, #f59e0b, #d97706);
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                .progress-badge {
                    background: #fef3c7;
                    color: #92400e;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                }
                .encouragement-box {
                    background: linear-gradient(135deg, #eff6ff, #dbeafe);
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    text-align: center;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    padding: 14px 28px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    margin: 20px 0;
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
                    <div class="icon">⏰</div>
                    <h1 style="color: #1f2937; margin: 0;">Hi ${displayName}!</h1>
                    <p style="color: #6b7280; font-size: 18px;">Your weekly wellness goals have ended</p>
                </div>
                
                <p style="font-size: 16px; color: #4b5563;">
                    We wanted to check in with you. Here ${overdueGoals.length === 1 ? 'is a goal that needs' : 'are goals that need'} your attention:
                </p>
                
                ${goalsListHtml}
                
                <div class="encouragement-box">
                    <h3 style="color: #1e40af; margin: 0 0 10px 0;">💙 Remember</h3>
                    <p style="color: #1e3a8a; margin: 0; font-size: 16px;">
                        Every journey has its ups and downs. What matters is that you keep moving forward. 
                        Progress, not perfection!
                    </p>
                </div>
                
                <p style="font-size: 16px; color: #4b5563; text-align: center;">
                    Ready to set new goals for this week? Let's keep building those healthy habits together!
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}/wellness" class="button">
                        Set New Goals →
                    </a>
                </div>
                
                <div class="footer">
                    <p>Keep tracking your wellness journey with Auralis</p>
                    <p style="margin-top: 10px;">
                        <a href="${appUrl}" style="color: #3b82f6; text-decoration: none;">Visit Auralis</a> |
                        <a href="${appUrl}/wellness" style="color: #3b82f6; text-decoration: none;">Wellness Dashboard</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    };
  }
}
