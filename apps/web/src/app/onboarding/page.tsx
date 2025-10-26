'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, UserProfileData } from '@/lib/user-api';
import { Button } from '@/components/ui/Button';
import { OnboardingStepIndicator } from '@/components/onboarding/OnboardingStepIndicator';
import { PersonalInfoStep } from '@/components/onboarding/PersonalInfoStep';
import { AcademicInfoStep } from '@/components/onboarding/AcademicInfoStep';
import { InterestsStep } from '@/components/onboarding/InterestsStep';
import { PrivacySettingsStep } from '@/components/onboarding/PrivacySettingsStep';
import { WellnessSettingsStep } from '@/components/onboarding/WellnessSettingsStep';
import { ChevronLeft, ChevronRight, Check, SkipForward } from 'lucide-react';

interface OnboardingData {
  // Personal Information
  personalInfo: {
    fullName: string;
    bio: string;
    dateOfBirth: string;
    gender: string;
  };
  
  // Academic Information
  academicInfo: {
    institution: string;
    major: string;
    year: string;
    gpa: string;
  };
  
  // Interests & Preferences
  interests: {
    interests: string[];
    studyPreferences: string[];
    mentalHealthGoals: string[];
  };
  
  // Privacy Settings
  privacySettings: {
    allowDirectMessages: boolean;
    showOnlineStatus: boolean;
    allowProfileViewing: boolean;
    dataCollection: boolean;
  };
  
  // Wellness Settings
  wellnessSettings: {
    trackMood: boolean;
    trackStress: boolean;
    shareWellnessData: boolean;
    crisisAlertsEnabled: boolean;
    allowWellnessInsights: boolean;
  };
}

const onboardingSteps = [
  {
    id: 'personal-info',
    title: 'Personal Info',
    description: 'Tell us about yourself',
    isRequired: true,
  },
  {
    id: 'academic-info',
    title: 'Academic',
    description: 'Your educational background',
    isRequired: false,
  },
  {
    id: 'interests',
    title: 'Interests',
    description: 'What you\'re passionate about',
    isRequired: false,
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Control your privacy settings',
    isRequired: true,
  },
  {
    id: 'wellness',
    title: 'Wellness',
    description: 'Enable wellness features',
    isRequired: false,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldSkipOnboarding, setShouldSkipOnboarding] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, Record<string, string>>>({});
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: {
      fullName: user?.fullName || '',
      bio: user?.bio || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || '',
    },
    academicInfo: {
      institution: user?.academicInfo?.institution || '',
      major: user?.academicInfo?.major || '',
      year: user?.academicInfo?.year?.toString() || '',
      gpa: user?.academicInfo?.gpa?.toString() || '',
    },
    interests: {
      interests: user?.interests || [],
      studyPreferences: [],
      mentalHealthGoals: [],
    },
    privacySettings: {
      allowDirectMessages: user?.privacySettings?.allowDirectMessages ?? true,
      showOnlineStatus: user?.privacySettings?.showOnlineStatus ?? true,
      allowProfileViewing: user?.privacySettings?.allowProfileViewing ?? true,
      dataCollection: user?.privacySettings?.dataCollection ?? true,
    },
    wellnessSettings: {
      trackMood: user?.wellnessSettings?.trackMood ?? false,
      trackStress: user?.wellnessSettings?.trackStress ?? false,
      shareWellnessData: user?.wellnessSettings?.shareWellnessData ?? false,
      crisisAlertsEnabled: user?.wellnessSettings?.crisisAlertsEnabled ?? true,
      allowWellnessInsights: user?.wellnessSettings?.allowWellnessInsights ?? false,
    },
  });

  // Check if user already has comprehensive profile data
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Check if user already has comprehensive profile data from enhanced registration
    const hasComprehensiveData = user.fullName && 
      user.academicInfo?.institution && 
      user.interests.length > 0 &&
      user.privacySettings &&
      user.wellnessSettings;

    if (hasComprehensiveData) {
      console.log('User already has comprehensive profile data, skipping onboarding');
      setShouldSkipOnboarding(true);
      // Redirect to dashboard after a brief delay to show the skip message
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [user, router]);

  // Update handlers for the new data structure
  const updatePersonalInfo = (field: keyof OnboardingData['personalInfo'], value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
    // Clear validation error when user starts typing
    if (validationErrors.personalInfo?.[field]) {
      setValidationErrors(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: '' }
      }));
    }
  };

  const updateAcademicInfo = (field: keyof OnboardingData['academicInfo'], value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      academicInfo: { ...prev.academicInfo, [field]: value }
    }));
    if (validationErrors.academicInfo?.[field]) {
      setValidationErrors(prev => ({
        ...prev,
        academicInfo: { ...prev.academicInfo, [field]: '' }
      }));
    }
  };

  const updateInterests = (field: keyof OnboardingData['interests'], values: string[]) => {
    setOnboardingData(prev => ({
      ...prev,
      interests: { ...prev.interests, [field]: values }
    }));
  };

  const updatePrivacySettings = (field: keyof OnboardingData['privacySettings'], value: boolean) => {
    setOnboardingData(prev => ({
      ...prev,
      privacySettings: { ...prev.privacySettings, [field]: value }
    }));
  };

  const updateWellnessSettings = (field: keyof OnboardingData['wellnessSettings'], value: boolean) => {
    setOnboardingData(prev => ({
      ...prev,
      wellnessSettings: { ...prev.wellnessSettings, [field]: value }
    }));
  };

  // Validation functions
  const validatePersonalInfo = () => {
    const errors: Record<string, string> = {};
    if (!onboardingData.personalInfo.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (onboardingData.personalInfo.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }
    return errors;
  };

  const validateCurrentStep = () => {
    let errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Personal Info
        errors = validatePersonalInfo();
        if (Object.keys(errors).length > 0) {
          setValidationErrors(prev => ({ ...prev, personalInfo: errors }));
          return false;
        }
        break;
      case 3: // Privacy Settings (required step)
        // Privacy settings don't need validation as they have defaults
        break;
      default:
        // Other steps are optional
        break;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    // Validate final step
    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Transform the onboarding data to match the API structure
      const userProfileData: UserProfileData = {
        fullName: onboardingData.personalInfo.fullName || undefined,
        bio: onboardingData.personalInfo.bio || undefined,
        dateOfBirth: onboardingData.personalInfo.dateOfBirth || undefined,
        gender: onboardingData.personalInfo.gender || undefined,
        
        academicInfo: (onboardingData.academicInfo.institution || onboardingData.academicInfo.major || 
                      onboardingData.academicInfo.year || onboardingData.academicInfo.gpa) ? {
          institution: onboardingData.academicInfo.institution || undefined,
          major: onboardingData.academicInfo.major || undefined,
          year: onboardingData.academicInfo.year ? parseInt(onboardingData.academicInfo.year) : undefined,
          gpa: onboardingData.academicInfo.gpa ? parseFloat(onboardingData.academicInfo.gpa) : undefined,
        } : undefined,
        
        interests: [
          ...onboardingData.interests.interests,
          ...onboardingData.interests.studyPreferences,
          ...onboardingData.interests.mentalHealthGoals
        ].filter(Boolean),
        
        privacySettings: onboardingData.privacySettings,
        wellnessSettings: onboardingData.wellnessSettings,
        
        preferences: {
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            messageNotifications: onboardingData.privacySettings.allowDirectMessages,
            wellnessAlerts: onboardingData.wellnessSettings.trackMood || onboardingData.wellnessSettings.trackStress,
          }
        }
      };

      // Save the profile data to the backend
      const response = await userAPI.completeOnboarding(userProfileData);
      
      if (response.success && response.data) {
        // Update the user context with the new data
        updateUser(response.data.user);
        
        // Mark onboarding as complete
        setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(response.error || 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            data={onboardingData.personalInfo}
            onChange={updatePersonalInfo}
            errors={validationErrors.personalInfo || {}}
          />
        );
      case 1:
        return (
          <AcademicInfoStep
            data={onboardingData.academicInfo}
            onChange={updateAcademicInfo}
            errors={validationErrors.academicInfo || {}}
          />
        );
      case 2:
        return (
          <InterestsStep
            data={onboardingData.interests}
            onChange={updateInterests}
            errors={validationErrors.interests || {}}
          />
        );
      case 3:
        return (
          <PrivacySettingsStep
            data={onboardingData.privacySettings}
            onChange={updatePrivacySettings}
            errors={validationErrors.privacySettings || {}}
          />
        );
      case 4:
        return (
          <WellnessSettingsStep
            data={onboardingData.wellnessSettings}
            onChange={updateWellnessSettings}
            errors={validationErrors.wellnessSettings || {}}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show skip message if user already has comprehensive data
  if (shouldSkipOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back! 🎉
            </h1>
            
            <p className="text-gray-600 mb-6">
              Great news! You've already completed your profile setup during registration. 
              We're taking you straight to your dashboard.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Redirecting to dashboard...</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Welcome to Auralis!</h1>
            <p className="text-secondary-600">Let's set up your profile to personalize your experience</p>
          </motion.div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <OnboardingStepIndicator
            steps={onboardingSteps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-error-600">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            icon={<ChevronLeft size={16} />}
            iconPosition="left"
          >
            Previous
          </Button>

          <div className="flex items-center space-x-3">
            {/* Skip button for optional steps */}
            {!onboardingSteps[currentStep]?.isRequired && currentStep < onboardingSteps.length - 1 && (
              <Button
                variant="ghost"
                onClick={skipStep}
                icon={<SkipForward size={16} />}
                iconPosition="right"
              >
                Skip
              </Button>
            )}

            {currentStep < onboardingSteps.length - 1 ? (
              <Button
                variant="primary"
                onClick={nextStep}
                icon={<ChevronRight size={16} />}
                iconPosition="right"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleComplete}
                loading={loading}
                loadingText="Completing..."
                icon={<Check size={16} />}
                iconPosition="left"
              >
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}