import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';

@Injectable()
export class WellnessService {
  constructor(private prisma: PrismaService) {}

  async createMoodEntry(userId: string, createMoodEntryDto: CreateMoodEntryDto) {
    const moodEntry = await this.prisma.moodEntry.create({
      data: {
        userId,
        moodScore: createMoodEntryDto.moodScore,
        tags: JSON.stringify(createMoodEntryDto.tags || []),
        notes: createMoodEntryDto.notes,
      },
    });

    return moodEntry;
  }

  async getUserMoodHistory(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moodEntries = await this.prisma.moodEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return moodEntries;
  }

  async getWellnessBanners(userId: string) {
    // Get user's recent stress scores and mood entries
    const [recentStressScores, recentMoodEntries] = await Promise.all([
      this.prisma.stressScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 7,
      }),
      this.prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 7,
      }),
    ]);

    const banners = [];

    // Analyze stress patterns
    if (recentStressScores.length > 0) {
      const avgStress = recentStressScores.reduce((sum, score) => sum + score.score, 0) / recentStressScores.length;
      
      if (avgStress > 0.7) {
        banners.push({
          id: 'high-stress',
          type: 'support',
          title: 'We notice you might be feeling stressed',
          message: 'Remember, it\'s okay to take breaks. Consider trying some relaxation techniques or reaching out to someone you trust.',
          actionText: 'View Resources',
          actionUrl: '/resources?category=mental-health',
          priority: 'high',
        });
      } else if (avgStress > 0.5) {
        banners.push({
          id: 'moderate-stress',
          type: 'tip',
          title: 'Taking care of yourself',
          message: 'You\'re doing great! Remember to maintain healthy habits like regular sleep and exercise.',
          actionText: 'Mood Check-in',
          actionUrl: '/wellness/mood',
          priority: 'medium',
        });
      }
    }

    // Analyze mood patterns
    if (recentMoodEntries.length > 0) {
      const avgMood = recentMoodEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / recentMoodEntries.length;
      
      if (avgMood < 3) {
        banners.push({
          id: 'low-mood',
          type: 'support',
          title: 'You\'re not alone',
          message: 'It looks like you\'ve been having a tough time. Consider connecting with friends or exploring our support resources.',
          actionText: 'Find Support',
          actionUrl: '/resources?category=crisis-support',
          priority: 'high',
        });
      }
    }

    // Positive reinforcement for regular mood tracking
    if (recentMoodEntries.length >= 5) {
      banners.push({
        id: 'mood-tracking-positive',
        type: 'celebration',
        title: 'Great job tracking your mood!',
        message: 'You\'ve been consistently checking in with yourself. That\'s a wonderful self-care habit.',
        actionText: 'View Progress',
        actionUrl: '/wellness/mood/history',
        priority: 'low',
      });
    }

    // Sort by priority and return top 3
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return banners
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 3);
  }

  async getWellnessInsights(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [moodEntries, stressScores, posts] = await Promise.all([
      this.prisma.moodEntry.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.stressScore.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.post.count({
        where: {
          authorId: userId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    const insights = {
      moodTrend: this.calculateTrend(moodEntries.map(e => e.moodScore)),
      stressTrend: this.calculateTrend(stressScores.map(s => s.score)),
      averageMood: moodEntries.length > 0 
        ? moodEntries.reduce((sum, e) => sum + e.moodScore, 0) / moodEntries.length 
        : null,
      averageStress: stressScores.length > 0 
        ? stressScores.reduce((sum, s) => sum + s.score, 0) / stressScores.length 
        : null,
      postsThisMonth: posts,
      moodEntriesCount: moodEntries.length,
      mostCommonMoodTags: this.getMostCommonTags(moodEntries),
    };

    return insights;
  }

  private calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' | null {
    if (values.length < 2) return null;

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    const threshold = 0.1; // 10% change threshold

    if (Math.abs(difference) < threshold) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  private getMostCommonTags(moodEntries: any[]): string[] {
    const tagCounts = new Map<string, number>();

    moodEntries.forEach(entry => {
      try {
        const tags = entry.tags ? JSON.parse(entry.tags) : [];
        tags?.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      } catch {
        // Skip invalid JSON
      }
    });

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }
}