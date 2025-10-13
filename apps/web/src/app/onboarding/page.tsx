'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, UserProfileData } from '@/lib/user-api';

interface ProfileData {
  // Personal Information
  fullName: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  
  // Academic Information
  university: string;
  major: string;
  year: string;
  gpa: string;
  
  // Interests & Preferences
  interests: string[];
  studyPreferences: string[];
  mentalHealthGoals: string[];
  
  // Privacy Settings
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  allowProfileViewing: boolean;
  dataCollection: boolean;
  
  // Wellness Preferences
  wellnessReminders: boolean;
  moodTracking: boolean;
  stressAlerts: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldSkipOnboarding, setShouldSkipOnboarding] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    // Personal Information
    fullName: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    
    // Academic Information
    university: '',
    major: '',
    year: '',
    gpa: '',
    
    // Interests & Preferences
    interests: [],
    studyPreferences: [],
    mentalHealthGoals: [],
    
    // Privacy Settings
    allowDirectMessages: true,
    showOnlineStatus: true,
    allowProfileViewing: true,
    dataCollection: true,
    
    // Wellness Preferences
    wellnessReminders: true,
    moodTracking: true,
    stressAlerts: true,
  });

  const totalSteps = 5;

  // Check if user already has comprehensive profile data
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Check if user already has comprehensive profile data from enhanced registration
    const hasComprehensiveData = !!(
      user.fullName && 
      (user.academicInfo?.institution || user.academicInfo?.major || 
       user.interests?.length || user.bio || 
       user.privacySettings || user.wellnessSettings)
    );

    if (hasComprehensiveData) {
      console.log('User already has comprehensive profile data, skipping onboarding');
      setShouldSkipOnboarding(true);
      // Redirect to dashboard after a brief delay to show the skip message
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [user, router]);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Transform the profile data to match the API structure
      const userProfileData: UserProfileData = {
        fullName: profileData.fullName || undefined,
        bio: profileData.bio || undefined,
        dateOfBirth: profileData.dateOfBirth || undefined,
        gender: profileData.gender || undefined,
        interests: profileData.interests.length > 0 ? profileData.interests : undefined,
        
        academicInfo: (profileData.university || profileData.major || profileData.year || profileData.gpa) ? {
          institution: profileData.university || undefined,
          major: profileData.major || undefined,
          year: profileData.year ? parseInt(profileData.year) : undefined,
          gpa: profileData.gpa ? parseFloat(profileData.gpa) : undefined,
        } : undefined,
        
        privacySettings: {
          allowDirectMessages: profileData.allowDirectMessages,
          showOnlineStatus: profileData.showOnlineStatus,
          allowProfileViewing: profileData.allowProfileViewing,
          dataCollection: profileData.dataCollection,
        },
        
        wellnessSettings: {
          trackMood: profileData.moodTracking,
          trackStress: profileData.stressAlerts,
          crisisAlertsEnabled: profileData.stressAlerts,
          allowWellnessInsights: profileData.dataCollection,
        },
        
        preferences: {
          notifications: {
            emailNotifications: true, // Default to true for new users
            pushNotifications: true,
            messageNotifications: profileData.allowDirectMessages,
            wellnessAlerts: profileData.wellnessReminders,
          }
        }
      };

      // Save the profile data to the backend
      const response = await userAPI.completeOnboarding(userProfileData);
      
      if (response.success && response.data) {
        // Update the user context with the new data
        updateUser(response.data.user);
        
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

  const interestOptions = [
    'Mental Health', 'Academic Success', 'Social Connection', 'Career Development',
    'Physical Wellness', 'Creative Arts', 'Technology', 'Sports & Fitness',
    'Music', 'Reading', 'Travel', 'Volunteering', 'Leadership', 'Research'
  ];

  const studyPreferenceOptions = [
    'Group Study', 'Solo Study', 'Library', 'Coffee Shops', 'Online Resources',
    'Flashcards', 'Mind Maps', 'Practice Tests', 'Study Groups', 'Tutoring'
  ];

  const mentalHealthGoalOptions = [
    'Stress Management', 'Anxiety Support', 'Depression Support', 'Sleep Improvement',
    'Social Skills', 'Confidence Building', 'Time Management', 'Mindfulness',
    'Emotional Regulation', 'Academic Pressure', 'Relationship Issues'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Tell us a bit about yourself</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={profileData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Information</h2>
              <p className="text-gray-600">Help us understand your academic background</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">University/College</label>
              <input
                type="text"
                value={profileData.university}
                onChange={(e) => handleInputChange('university', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your university name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Major/Field of Study</label>
                <input
                  type="text"
                  value={profileData.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select
                  value={profileData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  <option value="freshman">Freshman</option>
                  <option value="sophomore">Sophomore</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="graduate">Graduate</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GPA (Optional)</label>
              <input
                type="text"
                value={profileData.gpa}
                onChange={(e) => handleInputChange('gpa', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 3.5"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Interests & Preferences</h2>
              <p className="text-gray-600">What are you interested in?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">General Interests</label>
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleArrayToggle('interests', interest)}
                    className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                      profileData.interests.includes(interest)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Study Preferences</label>
              <div className="grid grid-cols-2 gap-3">
                {studyPreferenceOptions.map((preference) => (
                  <button
                    key={preference}
                    type="button"
                    onClick={() => handleArrayToggle('studyPreferences', preference)}
                    className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                      profileData.studyPreferences.includes(preference)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {preference}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mental Health & Wellness</h2>
              <p className="text-gray-600">What areas would you like support with?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Mental Health Goals</label>
              <div className="grid grid-cols-2 gap-3">
                {mentalHealthGoalOptions.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleArrayToggle('mentalHealthGoals', goal)}
                    className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                      profileData.mentalHealthGoals.includes(goal)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Wellness Features</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.wellnessReminders}
                    onChange={(e) => handleInputChange('wellnessReminders', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-blue-800">Enable wellness reminders</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.moodTracking}
                    onChange={(e) => handleInputChange('moodTracking', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-blue-800">Enable mood tracking</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.stressAlerts}
                    onChange={(e) => handleInputChange('stressAlerts', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-blue-800">Enable stress level alerts</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
              <p className="text-gray-600">Control your privacy and data preferences</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">Allow Direct Messages</span>
                  <p className="text-xs text-gray-600">Other students can send you private messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={profileData.allowDirectMessages}
                  onChange={(e) => handleInputChange('allowDirectMessages', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">Show Online Status</span>
                  <p className="text-xs text-gray-600">Others can see when you're online</p>
                </div>
                <input
                  type="checkbox"
                  checked={profileData.showOnlineStatus}
                  onChange={(e) => handleInputChange('showOnlineStatus', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">Allow Profile Viewing</span>
                  <p className="text-xs text-gray-600">Other students can view your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={profileData.allowProfileViewing}
                  onChange={(e) => handleInputChange('allowProfileViewing', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">Data Collection for Insights</span>
                  <p className="text-xs text-gray-600">Help us provide better wellness insights</p>
                </div>
                <input
                  type="checkbox"
                  checked={profileData.dataCollection}
                  onChange={(e) => handleInputChange('dataCollection', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">🎉 You're All Set!</h3>
              <p className="text-green-800 text-sm">
                Your profile is ready! You can always update these settings later in your profile page.
              </p>
            </div>
          </div>
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
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Auralis!</h1>
            <p className="text-gray-600">Let's set up your profile to personalize your experience</p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        >
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Completing...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}