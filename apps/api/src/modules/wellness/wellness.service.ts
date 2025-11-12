import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { CreateStressEntryDto } from './dto/create-stress-entry.dto';
import { StressAnalysisService } from './services/stress-analysis.service';

@Injectable()
export class WellnessService {
  private readonly logger = new Logger(WellnessService.name);

  constructor(
    private prisma: PrismaService,
    private stressAnalysisService: StressAnalysisService
  ) {}

  async createMoodEntry(userId: string, createMoodEntryDto: CreateMoodEntryDto) {
    // Analyze journal text for stress indicators if notes are provided
    let journalStressScore: number | null = null;
    let stressKeywords: string[] = [];
    let discrepancyFlag = false;

    if (createMoodEntryDto.notes && createMoodEntryDto.notes.trim().length > 0) {
      // Perform stress analysis on journal text
      const analysis = this.stressAnalysisService.analyzeJournalEntryForKeywords(
        createMoodEntryDto.notes
      );

      journalStressScore = analysis.stressScore;
      stressKeywords = analysis.detectedKeywords;

      // Detect discrepancy between self-report and journal analysis
      const discrepancy = this.stressAnalysisService.detectDiscrepancy(
        createMoodEntryDto.moodScore,
        analysis.stressScore
      );

      discrepancyFlag = discrepancy.hasDiscrepancy && 
        (discrepancy.severity === 'moderate' || discrepancy.severity === 'significant');

      // Log analysis for monitoring (simulated ML workflow)
      this.logger.log(`
========================================
MOOD ENTRY ANALYSIS
========================================
User ID: ${userId}
Self-Reported Mood: ${createMoodEntryDto.moodScore}/5
Journal Stress Score: ${journalStressScore.toFixed(2)}
Stress Intensity: ${analysis.intensity}
Detected Keywords: ${stressKeywords.join(', ')}
Discrepancy Detected: ${discrepancyFlag}
Discrepancy Severity: ${discrepancy.severity}
Analysis: ${analysis.analysis}
Explanation: ${discrepancy.explanation}
Recommendations: ${this.stressAnalysisService.generateRecommendations(
  journalStressScore,
  analysis.intensity,
  discrepancyFlag
).join(' | ')}
========================================
      `);

      // In a production system, this would trigger:
      // 1. ML model correlation analysis
      // 2. Alert system for high-risk cases
      // 3. Personalized intervention recommendations
      // 4. Longitudinal pattern tracking
    }

    // Save mood entry with stress analysis data
    const moodEntry = await this.prisma.moodEntry.create({
      data: {
        userId,
        moodScore: createMoodEntryDto.moodScore,
        tags: createMoodEntryDto.tags || [],
        notes: createMoodEntryDto.notes,
        journalStressScore,
        stressKeywords,
        discrepancyFlag,
      },
    });

    return {
      ...moodEntry,
      analysis: journalStressScore !== null ? {
        stressScore: journalStressScore,
        intensity: journalStressScore >= 0.7 ? 'high' : 
                   journalStressScore >= 0.4 ? 'medium' : 
                   journalStressScore > 0 ? 'low' : 'none',
        detectedKeywords: stressKeywords,
        discrepancyDetected: discrepancyFlag
      } : null
    };
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

  // Stress Entry Methods
  async createStressEntry(userId: string, createStressEntryDto: CreateStressEntryDto) {
    const stressEntry = await this.prisma.stressEntry.create({
      data: {
        userId,
        stressLevel: createStressEntryDto.stressLevel,
        triggers: createStressEntryDto.triggers || [],
        symptoms: createStressEntryDto.symptoms || [],
        copingUsed: createStressEntryDto.copingUsed || [],
        notes: createStressEntryDto.notes,
      },
    });

    this.logger.log(`Stress entry created for user ${userId}: Level ${createStressEntryDto.stressLevel}`);

    return stressEntry;
  }

  async getUserStressHistory(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stressEntries = await this.prisma.stressEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return stressEntries;
  }

  async getStressAnalytics(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stressEntries = await this.prisma.stressEntry.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (stressEntries.length === 0) {
      return {
        averageStressLevel: 0,
        trend: null,
        totalEntries: 0,
        commonTriggers: [],
        commonSymptoms: [],
        effectiveCoping: [],
        highStressDays: 0,
      };
    }

    const avgStress = stressEntries.reduce((sum, e) => sum + e.stressLevel, 0) / stressEntries.length;
    const trend = this.calculateTrend(stressEntries.map(e => e.stressLevel));
    const highStressDays = stressEntries.filter(e => e.stressLevel >= 4).length;

    // Analyze triggers
    const triggerCounts = new Map<string, number>();
    stressEntries.forEach(entry => {
      entry.triggers.forEach(trigger => {
        triggerCounts.set(trigger, (triggerCounts.get(trigger) || 0) + 1);
      });
    });

    // Analyze symptoms
    const symptomCounts = new Map<string, number>();
    stressEntries.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1);
      });
    });

    // Analyze coping strategies
    const copingCounts = new Map<string, number>();
    stressEntries.forEach(entry => {
      entry.copingUsed.forEach(coping => {
        copingCounts.set(coping, (copingCounts.get(coping) || 0) + 1);
      });
    });

    return {
      averageStressLevel: Math.round(avgStress * 10) / 10,
      trend,
      totalEntries: stressEntries.length,
      commonTriggers: Array.from(triggerCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([trigger, count]) => ({ trigger, count })),
      commonSymptoms: Array.from(symptomCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symptom, count]) => ({ symptom, count })),
      effectiveCoping: Array.from(copingCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([coping, count]) => ({ coping, count })),
      highStressDays,
    };
  }
}