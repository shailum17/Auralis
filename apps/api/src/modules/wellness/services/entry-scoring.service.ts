import { Injectable } from '@nestjs/common';

export interface ScoringResult {
  score: number;
  completeness: string;
  flaggedForReview: boolean;
  details: string[];
  suggestions: string[];
}

@Injectable()
export class EntryScoringService {
  /**
   * Calculate quality score for mood entry
   * Total: 100 points
   * - Mood score: 20 points (mandatory)
   * - Tags (min 2): 20 points (mandatory)
   * - Journal (min 50 chars): 20 points (mandatory)
   * - Detailed journal (100+ chars): 10 points
   * - Multiple tags (3+): 10 points
   * - Stress keywords detected: 10 points
   * - Coping strategies mentioned: 10 points
   */
  calculateMoodScore(entry: any): ScoringResult {
    let score = 0;
    const details: string[] = [];
    const suggestions: string[] = [];
    let flaggedForReview = false;

    // Mandatory: Mood score (20 points)
    if (entry.moodScore) {
      score += 20;
      details.push(`✓ Mood score: ${entry.moodScore}/5`);
    } else {
      suggestions.push('Add mood score');
    }

    // Mandatory: Tags - min 2 (20 points)
    if (entry.tags && entry.tags.length >= 2) {
      score += 20;
      details.push(`✓ ${entry.tags.length} mood tags selected`);
    } else if (entry.tags && entry.tags.length === 1) {
      score += 10;
      details.push(`⚠ Only 1 mood tag (need 2+)`);
      suggestions.push('Add at least one more mood tag');
    } else {
      suggestions.push('Select at least 2 mood tags');
    }

    // Mandatory: Journal entry - min 50 chars (20 points)
    if (entry.notes && entry.notes.length >= 50) {
      score += 20;
      details.push(`✓ Journal entry: ${entry.notes.length} characters`);
    } else if (entry.notes && entry.notes.length > 0) {
      const partial = Math.floor((entry.notes.length / 50) * 20);
      score += partial;
      details.push(`⚠ Journal too short: ${entry.notes.length}/50 characters`);
      suggestions.push(`Write ${50 - entry.notes.length} more characters in journal`);
    } else {
      suggestions.push('Add a journal entry (min 50 characters)');
    }

    // Optional: Detailed journal - 100+ chars (10 points)
    if (entry.notes && entry.notes.length >= 100) {
      score += 10;
      details.push('✓ Detailed journal entry');
    }

    // Optional: Multiple tags - 3+ (10 points)
    if (entry.tags && entry.tags.length >= 3) {
      score += 10;
      details.push('✓ Multiple mood tags for better tracking');
    }

    // Optional: Stress keywords detected (10 points)
    const stressKeywords = ['stress', 'anxiety', 'anxious', 'worried', 'overwhelmed', 'depressed', 'panic'];
    if (entry.notes) {
      const notesLower = entry.notes.toLowerCase();
      const foundKeywords = stressKeywords.filter(k => notesLower.includes(k));
      if (foundKeywords.length > 0) {
        score += 10;
        details.push(`✓ Stress indicators detected: ${foundKeywords.join(', ')}`);
        
        // Flag for review if severe keywords
        const severeKeywords = ['suicide', 'kill myself', 'end it all', 'no point', 'give up'];
        if (severeKeywords.some(k => notesLower.includes(k))) {
          flaggedForReview = true;
          details.push('🚨 CRISIS KEYWORDS DETECTED - FLAGGED FOR REVIEW');
        }
      }
    }

    // Optional: Coping strategies mentioned (10 points)
    const copingKeywords = ['meditation', 'meditate', 'exercise', 'workout', 'talk', 'therapy', 'therapist', 'counseling', 'help', 'support', 'friend', 'family'];
    if (entry.notes) {
      const notesLower = entry.notes.toLowerCase();
      const foundCoping = copingKeywords.filter(k => notesLower.includes(k));
      if (foundCoping.length > 0) {
        score += 10;
        details.push(`✓ Coping strategies mentioned: ${foundCoping.join(', ')}`);
      } else if (entry.moodScore <= 2) {
        suggestions.push('Consider mentioning coping strategies you tried');
      }
    }

    // Flag low mood without coping
    if (entry.moodScore <= 2 && (!entry.notes || entry.notes.length < 50)) {
      flaggedForReview = true;
      details.push('⚠ Low mood with minimal details - flagged for follow-up');
    }

    return {
      score,
      completeness: this.getCompletenessLevel(score),
      flaggedForReview,
      details,
      suggestions
    };
  }

  /**
   * Calculate quality score for stress entry
   * Total: 100 points
   * - Stress level: 20 points (mandatory)
   * - Triggers (min 2): 25 points (mandatory)
   * - Symptoms (min 2): 25 points (mandatory)
   * - Coping strategies (min 2): 15 points
   * - Detailed notes (50+ chars): 15 points
   */
  calculateStressScore(entry: any): ScoringResult {
    let score = 0;
    const details: string[] = [];
    const suggestions: string[] = [];
    let flaggedForReview = false;

    // Mandatory: Stress level (20 points)
    if (entry.stressLevel) {
      score += 20;
      details.push(`✓ Stress level: ${entry.stressLevel}/5`);
      
      if (entry.stressLevel >= 4) {
        flaggedForReview = true;
        details.push('⚠ High stress level - flagged for support');
      }
    }

    // Mandatory: Triggers - min 2 (25 points)
    if (entry.triggers && entry.triggers.length >= 2) {
      score += 25;
      details.push(`✓ ${entry.triggers.length} triggers identified`);
    } else if (entry.triggers && entry.triggers.length === 1) {
      score += 12;
      details.push(`⚠ Only 1 trigger (need 2+)`);
      suggestions.push('Add at least one more stress trigger');
    } else {
      suggestions.push('Select at least 2 stress triggers');
    }

    // Mandatory: Symptoms - min 2 (25 points)
    if (entry.symptoms && entry.symptoms.length >= 2) {
      score += 25;
      details.push(`✓ ${entry.symptoms.length} symptoms reported`);
    } else if (entry.symptoms && entry.symptoms.length === 1) {
      score += 12;
      details.push(`⚠ Only 1 symptom (need 2+)`);
      suggestions.push('Add at least one more symptom');
    } else {
      suggestions.push('Select at least 2 symptoms');
    }

    // Optional: Coping strategies - min 2 (15 points)
    if (entry.copingUsed && entry.copingUsed.length >= 2) {
      score += 15;
      details.push(`✓ ${entry.copingUsed.length} coping strategies used`);
    } else if (entry.copingUsed && entry.copingUsed.length === 1) {
      score += 7;
      details.push(`⚠ Only 1 coping strategy`);
      suggestions.push('Add more coping strategies you tried');
    } else {
      suggestions.push('Select coping strategies you tried or plan to try');
      if (entry.stressLevel >= 3) {
        flaggedForReview = true;
        details.push('⚠ Moderate/high stress without coping strategies');
      }
    }

    // Optional: Detailed notes (15 points)
    if (entry.notes && entry.notes.length >= 50) {
      score += 15;
      details.push(`✓ Detailed notes: ${entry.notes.length} characters`);
    } else if (entry.notes && entry.notes.length > 0) {
      const partial = Math.floor((entry.notes.length / 50) * 15);
      score += partial;
      details.push(`⚠ Notes too short: ${entry.notes.length}/50 characters`);
    } else {
      suggestions.push('Add notes about your stress experience');
    }

    return {
      score,
      completeness: this.getCompletenessLevel(score),
      flaggedForReview,
      details,
      suggestions
    };
  }

  /**
   * Calculate quality score for sleep entry
   * Total: 100 points
   * - Sleep quality: 20 points (mandatory)
   * - Hours slept: 20 points (mandatory)
   * - Bed time: 15 points (mandatory)
   * - Wake time: 15 points (mandatory)
   * - Sleep issues (if quality < 4): 15 points
   * - Factors (min 2): 15 points
   */
  calculateSleepScore(entry: any): ScoringResult {
    let score = 0;
    const details: string[] = [];
    const suggestions: string[] = [];
    let flaggedForReview = false;

    // Mandatory: Sleep quality (20 points)
    if (entry.sleepQuality) {
      score += 20;
      details.push(`✓ Sleep quality: ${entry.sleepQuality}/5`);
      
      if (entry.sleepQuality <= 2) {
        flaggedForReview = true;
        details.push('⚠ Poor sleep quality - flagged for review');
      }
    }

    // Mandatory: Hours slept (20 points)
    if (entry.hoursSlept !== undefined && entry.hoursSlept !== null) {
      score += 20;
      details.push(`✓ Hours slept: ${entry.hoursSlept}h`);
      
      if (entry.hoursSlept < 5 || entry.hoursSlept > 10) {
        details.push(`⚠ Unusual sleep duration: ${entry.hoursSlept}h`);
      }
    }

    // Mandatory: Bed time (15 points)
    if (entry.bedTime) {
      score += 15;
      details.push(`✓ Bed time: ${entry.bedTime}`);
    } else {
      suggestions.push('Add your bed time for better tracking');
    }

    // Mandatory: Wake time (15 points)
    if (entry.wakeTime) {
      score += 15;
      details.push(`✓ Wake time: ${entry.wakeTime}`);
    } else {
      suggestions.push('Add your wake time for better tracking');
    }

    // Optional: Sleep issues (15 points) - important if quality < 4
    if (entry.sleepQuality < 4) {
      if (entry.sleepIssues && entry.sleepIssues.length > 0) {
        score += 15;
        details.push(`✓ ${entry.sleepIssues.length} sleep issues identified`);
      } else {
        suggestions.push('Select sleep issues you experienced (important for poor sleep)');
      }
    } else {
      // Still give points if they added issues even with good sleep
      if (entry.sleepIssues && entry.sleepIssues.length > 0) {
        score += 15;
        details.push(`✓ ${entry.sleepIssues.length} sleep issues noted`);
      }
    }

    // Optional: Factors (15 points)
    if (entry.factors && entry.factors.length >= 2) {
      score += 15;
      details.push(`✓ ${entry.factors.length} factors affecting sleep`);
    } else if (entry.factors && entry.factors.length === 1) {
      score += 7;
      details.push(`⚠ Only 1 factor identified`);
      suggestions.push('Add more factors that affected your sleep');
    } else {
      suggestions.push('Select factors that affected your sleep');
    }

    return {
      score,
      completeness: this.getCompletenessLevel(score),
      flaggedForReview,
      details,
      suggestions
    };
  }

  /**
   * Calculate quality score for social entry
   * Total: 100 points
   * - Connection quality: 20 points (mandatory)
   * - Interactions (min 2): 25 points (mandatory)
   * - Feelings (min 2): 25 points (mandatory)
   * - Activities (min 2): 15 points
   * - Detailed notes (50+ chars): 15 points
   */
  calculateSocialScore(entry: any): ScoringResult {
    let score = 0;
    const details: string[] = [];
    const suggestions: string[] = [];
    let flaggedForReview = false;

    // Mandatory: Connection quality (20 points)
    if (entry.connectionQuality) {
      score += 20;
      details.push(`✓ Connection quality: ${entry.connectionQuality}/5`);
      
      if (entry.connectionQuality <= 2) {
        flaggedForReview = true;
        details.push('⚠ Low social connection - flagged for support');
      }
    }

    // Mandatory: Interactions - min 2 (25 points)
    if (entry.interactions && entry.interactions.length >= 2) {
      score += 25;
      details.push(`✓ ${entry.interactions.length} interaction types`);
    } else if (entry.interactions && entry.interactions.length === 1) {
      score += 12;
      details.push(`⚠ Only 1 interaction type (need 2+)`);
      suggestions.push('Add at least one more interaction type');
    } else {
      suggestions.push('Select at least 2 types of interactions');
    }

    // Mandatory: Feelings - min 2 (25 points)
    if (entry.feelings && entry.feelings.length >= 2) {
      score += 25;
      details.push(`✓ ${entry.feelings.length} feelings described`);
      
      // Check for negative feelings
      const negativeFeelings = ['Lonely', 'Drained', 'Awkward', 'Anxious', 'Isolated'];
      const hasNegative = entry.feelings.some((f: string) => negativeFeelings.includes(f));
      if (hasNegative && entry.connectionQuality <= 2) {
        flaggedForReview = true;
        details.push('⚠ Negative feelings + low connection - flagged for support');
      }
    } else if (entry.feelings && entry.feelings.length === 1) {
      score += 12;
      details.push(`⚠ Only 1 feeling (need 2+)`);
      suggestions.push('Add at least one more feeling');
    } else {
      suggestions.push('Select at least 2 feelings about your interactions');
    }

    // Optional: Activities - min 2 (15 points)
    if (entry.activities && entry.activities.length >= 2) {
      score += 15;
      details.push(`✓ ${entry.activities.length} activities engaged in`);
    } else if (entry.activities && entry.activities.length === 1) {
      score += 7;
      details.push(`⚠ Only 1 activity`);
      suggestions.push('Add more social activities');
    } else {
      suggestions.push('Select social activities you participated in');
    }

    // Optional: Detailed notes (15 points)
    if (entry.notes && entry.notes.length >= 50) {
      score += 15;
      details.push(`✓ Detailed notes: ${entry.notes.length} characters`);
    } else if (entry.notes && entry.notes.length > 0) {
      const partial = Math.floor((entry.notes.length / 50) * 15);
      score += partial;
      details.push(`⚠ Notes too short: ${entry.notes.length}/50 characters`);
    } else {
      suggestions.push('Add notes about your social interactions');
    }

    return {
      score,
      completeness: this.getCompletenessLevel(score),
      flaggedForReview,
      details,
      suggestions
    };
  }

  /**
   * Get completeness level based on score
   */
  private getCompletenessLevel(score: number): string {
    if (score >= 81) return 'high';
    if (score >= 61) return 'medium';
    if (score >= 41) return 'low';
    return 'incomplete';
  }

  /**
   * Get user-friendly completeness label
   */
  getCompletenessLabel(completeness: string): string {
    switch (completeness) {
      case 'high': return 'Excellent';
      case 'medium': return 'Good';
      case 'low': return 'Basic';
      case 'incomplete': return 'Minimal';
      default: return 'Unknown';
    }
  }

  /**
   * Get completeness description
   */
  getCompletenessDescription(completeness: string): string {
    switch (completeness) {
      case 'high': return '🌟 Excellent! Very detailed and comprehensive entry.';
      case 'medium': return '👍 Good entry with helpful details for tracking.';
      case 'low': return '📝 Basic entry. Consider adding more details for better insights.';
      case 'incomplete': return '⚠️ Minimal entry. More details would help identify patterns.';
      default: return '';
    }
  }
}
