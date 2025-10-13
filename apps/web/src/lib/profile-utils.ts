import { User } from '@/contexts/AuthContext';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  sections: {
    personal: boolean;
    academic: boolean;
    interests: boolean;
    privacy: boolean;
    wellness: boolean;
  };
}

export function getProfileCompletionStatus(user: User | null): ProfileCompletionStatus {
  if (!user) {
    return {
      isComplete: false,
      completionPercentage: 0,
      missingFields: ['All profile information'],
      sections: {
        personal: false,
        academic: false,
        interests: false,
        privacy: false,
        wellness: false,
      },
    };
  }

  const missingFields: string[] = [];
  const sections = {
    personal: false,
    academic: false,
    interests: false,
    privacy: false,
    wellness: false,
  };

  // Check personal information (required fields only)
  const hasPersonalInfo = !!(user.fullName);
  sections.personal = hasPersonalInfo;
  if (!hasPersonalInfo) {
    missingFields.push('Full name');
  }

  // Check academic information (optional but recommended)
  const hasAcademicInfo = !!(user.academicInfo?.institution || user.academicInfo?.major);
  sections.academic = hasAcademicInfo;

  // Check interests (optional but recommended)
  const hasInterests = !!(user.interests && user.interests.length > 0);
  sections.interests = hasInterests;

  // Check privacy settings (should be configured)
  const hasPrivacySettings = !!(user.privacySettings);
  sections.privacy = hasPrivacySettings;

  // Check wellness settings (should be configured)
  const hasWellnessSettings = !!(user.wellnessSettings);
  sections.wellness = hasWellnessSettings;

  // Calculate completion percentage
  const totalSections = 5;
  const completedSections = Object.values(sections).filter(Boolean).length;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  // Profile is considered complete if personal info is filled and at least 3 other sections
  const isComplete = sections.personal && completedSections >= 3;

  return {
    isComplete,
    completionPercentage,
    missingFields,
    sections,
  };
}

export function getDisplayName(user: User | null): string {
  if (!user) return 'User';
  
  // Prefer full name, fallback to username
  return user.fullName || user.username || 'User';
}

export function getInitials(user: User | null): string {
  if (!user) return 'U';
  
  const name = user.fullName || user.username || 'User';
  const parts = name.split(' ');
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
}

export function hasRequiredProfileData(user: User | null): boolean {
  if (!user) return false;
  
  // Only require essential fields that users must provide
  return !!(
    user.email &&
    user.username &&
    user.emailVerified
  );
}

export function shouldShowOnboarding(user: User | null): boolean {
  if (!user) return false;
  
  // Show onboarding if user hasn't completed basic profile setup
  const status = getProfileCompletionStatus(user);
  return !status.sections.personal || !status.sections.privacy || !status.sections.wellness;
}

export function getProfileStrength(user: User | null): 'weak' | 'medium' | 'strong' {
  const status = getProfileCompletionStatus(user);
  
  if (status.completionPercentage >= 80) return 'strong';
  if (status.completionPercentage >= 50) return 'medium';
  return 'weak';
}

export function getNextProfileStep(user: User | null): string | null {
  if (!user) return 'Complete registration';
  
  const status = getProfileCompletionStatus(user);
  
  if (!status.sections.personal) return 'Add personal information';
  if (!status.sections.privacy) return 'Configure privacy settings';
  if (!status.sections.wellness) return 'Set up wellness preferences';
  if (!status.sections.academic) return 'Add academic information';
  if (!status.sections.interests) return 'Select your interests';
  
  return null;
}

// Utility to safely access nested user properties
export function getUserProperty<T>(
  user: User | null,
  path: string,
  defaultValue: T
): T {
  if (!user) return defaultValue;
  
  const keys = path.split('.');
  let current: any = user;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current !== undefined ? current : defaultValue;
}

// Format user data for display
export function formatUserData(user: User | null) {
  if (!user) return null;
  
  return {
    displayName: getDisplayName(user),
    initials: getInitials(user),
    profileStrength: getProfileStrength(user),
    completionStatus: getProfileCompletionStatus(user),
    nextStep: getNextProfileStep(user),
    shouldShowOnboarding: shouldShowOnboarding(user),
    
    // Safe accessors for common properties
    bio: user.bio || '',
    institution: user.academicInfo?.institution || '',
    major: user.academicInfo?.major || '',
    year: user.academicInfo?.year || null,
    interests: user.interests || [],
    
    // Privacy settings with defaults
    allowDirectMessages: getUserProperty(user, 'privacySettings.allowDirectMessages', true),
    showOnlineStatus: getUserProperty(user, 'privacySettings.showOnlineStatus', true),
    allowProfileViewing: getUserProperty(user, 'privacySettings.allowProfileViewing', true),
    
    // Wellness settings with defaults
    trackMood: getUserProperty(user, 'wellnessSettings.trackMood', false),
    trackStress: getUserProperty(user, 'wellnessSettings.trackStress', false),
    crisisAlertsEnabled: getUserProperty(user, 'wellnessSettings.crisisAlertsEnabled', true),
  };
}