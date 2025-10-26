/**
 * Profile Service Module
 * 
 * This module handles user profile operations and management.
 */

interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: string;
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
    gpa?: number;
  };
  interests?: string[];
  privacySettings?: {
    allowDirectMessages: boolean;
    showOnlineStatus: boolean;
    allowProfileViewing: boolean;
    dataCollection: boolean;
  };
  wellnessSettings?: {
    trackMood: boolean;
    trackStress: boolean;
    shareWellnessData: boolean;
    crisisAlertsEnabled: boolean;
    allowWellnessInsights: boolean;
  };
  preferences?: {
    notifications?: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      messageNotifications: boolean;
      wellnessAlerts: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileUpdateData {
  fullName?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
    gpa?: number;
  };
  interests?: string[];
  privacySettings?: {
    allowDirectMessages?: boolean;
    showOnlineStatus?: boolean;
    allowProfileViewing?: boolean;
    dataCollection?: boolean;
  };
  wellnessSettings?: {
    trackMood?: boolean;
    trackStress?: boolean;
    shareWellnessData?: boolean;
    crisisAlertsEnabled?: boolean;
    allowWellnessInsights?: boolean;
  };
  preferences?: {
    notifications?: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      messageNotifications?: boolean;
      wellnessAlerts?: boolean;
    };
  };
}

class ProfileService {
  async getProfile(userId: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      // In a real implementation, this would fetch from database
      console.log('📋 Getting profile for user:', userId);

      // Simulate profile retrieval
      const mockProfile: UserProfile = {
        id: userId,
        email: 'user@example.com',
        username: 'testuser',
        fullName: 'Test User',
        bio: 'Student at Example University',
        academicInfo: {
          institution: 'Example University',
          major: 'Computer Science',
          year: 3,
          gpa: 3.8,
        },
        interests: ['programming', 'ai', 'web-development'],
        privacySettings: {
          allowDirectMessages: true,
          showOnlineStatus: true,
          allowProfileViewing: true,
          dataCollection: true,
        },
        wellnessSettings: {
          trackMood: false,
          trackStress: false,
          shareWellnessData: false,
          crisisAlertsEnabled: true,
          allowWellnessInsights: false,
        },
        preferences: {
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            messageNotifications: true,
            wellnessAlerts: false,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        success: true,
        profile: mockProfile,
      };
    } catch (error) {
      console.error('❌ Error getting profile:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async updateProfile(userId: string, updates: ProfileUpdateData): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      console.log('📝 Updating profile for user:', userId, updates);

      // In a real implementation, this would update the database
      // For now, simulate the update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get current profile and apply updates
      const currentProfile = await this.getProfile(userId);
      if (!currentProfile.success || !currentProfile.profile) {
        return {
          success: false,
          error: 'Profile not found',
        };
      }

      // Create updated profile with proper type handling
      const { preferences, privacySettings, wellnessSettings, dateOfBirth, ...otherUpdates } = updates;
      
      const updatedProfile: UserProfile = {
        ...currentProfile.profile,
        ...otherUpdates,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : currentProfile.profile.dateOfBirth,
        privacySettings: privacySettings ? {
          allowDirectMessages: privacySettings.allowDirectMessages ?? currentProfile.profile.privacySettings?.allowDirectMessages ?? true,
          showOnlineStatus: privacySettings.showOnlineStatus ?? currentProfile.profile.privacySettings?.showOnlineStatus ?? true,
          allowProfileViewing: privacySettings.allowProfileViewing ?? currentProfile.profile.privacySettings?.allowProfileViewing ?? true,
          dataCollection: privacySettings.dataCollection ?? currentProfile.profile.privacySettings?.dataCollection ?? false,
        } : currentProfile.profile.privacySettings,
        wellnessSettings: wellnessSettings ? {
          trackMood: wellnessSettings.trackMood ?? currentProfile.profile.wellnessSettings?.trackMood ?? false,
          trackStress: wellnessSettings.trackStress ?? currentProfile.profile.wellnessSettings?.trackStress ?? false,
          shareWellnessData: wellnessSettings.shareWellnessData ?? currentProfile.profile.wellnessSettings?.shareWellnessData ?? false,
          crisisAlertsEnabled: wellnessSettings.crisisAlertsEnabled ?? currentProfile.profile.wellnessSettings?.crisisAlertsEnabled ?? true,
          allowWellnessInsights: wellnessSettings.allowWellnessInsights ?? currentProfile.profile.wellnessSettings?.allowWellnessInsights ?? false,
        } : currentProfile.profile.wellnessSettings,
        updatedAt: new Date(),
      };

      return {
        success: true,
        profile: updatedProfile,
      };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async completeOnboarding(userId: string, onboardingData: ProfileUpdateData): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      console.log('🎯 Completing onboarding for user:', userId);

      // Validate required onboarding fields
      if (!onboardingData.fullName) {
        return {
          success: false,
          error: 'Full name is required for onboarding',
        };
      }

      if (!onboardingData.privacySettings) {
        return {
          success: false,
          error: 'Privacy settings are required for onboarding',
        };
      }

      // Set default wellness settings if not provided
      const wellnessSettings = onboardingData.wellnessSettings || {
        trackMood: false,
        trackStress: false,
        shareWellnessData: false,
        crisisAlertsEnabled: true,
        allowWellnessInsights: false,
      };

      // Set default notification preferences
      const preferences = onboardingData.preferences || {
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          messageNotifications: onboardingData.privacySettings.allowDirectMessages ?? true,
          wellnessAlerts: wellnessSettings.trackMood || wellnessSettings.trackStress,
        },
      };

      const completeOnboardingData: ProfileUpdateData = {
        ...onboardingData,
        wellnessSettings,
        preferences,
      };

      return this.updateProfile(userId, completeOnboardingData);
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async validateProfileData(data: ProfileUpdateData): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate full name
    if (data.fullName !== undefined) {
      if (!data.fullName.trim()) {
        errors.push('Full name is required');
      } else if (data.fullName.length > 100) {
        errors.push('Full name must be less than 100 characters');
      }
    }

    // Validate bio
    if (data.bio !== undefined && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    // Validate academic info
    if (data.academicInfo) {
      if (data.academicInfo.year !== undefined) {
        if (data.academicInfo.year < 1 || data.academicInfo.year > 8) {
          errors.push('Academic year must be between 1 and 8');
        }
      }

      if (data.academicInfo.gpa !== undefined) {
        if (data.academicInfo.gpa < 0 || data.academicInfo.gpa > 4.0) {
          errors.push('GPA must be between 0.0 and 4.0');
        }
      }
    }

    // Validate interests
    if (data.interests !== undefined) {
      if (data.interests.length > 20) {
        errors.push('Maximum 20 interests allowed');
      }
      
      for (const interest of data.interests) {
        if (interest.length > 50) {
          errors.push('Each interest must be less than 50 characters');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getProfileCompletionStatus(userId: string): Promise<{ 
    success: boolean; 
    completionPercentage?: number; 
    missingFields?: string[]; 
    error?: string 
  }> {
    try {
      const profileResult = await this.getProfile(userId);
      if (!profileResult.success || !profileResult.profile) {
        return {
          success: false,
          error: 'Profile not found',
        };
      }

      const profile = profileResult.profile;
      const requiredFields = [
        'fullName',
        'privacySettings',
        'wellnessSettings',
      ];

      const optionalFields = [
        'bio',
        'academicInfo',
        'interests',
      ];

      const missingRequired: string[] = [];
      const missingOptional: string[] = [];

      // Check required fields
      requiredFields.forEach(field => {
        if (!profile[field as keyof UserProfile]) {
          missingRequired.push(field);
        }
      });

      // Check optional fields
      optionalFields.forEach(field => {
        const value = profile[field as keyof UserProfile];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          missingOptional.push(field);
        }
      });

      const totalFields = requiredFields.length + optionalFields.length;
      const completedFields = totalFields - missingRequired.length - missingOptional.length;
      const completionPercentage = Math.round((completedFields / totalFields) * 100);

      return {
        success: true,
        completionPercentage,
        missingFields: [...missingRequired, ...missingOptional],
      };
    } catch (error) {
      console.error('❌ Error getting profile completion status:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string }> {
    return {
      status: 'operational',
    };
  }
}

// Export singleton instance
export const profileService = new ProfileService();

// Export types
export type { UserProfile, ProfileUpdateData };