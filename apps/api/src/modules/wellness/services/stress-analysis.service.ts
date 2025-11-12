import { Injectable } from '@nestjs/common';

/**
 * Stress Analysis Service
 * Analyzes journal text for stress indicators using keyword detection
 * This simulates ML-based stress detection using linguistic parameters
 */
@Injectable()
export class StressAnalysisService {
  // Hard-coded keyword list for stress detection (linguistic parameters)
  private readonly stressKeywords = {
    // High intensity stress indicators (weight: 3)
    high: [
      'overwhelmed', 'panic', 'crisis', 'desperate', 'hopeless', 'suicidal',
      'can\'t cope', 'breaking down', 'falling apart', 'giving up', 'unbearable',
      'terrified', 'devastated', 'traumatic', 'nightmare', 'disaster'
    ],
    
    // Medium intensity stress indicators (weight: 2)
    medium: [
      'anxious', 'worried', 'stressed', 'nervous', 'tense', 'pressure',
      'struggling', 'difficult', 'exhausted', 'drained', 'frustrated',
      'angry', 'upset', 'sad', 'depressed', 'lonely', 'isolated',
      'afraid', 'scared', 'concerned', 'troubled', 'burdened'
    ],
    
    // Low intensity stress indicators (weight: 1)
    low: [
      'tired', 'busy', 'hectic', 'challenging', 'uncomfortable', 'uneasy',
      'restless', 'distracted', 'confused', 'uncertain', 'doubtful',
      'bothered', 'annoyed', 'irritated', 'disappointed', 'discouraged'
    ],
    
    // Positive indicators (negative weight: -1)
    positive: [
      'happy', 'joyful', 'excited', 'grateful', 'peaceful', 'calm',
      'relaxed', 'confident', 'hopeful', 'optimistic', 'content',
      'satisfied', 'proud', 'accomplished', 'energized', 'motivated'
    ]
  };

  /**
   * Analyzes journal text for stress indicators
   * Returns a stress score between 0 (no stress) and 1 (extreme stress)
   */
  analyzeJournalEntryForKeywords(journalText: string): {
    stressScore: number;
    detectedKeywords: string[];
    intensity: 'low' | 'medium' | 'high' | 'none';
    analysis: string;
  } {
    if (!journalText || journalText.trim().length === 0) {
      return {
        stressScore: 0,
        detectedKeywords: [],
        intensity: 'none',
        analysis: 'No journal text provided for analysis.'
      };
    }

    const lowerText = journalText.toLowerCase();
    const detectedKeywords: string[] = [];
    let totalWeight = 0;
    let keywordCount = 0;

    // Analyze high intensity keywords
    this.stressKeywords.high.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);
        totalWeight += 3;
        keywordCount++;
      }
    });

    // Analyze medium intensity keywords
    this.stressKeywords.medium.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);
        totalWeight += 2;
        keywordCount++;
      }
    });

    // Analyze low intensity keywords
    this.stressKeywords.low.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);
        totalWeight += 1;
        keywordCount++;
      }
    });

    // Analyze positive keywords (reduce stress score)
    this.stressKeywords.positive.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(`+${keyword}`);
        totalWeight -= 1;
        keywordCount++;
      }
    });

    // Calculate normalized stress score (0-1 scale)
    // Maximum possible weight per keyword is 3, normalize based on text length
    const wordCount = journalText.split(/\s+/).length;
    const maxPossibleWeight = Math.min(wordCount * 0.5, 30); // Cap at 30
    const rawScore = Math.max(0, totalWeight) / Math.max(maxPossibleWeight, 1);
    const stressScore = Math.min(1, rawScore); // Cap at 1.0

    // Determine intensity level
    let intensity: 'low' | 'medium' | 'high' | 'none';
    if (stressScore >= 0.7) {
      intensity = 'high';
    } else if (stressScore >= 0.4) {
      intensity = 'medium';
    } else if (stressScore > 0) {
      intensity = 'low';
    } else {
      intensity = 'none';
    }

    // Generate analysis summary
    const analysis = this.generateAnalysisSummary(
      stressScore,
      intensity,
      detectedKeywords,
      keywordCount
    );

    return {
      stressScore: Math.round(stressScore * 100) / 100, // Round to 2 decimals
      detectedKeywords,
      intensity,
      analysis
    };
  }

  /**
   * Detects discrepancy between self-reported mood and journal stress analysis
   * Returns true if there's a significant mismatch
   */
  detectDiscrepancy(
    selfReportedScore: number, // 1-5 scale
    journalStressScore: number // 0-1 scale
  ): {
    hasDiscrepancy: boolean;
    severity: 'none' | 'minor' | 'moderate' | 'significant';
    explanation: string;
  } {
    // Convert self-reported score to stress scale (inverse: high mood = low stress)
    // 5 (excellent) = 0 stress, 1 (very low) = 1.0 stress
    const selfReportedStress = (5 - selfReportedScore) / 4;

    // Calculate difference
    const difference = Math.abs(journalStressScore - selfReportedStress);

    let hasDiscrepancy = false;
    let severity: 'none' | 'minor' | 'moderate' | 'significant' = 'none';
    let explanation = '';

    if (difference >= 0.5) {
      hasDiscrepancy = true;
      severity = 'significant';
      
      if (journalStressScore > selfReportedStress) {
        explanation = 'Journal analysis indicates higher stress levels than self-reported mood suggests. User may be minimizing their distress.';
      } else {
        explanation = 'Self-reported mood is lower than journal analysis suggests. User may be experiencing temporary negative emotions.';
      }
    } else if (difference >= 0.3) {
      hasDiscrepancy = true;
      severity = 'moderate';
      explanation = 'Moderate discrepancy detected between self-report and journal analysis. Worth monitoring.';
    } else if (difference >= 0.15) {
      hasDiscrepancy = true;
      severity = 'minor';
      explanation = 'Minor discrepancy detected. This is normal variation.';
    } else {
      explanation = 'Self-reported mood aligns well with journal analysis.';
    }

    return {
      hasDiscrepancy,
      severity,
      explanation
    };
  }

  private generateAnalysisSummary(
    stressScore: number,
    intensity: string,
    keywords: string[],
    keywordCount: number
  ): string {
    if (keywordCount === 0) {
      return 'No significant stress indicators detected in journal entry.';
    }

    const keywordList = keywords
      .filter(k => !k.startsWith('+'))
      .slice(0, 5)
      .join(', ');

    const positiveCount = keywords.filter(k => k.startsWith('+')).length;

    let summary = `Detected ${keywordCount} emotional indicators (${intensity} intensity). `;
    
    if (keywordList) {
      summary += `Key stress markers: ${keywordList}. `;
    }

    if (positiveCount > 0) {
      summary += `Also found ${positiveCount} positive indicators. `;
    }

    if (intensity === 'high') {
      summary += 'Consider reaching out for support.';
    } else if (intensity === 'medium') {
      summary += 'Monitoring recommended.';
    } else {
      summary += 'Stress levels appear manageable.';
    }

    return summary;
  }

  /**
   * Generates recommendations based on stress analysis
   */
  generateRecommendations(
    stressScore: number,
    intensity: string,
    hasDiscrepancy: boolean
  ): string[] {
    const recommendations: string[] = [];

    if (intensity === 'high' || stressScore >= 0.7) {
      recommendations.push('Consider speaking with a counselor or mental health professional');
      recommendations.push('Reach out to trusted friends or family members');
      recommendations.push('Explore crisis support resources available on the platform');
      recommendations.push('Practice immediate stress-relief techniques (deep breathing, grounding exercises)');
    } else if (intensity === 'medium' || stressScore >= 0.4) {
      recommendations.push('Try stress management techniques like meditation or journaling');
      recommendations.push('Ensure you\'re getting adequate sleep and exercise');
      recommendations.push('Connect with supportive community members');
      recommendations.push('Consider scheduling time for self-care activities');
    } else if (intensity === 'low' || stressScore > 0) {
      recommendations.push('Continue monitoring your emotional well-being');
      recommendations.push('Maintain healthy routines and social connections');
      recommendations.push('Celebrate small wins and practice gratitude');
    }

    if (hasDiscrepancy) {
      recommendations.push('Your journal suggests different stress levels than your mood rating - consider reflecting on this');
    }

    return recommendations;
  }
}
