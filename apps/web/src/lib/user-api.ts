import { apiClient } from './api';

// Use Next.js API routes for user profile operations
const USER_API_BASE = '/api';

export interface UserProfileData {
  // Personal Information
  fullName?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  
  // Academic Information
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
    courses?: string[];
    gpa?: number;
    graduationYear?: number;
  };
  
  // Interests & Preferences
  interests?: string[];
  
  // Privacy Settings
  privacySettings?: {
    allowDirectMessages?: boolean;
    showOnlineStatus?: boolean;
    allowProfileViewing?: boolean;
    dataCollection?: boolean;
  };
  
  // Wellness Settings
  wellnessSettings?: {
    trackMood?: boolean;
    trackStress?: boolean;
    shareWellnessData?: boolean;
    crisisAlertsEnabled?: boolean;
    allowWellnessInsights?: boolean;
  };
  
  // User Preferences
  preferences?: {
    feedAlgorithm?: string;
    privacyLevel?: string;
    theme?: string;
    language?: string;
    timezone?: string;
    notifications?: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      messageNotifications?: boolean;
      postReactions?: boolean;
      commentReplies?: boolean;
      studyGroupInvites?: boolean;
      sessionReminders?: boolean;
      wellnessAlerts?: boolean;
      moderationActions?: boolean;
      systemAnnouncements?: boolean;
    };
  };
}

export interface UserUpdateResponse {
  success: boolean;
  data?: {
    user: any;
  };
  error?: string;
}

class UserAPI {
  // Helper method to make requests to Next.js API routes
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<UserUpdateResponse> {
    const url = `${USER_API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Get current user profile
  async getProfile(): Promise<UserUpdateResponse> {
    return this.request<any>('/users/profile', {
      method: 'GET'
    });
  }

  // Update user profile
  async updateProfile(profileData: UserProfileData): Promise<UserUpdateResponse> {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Complete onboarding with full profile data
  async completeOnboarding(profileData: UserProfileData): Promise<UserUpdateResponse> {
    return this.request<any>('/users/onboarding', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  // Update specific profile sections
  async updatePersonalInfo(data: Pick<UserProfileData, 'fullName' | 'bio' | 'dateOfBirth' | 'gender'>): Promise<UserUpdateResponse> {
    return this.request<any>('/users/profile/personal', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updateAcademicInfo(academicInfo: UserProfileData['academicInfo']): Promise<UserUpdateResponse> {
    return this.request<any>('/users/profile/academic', {
      method: 'PUT',
      body: JSON.stringify({ academicInfo })
    });
  }

  async updateInterests(interests: string[]): Promise<UserUpdateResponse> {
    return this.request<any>('/users/profile/interests', {
      method: 'PUT',
      body: JSON.stringify({ interests })
    });
  }

  async updatePrivacySettings(privacySettings: UserProfileData['privacySettings']): Promise<UserUpdateResponse> {
    return this.request<any>('/users/profile/privacy', {
      method: 'PUT',
      body: JSON.stringify({ privacySettings })
    });
  }

  async updateWellnessSettings(wellnessSettings: UserProfileData['wellnessSettings']): Promise<UserUpdateResponse> {
    return this.request<any>('/users/profile/wellness', {
      method: 'PUT',
      body: JSON.stringify({ wellnessSettings })
    });
  }

  async updatePreferences(preferences: UserProfileData['preferences']): Promise<UserUpdateResponse> {
    return this.request<any>('/users/profile/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences })
    });
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<UserUpdateResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request<any>('/users/profile/avatar', {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type to let browser set it for FormData
    });
  }

  // Delete user account
  async deleteAccount(): Promise<UserUpdateResponse> {
    return this.request<any>('/users/profile', {
      method: 'DELETE'
    });
  }
}

export const userAPI = new UserAPI();