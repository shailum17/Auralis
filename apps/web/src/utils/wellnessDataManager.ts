/**
 * Wellness Data Management Utilities
 * 
 * This module provides utilities for managing wellness data synchronization,
 * validation, and transformation between frontend and backend formats.
 */

export interface WellnessDataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100 quality score
}

export interface WellnessDataTransform {
  fromAPI: (apiData: any) => any;
  toAPI: (frontendData: any) => any;
}

export class WellnessDataManager {
  private static instance: WellnessDataManager;
  
  public static getInstance(): WellnessDataManager {
    if (!WellnessDataManager.instance) {
      WellnessDataManager.instance = new WellnessDataManager();
    }
    return WellnessDataManager.instance;
  }

  /**
   * Validate mood entry data
   */
  validateMoodEntry(entry: any): WellnessDataValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required fields validation
    if (!entry.moodScore && !entry.mood) {
      errors.push('Mood score is required');
      score -= 30;
    } else {
      const moodValue = entry.moodScore || entry.mood;
      if (moodValue < 1 || moodValue > 5) {
        errors.push('Mood score must be between 1 and 5');
        score -= 20;
      }
    }

    // Optional fields validation
    if (entry.energy !== undefined) {
      if (entry.energy < 1 || entry.energy > 5) {
        warnings.push('Energy level should be between 1 and 5');
        score -= 10;
      }
    } else {
      warnings.push('Energy level not provided - consider adding for better insights');
      score -= 5;
    }

    if (entry.stress !== undefined) {
      if (entry.stress < 1 || entry.stress > 5) {
        warnings.push('Stress level should be between 1 and 5');
        score -= 10;
      }
    } else {
      warnings.push('Stress level not provided - consider adding for better insights');
      score -= 5;
    }

    // Notes validation
    if (entry.notes) {
      if (entry.notes.length > 1000) {
        warnings.push('Notes are quite long - consider keeping them concise');
        score -= 5;
      }
      if (entry.notes.length < 10) {
        warnings.push('Consider adding more detailed notes for better tracking');
        score -= 3;
      }
    } else {
      warnings.push('No notes provided - adding context can improve insights');
      score -= 5;
    }

    // Tags validation
    if (entry.tags && Array.isArray(entry.tags)) {
      if (entry.tags.length > 10) {
        warnings.push('Too many tags - consider using fewer, more specific tags');
        score -= 5;
      }
      
      // Check for duplicate tags
      const uniqueTags = new Set(entry.tags);
      if (uniqueTags.size !== entry.tags.length) {
        warnings.push('Duplicate tags detected');
        score -= 3;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Validate wellness goal data
   */
  validateWellnessGoal(goal: any): WellnessDataValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required fields
    if (!goal.name || goal.name.trim().length === 0) {
      errors.push('Goal name is required');
      score -= 25;
    } else if (goal.name.length > 100) {
      warnings.push('Goal name is quite long');
      score -= 5;
    }

    if (goal.target === undefined || goal.target === null) {
      errors.push('Goal target is required');
      score -= 25;
    } else if (goal.target <= 0) {
      errors.push('Goal target must be positive');
      score -= 20;
    } else if (goal.target > 1000) {
      warnings.push('Goal target seems very high - make sure it\'s achievable');
      score -= 10;
    }

    if (goal.current === undefined || goal.current === null) {
      errors.push('Current progress is required');
      score -= 15;
    } else if (goal.current < 0) {
      errors.push('Current progress cannot be negative');
      score -= 15;
    }

    if (!goal.unit || goal.unit.trim().length === 0) {
      warnings.push('Goal unit not specified');
      score -= 10;
    }

    if (!goal.category) {
      warnings.push('Goal category not specified');
      score -= 10;
    } else {
      const validCategories = ['mood', 'sleep', 'exercise', 'meditation', 'other'];
      if (!validCategories.includes(goal.category)) {
        warnings.push('Invalid goal category');
        score -= 5;
      }
    }

    // Progress validation
    if (goal.current > goal.target) {
      warnings.push('Current progress exceeds target - goal may be completed');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Transform API mood entry to frontend format
   */
  transformMoodEntryFromAPI(apiEntry: any): any {
    return {
      id: apiEntry.id,
      date: apiEntry.createdAt || apiEntry.date,
      createdAt: apiEntry.createdAt,
      moodScore: apiEntry.moodScore,
      mood: apiEntry.moodScore || apiEntry.mood, // Backward compatibility
      energy: apiEntry.energy,
      stress: apiEntry.stress,
      notes: apiEntry.notes,
      tags: Array.isArray(apiEntry.tags) ? apiEntry.tags : 
            typeof apiEntry.tags === 'string' ? JSON.parse(apiEntry.tags || '[]') : [],
      // Additional metadata
      qualityScore: apiEntry.qualityScore,
      completeness: apiEntry.completeness,
      flaggedForReview: apiEntry.flaggedForReview
    };
  }

  /**
   * Transform frontend mood entry to API format
   */
  transformMoodEntryToAPI(frontendEntry: any): any {
    return {
      moodScore: frontendEntry.moodScore || frontendEntry.mood,
      energy: frontendEntry.energy,
      stress: frontendEntry.stress,
      notes: frontendEntry.notes,
      tags: Array.isArray(frontendEntry.tags) ? frontendEntry.tags : []
    };
  }

  /**
   * Transform API wellness goal to frontend format
   */
  transformWellnessGoalFromAPI(apiGoal: any): any {
    return {
      id: apiGoal.id,
      name: apiGoal.name,
      current: apiGoal.current || 0,
      target: apiGoal.target,
      unit: apiGoal.unit || 'items',
      category: apiGoal.category || 'other',
      // Additional metadata
      isCompleted: apiGoal.isCompleted,
      isOverdue: apiGoal.isOverdue,
      weekStart: apiGoal.weekStart,
      weekEnd: apiGoal.weekEnd,
      completedAt: apiGoal.completedAt,
      createdAt: apiGoal.createdAt,
      updatedAt: apiGoal.updatedAt
    };
  }

  /**
   * Transform frontend wellness goal to API format
   */
  transformWellnessGoalToAPI(frontendGoal: any): any {
    return {
      name: frontendGoal.name,
      target: frontendGoal.target,
      current: frontendGoal.current || 0,
      category: frontendGoal.category || 'other',
      unit: frontendGoal.unit || 'items'
    };
  }

  /**
   * Calculate wellness trends from mood entries
   */
  calculateWellnessTrends(moodEntries: any[]): any {
    if (!moodEntries || moodEntries.length < 3) {
      return {
        trend: null,
        confidence: 0,
        recommendation: 'Need more data to calculate trends'
      };
    }

    // Sort entries by date
    const sortedEntries = moodEntries
      .filter(entry => entry.createdAt || entry.date)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateA.getTime() - dateB.getTime();
      });

    if (sortedEntries.length < 3) {
      return {
        trend: null,
        confidence: 0,
        recommendation: 'Need more valid entries to calculate trends'
      };
    }

    // Calculate trend using linear regression
    const n = sortedEntries.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    sortedEntries.forEach((entry, index) => {
      const x = index;
      const y = entry.moodScore || entry.mood || 0;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate correlation coefficient for confidence
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    let numerator = 0, denomX = 0, denomY = 0;
    sortedEntries.forEach((entry, index) => {
      const x = index;
      const y = entry.moodScore || entry.mood || 0;
      numerator += (x - meanX) * (y - meanY);
      denomX += (x - meanX) ** 2;
      denomY += (y - meanY) ** 2;
    });

    const correlation = numerator / Math.sqrt(denomX * denomY);
    const confidence = Math.abs(correlation) * 100;

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining';
    let recommendation: string;

    if (Math.abs(slope) < 0.1) {
      trend = 'stable';
      recommendation = 'Your mood has been relatively stable. Consider setting new wellness goals to continue growing.';
    } else if (slope > 0) {
      trend = 'improving';
      recommendation = 'Great job! Your mood is trending upward. Keep up the positive habits that are working for you.';
    } else {
      trend = 'declining';
      recommendation = 'Your mood has been declining recently. Consider reaching out for support or trying new wellness strategies.';
    }

    return {
      trend,
      slope,
      confidence: Math.round(confidence),
      recommendation,
      dataPoints: n,
      timeSpan: this.calculateTimeSpan(sortedEntries)
    };
  }

  /**
   * Calculate time span of entries
   */
  private calculateTimeSpan(entries: any[]): string {
    if (entries.length < 2) return 'Single entry';

    const firstDate = new Date(entries[0].createdAt || entries[0].date);
    const lastDate = new Date(entries[entries.length - 1].createdAt || entries[entries.length - 1].date);
    const diffDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Same day';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.round(diffDays / 7)} weeks`;
    return `${Math.round(diffDays / 30)} months`;
  }

  /**
   * Generate wellness insights from data
   */
  generateWellnessInsights(data: {
    moodEntries: any[];
    wellnessGoals: any[];
    wellnessStats: any;
  }): any {
    const insights = {
      summary: '',
      recommendations: [] as string[],
      achievements: [] as string[],
      concerns: [] as string[],
      dataQuality: 0
    };

    const { moodEntries, wellnessGoals, wellnessStats } = data;

    // Data quality assessment
    let qualityScore = 0;
    if (moodEntries.length > 0) qualityScore += 30;
    if (moodEntries.length >= 7) qualityScore += 20;
    if (wellnessGoals.length > 0) qualityScore += 25;
    if (wellnessStats) qualityScore += 25;

    insights.dataQuality = qualityScore;

    // Generate summary
    if (moodEntries.length === 0) {
      insights.summary = 'Start your wellness journey by logging your first mood entry.';
      insights.recommendations.push('Begin tracking your daily mood to establish baseline data');
      insights.recommendations.push('Set 1-2 simple wellness goals to work towards');
    } else {
      const avgMood = moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length;
      const trends = this.calculateWellnessTrends(moodEntries);
      
      insights.summary = `Based on ${moodEntries.length} mood entries, your average mood is ${avgMood.toFixed(1)}/5. ${trends.recommendation}`;
      
      // Achievements
      if (moodEntries.length >= 7) {
        insights.achievements.push('Consistent tracking - 7+ mood entries logged');
      }
      if (avgMood >= 4) {
        insights.achievements.push('Maintaining positive mood levels');
      }
      if (trends.trend === 'improving') {
        insights.achievements.push('Positive mood trend detected');
      }

      // Concerns
      if (avgMood < 2.5) {
        insights.concerns.push('Low average mood - consider seeking support');
      }
      if (trends.trend === 'declining') {
        insights.concerns.push('Declining mood trend - may need intervention');
      }

      // Recommendations
      if (moodEntries.length < 14) {
        insights.recommendations.push('Continue daily tracking for better trend analysis');
      }
      if (wellnessGoals.length === 0) {
        insights.recommendations.push('Set wellness goals to work towards specific improvements');
      }
      
      const recentEntries = moodEntries.slice(0, 7);
      const hasEnergyData = recentEntries.some(e => e.energy !== undefined);
      const hasStressData = recentEntries.some(e => e.stress !== undefined);
      
      if (!hasEnergyData) {
        insights.recommendations.push('Track energy levels for more comprehensive insights');
      }
      if (!hasStressData) {
        insights.recommendations.push('Track stress levels to identify patterns and triggers');
      }
    }

    return insights;
  }

  /**
   * Sanitize and validate data before storage
   */
  sanitizeData(data: any, type: 'moodEntry' | 'wellnessGoal'): any {
    if (type === 'moodEntry') {
      return {
        moodScore: Math.max(1, Math.min(5, Number(data.moodScore || data.mood || 1))),
        energy: data.energy ? Math.max(1, Math.min(5, Number(data.energy))) : undefined,
        stress: data.stress ? Math.max(1, Math.min(5, Number(data.stress))) : undefined,
        notes: typeof data.notes === 'string' ? data.notes.substring(0, 1000) : undefined,
        tags: Array.isArray(data.tags) ? data.tags.slice(0, 10).map(tag => String(tag).substring(0, 50)) : []
      };
    }

    if (type === 'wellnessGoal') {
      return {
        name: String(data.name || '').substring(0, 100),
        target: Math.max(1, Number(data.target || 1)),
        current: Math.max(0, Number(data.current || 0)),
        unit: String(data.unit || 'items').substring(0, 20),
        category: ['mood', 'sleep', 'exercise', 'meditation', 'other'].includes(data.category) 
          ? data.category : 'other'
      };
    }

    return data;
  }
}

// Export singleton instance
export const wellnessDataManager = WellnessDataManager.getInstance();

// Export utility functions
export const validateMoodEntry = (entry: any) => wellnessDataManager.validateMoodEntry(entry);
export const validateWellnessGoal = (goal: any) => wellnessDataManager.validateWellnessGoal(goal);
export const calculateWellnessTrends = (entries: any[]) => wellnessDataManager.calculateWellnessTrends(entries);
export const generateWellnessInsights = (data: any) => wellnessDataManager.generateWellnessInsights(data);
export const sanitizeWellnessData = (data: any, type: 'moodEntry' | 'wellnessGoal') => 
  wellnessDataManager.sanitizeData(data, type);