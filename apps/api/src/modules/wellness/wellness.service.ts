import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { CreateStressEntryDto } from './dto/create-stress-entry.dto';
import { StressAnalysisService } from './services/stress-analysis.service';
import { EntryScoringService } from './services/entry-scoring.service';
import { WellnessNotificationService } from './notifications.service';

@Injectable()
export class WellnessService {
  private readonly logger = new Logger(WellnessService.name);

  constructor(
    private prisma: PrismaService,
    private stressAnalysisService: StressAnalysisService,
    private entryScoringService: EntryScoringService,
    private notificationService: WellnessNotificationService
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

    // Calculate quality score
    const scoringResult = this.entryScoringService.calculateMoodScore(createMoodEntryDto);
    
    this.logger.log(`
========================================
MOOD ENTRY QUALITY SCORE
========================================
Score: ${scoringResult.score}/100
Completeness: ${scoringResult.completeness}
Flagged: ${scoringResult.flaggedForReview}
Details: ${scoringResult.details.join(', ')}
Suggestions: ${scoringResult.suggestions.join(', ')}
========================================
    `);

    // Save mood entry with stress analysis data and quality score
    const moodEntry = await this.prisma.moodEntry.create({
      data: {
        userId,
        moodScore: createMoodEntryDto.moodScore,
        tags: createMoodEntryDto.tags || [],
        notes: createMoodEntryDto.notes,
        journalStressScore,
        stressKeywords,
        discrepancyFlag,
        qualityScore: scoringResult.score,
        completeness: scoringResult.completeness,
        flaggedForReview: scoringResult.flaggedForReview,
      },
    });

    // AUTO-CREATE STRESS ENTRY based on mood tags and score
    await this.autoCreateStressEntry(userId, createMoodEntryDto);

    // Update weekly goals for mood tracking and get completed goals
    const { completedGoals } = await this.updateGoalProgress(userId, 'mood', 1);

    return {
      ...moodEntry,
      // Ensure date field is available for frontend compatibility
      date: moodEntry.createdAt,
      analysis: journalStressScore !== null ? {
        stressScore: journalStressScore,
        intensity: journalStressScore >= 0.7 ? 'high' : 
                   journalStressScore >= 0.4 ? 'medium' : 
                   journalStressScore > 0 ? 'low' : 'none',
        detectedKeywords: stressKeywords,
        discrepancyDetected: discrepancyFlag
      } : null,
      qualityScoring: {
        score: scoringResult.score,
        completeness: scoringResult.completeness,
        completenessLabel: this.entryScoringService.getCompletenessLabel(scoringResult.completeness),
        description: this.entryScoringService.getCompletenessDescription(scoringResult.completeness),
        flaggedForReview: scoringResult.flaggedForReview,
        details: scoringResult.details,
        suggestions: scoringResult.suggestions
      },
      completedGoals: completedGoals.length > 0 ? completedGoals : undefined,
    };
  }

  // Helper method to automatically create stress entry from mood data
  private async autoCreateStressEntry(userId: string, moodData: CreateMoodEntryDto) {
    const tags = moodData.tags || [];
    const stressTags = ['Stressed', 'Anxious', 'Worried', 'Overwhelmed', 'Frustrated', 'Angry'];
    
    // Check if any stress-related tags are present
    const hasStressTags = tags.some(tag => 
      stressTags.some(stressTag => tag.toLowerCase().includes(stressTag.toLowerCase()))
    );

    // Calculate stress level based on mood score and tags
    let stressLevel = 0;
    
    if (hasStressTags || moodData.moodScore <= 2) {
      // High stress: low mood (1-2) or stress tags present
      stressLevel = 6 - moodData.moodScore; // Invert: mood 1 = stress 5, mood 2 = stress 4
      
      // If stress tags present, ensure minimum stress level of 3
      if (hasStressTags && stressLevel < 3) {
        stressLevel = 3;
      }
    } else if (moodData.moodScore === 3) {
      // Moderate stress for neutral mood
      stressLevel = 3;
    } else {
      // Low stress for good moods (4-5)
      stressLevel = Math.max(1, 6 - moodData.moodScore);
    }

    // Only create stress entry if stress level is significant (>= 2)
    if (stressLevel >= 2) {
      // Determine triggers from tags
      const triggers = tags.filter(tag => 
        stressTags.some(stressTag => tag.toLowerCase().includes(stressTag.toLowerCase()))
      );

      // Determine symptoms based on mood score and tags
      const symptoms: string[] = [];
      if (moodData.moodScore <= 2) {
        symptoms.push('Low mood', 'Difficulty concentrating');
      }
      if (tags.includes('Tired') || tags.includes('Exhausted')) {
        symptoms.push('Fatigue');
      }
      if (tags.includes('Anxious') || tags.includes('Worried')) {
        symptoms.push('Anxiety', 'Restlessness');
      }
      if (tags.includes('Angry') || tags.includes('Frustrated')) {
        symptoms.push('Irritability');
      }

      await this.prisma.stressEntry.create({
        data: {
          userId,
          stressLevel: Math.min(5, Math.max(1, stressLevel)), // Ensure 1-5 range
          triggers: triggers.length > 0 ? triggers : ['General stress'],
          symptoms: symptoms.length > 0 ? symptoms : ['Emotional distress'],
          copingUsed: [], // User didn't specify coping strategies
          notes: `Auto-generated from mood entry (Score: ${moodData.moodScore}/5)`,
        },
      });

      this.logger.log(`Auto-created stress entry for user ${userId}: Level ${stressLevel}/5`);
    }
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

    // Add date field for frontend compatibility and ensure proper field mapping
    return moodEntries.map(entry => ({
      ...entry,
      date: entry.createdAt,
      mood: entry.moodScore, // Map moodScore to mood for backward compatibility
    }));
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
    // Calculate quality score
    const scoringResult = this.entryScoringService.calculateStressScore(createStressEntryDto);
    
    this.logger.log(`Stress entry created for user ${userId}: Level ${createStressEntryDto.stressLevel}, Quality Score: ${scoringResult.score}/100`);

    const stressEntry = await this.prisma.stressEntry.create({
      data: {
        userId,
        stressLevel: createStressEntryDto.stressLevel,
        triggers: createStressEntryDto.triggers || [],
        symptoms: createStressEntryDto.symptoms || [],
        copingUsed: createStressEntryDto.copingUsed || [],
        notes: createStressEntryDto.notes,
        qualityScore: scoringResult.score,
        completeness: scoringResult.completeness,
        flaggedForReview: scoringResult.flaggedForReview,
      },
    });

    // Update weekly goals for stress tracking and get completed goals
    const { completedGoals } = await this.updateGoalProgress(userId, 'stress', 1);

    return {
      ...stressEntry,
      qualityScoring: {
        score: scoringResult.score,
        completeness: scoringResult.completeness,
        completenessLabel: this.entryScoringService.getCompletenessLabel(scoringResult.completeness),
        description: this.entryScoringService.getCompletenessDescription(scoringResult.completeness),
        flaggedForReview: scoringResult.flaggedForReview,
        details: scoringResult.details,
        suggestions: scoringResult.suggestions
      },
      completedGoals: completedGoals.length > 0 ? completedGoals : undefined,
    };
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

  // Sleep Entry Methods
  async createSleepEntry(userId: string, createSleepEntryDto: any) {
    // Calculate quality score
    const scoringResult = this.entryScoringService.calculateSleepScore(createSleepEntryDto);
    
    this.logger.log(`Sleep entry created for user ${userId}: Quality ${createSleepEntryDto.sleepQuality}/5, Hours: ${createSleepEntryDto.hoursSlept}, Quality Score: ${scoringResult.score}/100`);

    const sleepEntry = await this.prisma.sleepEntry.create({
      data: {
        userId,
        sleepQuality: createSleepEntryDto.sleepQuality,
        hoursSlept: createSleepEntryDto.hoursSlept,
        bedTime: createSleepEntryDto.bedTime,
        wakeTime: createSleepEntryDto.wakeTime,
        sleepIssues: createSleepEntryDto.sleepIssues || [],
        factors: createSleepEntryDto.factors || [],
        notes: createSleepEntryDto.notes,
        qualityScore: scoringResult.score,
        completeness: scoringResult.completeness,
      },
    });

    // Update weekly goals for sleep tracking and get completed goals
    const { completedGoals } = await this.updateGoalProgress(userId, 'sleep', 1);

    return {
      ...sleepEntry,
      qualityScoring: {
        score: scoringResult.score,
        completeness: scoringResult.completeness,
        completenessLabel: this.entryScoringService.getCompletenessLabel(scoringResult.completeness),
        description: this.entryScoringService.getCompletenessDescription(scoringResult.completeness),
        flaggedForReview: scoringResult.flaggedForReview,
        details: scoringResult.details,
        suggestions: scoringResult.suggestions
      },
      completedGoals: completedGoals.length > 0 ? completedGoals : undefined,
    };
  }

  async getUserSleepHistory(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sleepEntries = await this.prisma.sleepEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sleepEntries;
  }

  async getSleepAnalytics(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sleepEntries = await this.prisma.sleepEntry.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (sleepEntries.length === 0) {
      return {
        averageSleepQuality: 0,
        averageHoursSlept: 0,
        trend: null,
        totalEntries: 0,
        commonIssues: [],
        commonFactors: [],
      };
    }

    const avgQuality = sleepEntries.reduce((sum, e) => sum + e.sleepQuality, 0) / sleepEntries.length;
    const avgHours = sleepEntries.reduce((sum, e) => sum + e.hoursSlept, 0) / sleepEntries.length;
    const trend = this.calculateTrend(sleepEntries.map(e => e.sleepQuality));

    // Analyze sleep issues
    const issueCounts = new Map<string, number>();
    sleepEntries.forEach(entry => {
      entry.sleepIssues.forEach(issue => {
        issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1);
      });
    });

    // Analyze factors
    const factorCounts = new Map<string, number>();
    sleepEntries.forEach(entry => {
      entry.factors.forEach(factor => {
        factorCounts.set(factor, (factorCounts.get(factor) || 0) + 1);
      });
    });

    return {
      averageSleepQuality: Math.round(avgQuality * 10) / 10,
      averageHoursSlept: Math.round(avgHours * 10) / 10,
      trend,
      totalEntries: sleepEntries.length,
      commonIssues: Array.from(issueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([issue, count]) => ({ issue, count })),
      commonFactors: Array.from(factorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([factor, count]) => ({ factor, count })),
    };
  }

  // Social Entry Methods
  async createSocialEntry(userId: string, createSocialEntryDto: any) {
    // Calculate quality score
    const scoringResult = this.entryScoringService.calculateSocialScore(createSocialEntryDto);
    
    this.logger.log(`Social entry created for user ${userId}: Quality ${createSocialEntryDto.connectionQuality}/5, Quality Score: ${scoringResult.score}/100`);

    const socialEntry = await this.prisma.socialEntry.create({
      data: {
        userId,
        connectionQuality: createSocialEntryDto.connectionQuality,
        interactions: createSocialEntryDto.interactions || [],
        activities: createSocialEntryDto.activities || [],
        feelings: createSocialEntryDto.feelings || [],
        notes: createSocialEntryDto.notes,
        qualityScore: scoringResult.score,
        completeness: scoringResult.completeness,
        flaggedForReview: scoringResult.flaggedForReview,
      },
    });

    // Update weekly goals for social connection tracking and get completed goals
    const { completedGoals } = await this.updateGoalProgress(userId, 'social', 1);

    return {
      ...socialEntry,
      qualityScoring: {
        score: scoringResult.score,
        completeness: scoringResult.completeness,
        completenessLabel: this.entryScoringService.getCompletenessLabel(scoringResult.completeness),
        description: this.entryScoringService.getCompletenessDescription(scoringResult.completeness),
        flaggedForReview: scoringResult.flaggedForReview,
        details: scoringResult.details,
        suggestions: scoringResult.suggestions
      },
      completedGoals: completedGoals.length > 0 ? completedGoals : undefined,
    };
  }

  async getUserSocialHistory(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const socialEntries = await this.prisma.socialEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return socialEntries;
  }

  async getSocialAnalytics(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const socialEntries = await this.prisma.socialEntry.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (socialEntries.length === 0) {
      return {
        averageConnectionQuality: 0,
        trend: null,
        totalEntries: 0,
        commonInteractions: [],
        commonActivities: [],
        commonFeelings: [],
      };
    }

    const avgQuality = socialEntries.reduce((sum, e) => sum + e.connectionQuality, 0) / socialEntries.length;
    const trend = this.calculateTrend(socialEntries.map(e => e.connectionQuality));

    // Analyze interactions
    const interactionCounts = new Map<string, number>();
    socialEntries.forEach(entry => {
      entry.interactions.forEach(interaction => {
        interactionCounts.set(interaction, (interactionCounts.get(interaction) || 0) + 1);
      });
    });

    // Analyze activities
    const activityCounts = new Map<string, number>();
    socialEntries.forEach(entry => {
      entry.activities.forEach(activity => {
        activityCounts.set(activity, (activityCounts.get(activity) || 0) + 1);
      });
    });

    // Analyze feelings
    const feelingCounts = new Map<string, number>();
    socialEntries.forEach(entry => {
      entry.feelings.forEach(feeling => {
        feelingCounts.set(feeling, (feelingCounts.get(feeling) || 0) + 1);
      });
    });

    return {
      averageConnectionQuality: Math.round(avgQuality * 10) / 10,
      trend,
      totalEntries: socialEntries.length,
      commonInteractions: Array.from(interactionCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([interaction, count]) => ({ interaction, count })),
      commonActivities: Array.from(activityCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([activity, count]) => ({ activity, count })),
      commonFeelings: Array.from(feelingCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feeling, count]) => ({ feeling, count })),
    };
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

  // Weekly Goals Methods
  async setWeeklyGoals(userId: string, goals: any[]) {
    // Calculate week boundaries
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Delete existing goals for this week (backward compatible)
    await this.prisma.weeklyGoal.deleteMany({
      where: {
        userId,
        weekStart: startOfWeek,
      },
    });

    // Create new goals (backward compatible - only include fields that exist)
    const createdGoals = await Promise.all(
      goals.map(async (goal) => {
        try {
          // Try with new fields first
          return await this.prisma.weeklyGoal.create({
            data: {
              userId,
              weekStart: startOfWeek,
              weekEnd: endOfWeek,
              name: goal.name,
              target: goal.target,
              current: goal.current || 0,
              category: goal.category,
              unit: goal.unit,
              isCompleted: false,
              isOverdue: false,
            } as any,
          });
        } catch (error) {
          // Fallback to old schema (without new fields)
          return await this.prisma.weeklyGoal.create({
            data: {
              userId,
              weekStart: startOfWeek,
              name: goal.name,
              target: goal.target,
              current: goal.current || 0,
              category: goal.category,
              unit: goal.unit,
            } as any,
          });
        }
      })
    );

    this.logger.log(`Set ${createdGoals.length} weekly goals for user ${userId}`);
    return { success: true, goals: createdGoals };
  }

  async getWeeklyGoals(userId: string) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Mark overdue goals before fetching (only if new schema exists)
    try {
      await this.markOverdueGoals(userId);
    } catch (error) {
      // Ignore if new fields don't exist yet
    }

    // Fetch goals for current week (backward compatible)
    try {
      // Try with new schema first (only incomplete goals)
      const goals = await this.prisma.weeklyGoal.findMany({
        where: {
          userId,
          weekStart: startOfWeek,
          isCompleted: false,
        } as any,
        orderBy: { createdAt: 'asc' },
      });
      return goals;
    } catch (error) {
      // Fallback to old schema (all goals for the week)
      const goals = await this.prisma.weeklyGoal.findMany({
        where: {
          userId,
          weekStart: startOfWeek,
        },
        orderBy: { createdAt: 'asc' },
      });
      return goals;
    }
  }

  // Helper method to update goal progress automatically
  private async updateGoalProgress(userId: string, category: string, incrementBy: number = 1): Promise<{ completedGoals: any[] }> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const completedGoals: any[] = [];

    try {
      this.logger.log(`Attempting to update goal progress: userId=${userId}, category=${category}, increment=${incrementBy}, weekStart=${startOfWeek.toISOString()}`);

      // Find goals matching this category (backward compatible)
      let goals;
      try {
        // Try with new schema (only incomplete goals)
        goals = await this.prisma.weeklyGoal.findMany({
          where: {
            userId,
            weekStart: startOfWeek,
            category,
            isCompleted: false,
          } as any,
        });
      } catch (error) {
        // Fallback to old schema (all goals)
        goals = await this.prisma.weeklyGoal.findMany({
          where: {
            userId,
            weekStart: startOfWeek,
            category,
          },
        });
      }

      if (goals.length === 0) {
        this.logger.warn(`No weekly goals found for user ${userId} with category "${category}" for week starting ${startOfWeek.toISOString()}`);
        return { completedGoals };
      }

      this.logger.log(`Found ${goals.length} goal(s) to update for category "${category}"`);

      // Update each matching goal
      for (const goal of goals) {
        this.logger.log(`Processing goal: "${goal.name}" - Current: ${goal.current}/${goal.target}`);
        
        const oldCurrent = goal.current;
        const newCurrent = Math.min(goal.current + incrementBy, goal.target);
        const isNowCompleted = newCurrent >= goal.target;
        
        this.logger.log(`After increment: ${newCurrent}/${goal.target}, Will be completed: ${isNowCompleted}`);
        
        try {
          // Try with new schema (with completion tracking)
          this.logger.log(`Updating goal with new schema: isCompleted=${isNowCompleted}, current=${newCurrent}`);
          
          await this.prisma.weeklyGoal.update({
            where: { id: goal.id },
            data: { 
              current: newCurrent,
              isCompleted: isNowCompleted,
              completedAt: isNowCompleted ? new Date() : null,
            } as any,
          });

          this.logger.log(`Goal updated successfully. Checking if completed: ${isNowCompleted}`);

          if (isNowCompleted) {
            this.logger.log(`Goal COMPLETED and will be auto-removed: "${goal.name}" for user ${userId}: ${newCurrent}/${goal.target}`);
            
            // Add to completed goals list for celebration
            completedGoals.push({
              id: goal.id,
              name: goal.name,
              category: goal.category,
              target: goal.target,
              unit: goal.unit,
              completedAt: new Date(),
            });
            
            // Send completion notification email
            await this.notificationService.sendGoalCompletionEmail(userId, {
              goalName: goal.name,
              category: goal.category,
              current: newCurrent,
              target: goal.target,
              unit: goal.unit,
              completedAt: new Date(),
              weekStart: goal.weekStart,
              weekEnd: goal.weekEnd,
            });
            
            // Auto-remove completed goal
            await this.prisma.weeklyGoal.delete({
              where: { id: goal.id },
            });
            
            this.logger.log(`Auto-removed completed goal "${goal.name}" for user ${userId}`);
          } else {
            this.logger.log(`Updated goal "${goal.name}" for user ${userId}: ${oldCurrent}/${goal.target} -> ${newCurrent}/${goal.target} (category: ${category})`);
          }
        } catch (error) {
          // Fallback to old schema (just update current)
          this.logger.error(`Failed to update with new schema, falling back to old schema. Error: ${error.message}`);
          
          await this.prisma.weeklyGoal.update({
            where: { id: goal.id },
            data: { 
              current: newCurrent,
            },
          });
          
          this.logger.log(`Updated goal "${goal.name}" for user ${userId}: ${oldCurrent}/${goal.target} -> ${newCurrent}/${goal.target} (category: ${category}) [OLD SCHEMA - NO AUTO-REMOVE]`);
        }
      }
    } catch (error) {
      this.logger.error(`Error updating goal progress for user ${userId}, category ${category}:`, error);
      // Don't throw - we don't want goal update failures to prevent entry creation
    }

    return { completedGoals };
  }

  // Public method for manual goal tracking by category
  async trackGoalManually(userId: string, category: string, amount: number = 1) {
    await this.updateGoalProgress(userId, category, amount);
    
    // Return updated goals
    return this.getWeeklyGoals(userId);
  }

  // Helper method to mark overdue goals (only works with new schema)
  private async markOverdueGoals(userId: string) {
    const now = new Date();

    try {
      // Find goals that are past their weekEnd and not completed
      const overdueGoals = await this.prisma.weeklyGoal.findMany({
        where: {
          userId,
          weekEnd: { lt: now },
          isCompleted: false,
          isOverdue: false,
        } as any,
      });

      if (overdueGoals.length > 0) {
        // Mark them as overdue
        await this.prisma.weeklyGoal.updateMany({
          where: {
            userId,
            weekEnd: { lt: now },
            isCompleted: false,
            isOverdue: false,
          } as any,
          data: {
            isOverdue: true,
          } as any,
        });

        this.logger.log(`Marked ${overdueGoals.length} goal(s) as overdue for user ${userId}`);
      }
    } catch (error) {
      // Silently fail if new fields don't exist yet
      // This is expected before running the schema update
    }
  }

  // Get goal history (completed and overdue goals) - only works with new schema
  async getGoalHistory(userId: string, weeks: number = 4) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7));

      const history = await this.prisma.weeklyGoal.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
          OR: [
            { isCompleted: true },
            { isOverdue: true },
          ],
        } as any,
        orderBy: { weekStart: 'desc' },
      });

      return history;
    } catch (error) {
      // Return empty array if new fields don't exist yet
      this.logger.warn('Goal history feature requires schema update. Run quick-update script.');
      return [];
    }
  }

  // Get overdue goals - only works with new schema
  async getOverdueGoals(userId: string) {
    try {
      await this.markOverdueGoals(userId);

      const overdueGoals = await this.prisma.weeklyGoal.findMany({
        where: {
          userId,
          isOverdue: true,
          isCompleted: false,
        } as any,
        orderBy: { weekEnd: 'asc' } as any,
      });

      return overdueGoals;
    } catch (error) {
      // Return empty array if new fields don't exist yet
      this.logger.warn('Overdue goals feature requires schema update. Run quick-update script.');
      return [];
    }
  }

  // Public method for incrementing a specific goal by name
  async incrementGoalByName(userId: string, goalName: string, amount: number = 1) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    try {
      // Find the specific goal by name
      const goal = await this.prisma.weeklyGoal.findFirst({
        where: {
          userId,
          weekStart: startOfWeek,
          name: goalName,
        },
      });

      if (goal) {
        const newCurrent = Math.min(goal.current + amount, goal.target);
        const isCompleted = newCurrent >= goal.target;
        
        // Update goal with completion status
        const updateData: any = { 
          current: newCurrent,
          updatedAt: new Date()
        };
        
        if (isCompleted) {
          updateData.isCompleted = true;
          updateData.completedAt = new Date();
        }
        
        await this.prisma.weeklyGoal.update({
          where: { id: goal.id },
          data: updateData,
        });

        this.logger.log(`Incremented goal "${goalName}" for user ${userId}: ${newCurrent}/${goal.target}${isCompleted ? ' (COMPLETED)' : ''}`);
        
        // Auto-remove if completed
        if (isCompleted) {
          this.logger.log(`Goal COMPLETED and will be auto-removed: "${goalName}" for user ${userId}: ${newCurrent}/${goal.target}`);
          
          // Send completion notification email
          await this.notificationService.sendGoalCompletionEmail(userId, {
            goalName: goal.name,
            category: goal.category,
            current: newCurrent,
            target: goal.target,
            unit: goal.unit,
            completedAt: new Date(),
            weekStart: goal.weekStart,
            weekEnd: goal.weekEnd,
          });
          
          await this.prisma.weeklyGoal.delete({
            where: { id: goal.id },
          });
          this.logger.log(`Auto-removed completed goal "${goalName}" for user ${userId}`);
        }
      } else {
        this.logger.warn(`Goal "${goalName}" not found for user ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error incrementing goal "${goalName}" for user ${userId}:`, error);
    }

    // Return updated goals
    return this.getWeeklyGoals(userId);
  }

  /**
   * Check and notify users about overdue goals
   * This should be called by a cron job daily
   */
  async checkAndNotifyOverdueGoals() {
    return this.notificationService.checkAndNotifyOverdueGoals();
  }
}