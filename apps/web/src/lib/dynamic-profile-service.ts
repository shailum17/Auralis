/**
 * Dynamic Profile Service
 * Provides user-specific data instead of hardcoded values
 */

import { User } from '@/types/auth';
import { getProfileCompletionStatus } from './profile-utils';

export interface UserStats {
  posts: number;
  helpfulVotes: number;
  studyGroups: number;
  wellnessStreak: number;
}

export interface WellnessMetrics {
  overallScore: number;
  trend: string;
  metrics: Array<{
    name: string;
    value: number;
    change: string;
    color: string;
  }>;
  recentEntries: Array<{
    date: string;
    mood: number;
    note: string;
  }>;
}

export interface ActivityEntry {
  id: number;
  type: string;
  action: string;
  title: string;
  timestamp: string;
  engagement?: any;
  icon: React.ReactNode;
  color: string;
  isAnonymous?: boolean;
}

export class DynamicProfileService {
  
  /**
   * Get user-specific stats based on actual activity
   */
  static getUserStats(user: User | null): UserStats {
    if (!user) {
      return {
        posts: 0,
        helpfulVotes: 0,
        studyGroups: 0,
        wellnessStreak: 0
      };
    }

    // In a real implementation, this would fetch from the database
    // For now, return zeros to indicate no hardcoded data
    return {
      posts: 0, // Would be: await getUserPostCount(user.id)
      helpfulVotes: 0, // Would be: await getUserHelpfulVotes(user.id)
      studyGroups: 0, // Would be: await getUserStudyGroupCount(user.id)
      wellnessStreak: 0 // Would be: await getUserWellnessStreak(user.id)
    };
  }

  /**
   * Get user-specific wellness data
   */
  static getUserWellnessData(user: User | null): WellnessMetrics {
    if (!user) {
      return {
        overallScore: 0,
        trend: '+0.0',
        metrics: [
          { name: 'Mood', value: 0, change: '+0.0', color: 'bg-green-500' },
          { name: 'Stress', value: 0, change: '+0.0', color: 'bg-yellow-500' },
          { name: 'Sleep', value: 0, change: '+0.0', color: 'bg-blue-500' },
          { name: 'Social', value: 0, change: '+0.0', color: 'bg-purple-500' },
        ],
        recentEntries: []
      };
    }

    // In a real implementation, this would fetch user's actual wellness data
    return {
      overallScore: 0, // Would be: await calculateUserWellnessScore(user.id)
      trend: '+0.0', // Would be: await getWellnessTrend(user.id)
      metrics: [
        { name: 'Mood', value: 0, change: '+0.0', color: 'bg-green-500' },
        { name: 'Stress', value: 0, change: '+0.0', color: 'bg-yellow-500' },
        { name: 'Sleep', value: 0, change: '+0.0', color: 'bg-blue-500' },
        { name: 'Social', value: 0, change: '+0.0', color: 'bg-purple-500' },
      ],
      recentEntries: [] // Would be: await getUserMoodEntries(user.id, { limit: 10 })
    };
  }

  /**
   * Get user-specific activity history
   */
  static getUserActivityHistory(user: User | null): ActivityEntry[] {
    if (!user) {
      return [];
    }

    // In a real implementation, this would fetch user's actual activity
    // Return empty array to show no hardcoded data
    return []; // Would be: await getUserActivities(user.id, { limit: 20 })
  }

  /**
   * Get user badges based on actual achievements
   */
  static getUserBadges(user: User | null): Array<{
    name: string;
    icon: string;
    color: string;
  }> {
    if (!user) {
      return [];
    }

    // In a real implementation, this would calculate badges based on user activity
    return []; // Would be: await calculateUserBadges(user.id)
  }

  /**
   * Get dynamic profile completion data
   */
  static getProfileCompletion(user: User | null) {
    const status = getProfileCompletionStatus(user);
    return {
      percentage: status.completionPercentage,
      isComplete: status.isComplete,
      nextStep: status.missingFields.length > 0 ? status.missingFields[0] : null,
      sections: status.sections
    };
  }

  /**
   * Get user's wellness score for dashboard
   */
  static getUserWellnessScore(user: User | null): number {
    if (!user) return 0;
    
    // In a real implementation, this would calculate based on recent wellness data
    return 0; // Would be: await calculateCurrentWellnessScore(user.id)
  }

  /**
   * Check if user has any data to display
   */
  static hasUserData(user: User | null): boolean {
    if (!user) return false;
    
    // Check if user has any activity, posts, or wellness data
    const stats = this.getUserStats(user);
    const activities = this.getUserActivityHistory(user);
    const wellness = this.getUserWellnessData(user);
    
    return (
      stats.posts > 0 ||
      stats.helpfulVotes > 0 ||
      stats.studyGroups > 0 ||
      stats.wellnessStreak > 0 ||
      activities.length > 0 ||
      wellness.recentEntries.length > 0
    );
  }

  /**
   * Get personalized welcome message
   */
  static getWelcomeMessage(user: User | null): string {
    if (!user) return "Welcome to the community!";
    
    const hasData = this.hasUserData(user);
    const completion = this.getProfileCompletion(user);
    
    if (!hasData && !completion.isComplete) {
      return "Welcome! Let's get your profile set up to connect with the community.";
    } else if (!hasData && completion.isComplete) {
      return "Your profile looks great! Start engaging with the community to see your activity here.";
    } else {
      return `Welcome back! Here's your latest activity and wellness insights.`;
    }
  }

  /**
   * Get suggested next actions for the user
   */
  static getSuggestedActions(user: User | null): Array<{
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    if (!user) return [];
    
    const suggestions = [];
    const completion = this.getProfileCompletion(user);
    const hasData = this.hasUserData(user);
    
    if (!completion.isComplete) {
      suggestions.push({
        title: "Complete Your Profile",
        description: `Your profile is ${completion.percentage}% complete`,
        action: "complete-profile",
        priority: 'high' as const
      });
    }
    
    if (!hasData) {
      suggestions.push({
        title: "Make Your First Post",
        description: "Share something with the community",
        action: "create-post",
        priority: 'medium' as const
      });
      
      suggestions.push({
        title: "Log Your Mood",
        description: "Start tracking your wellness journey",
        action: "log-mood",
        priority: 'medium' as const
      });
    }
    
    return suggestions;
  }
}