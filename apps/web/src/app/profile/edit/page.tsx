'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayName, formatUserData } from '@/lib/profile-utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';

interface ProfileFormData {
  fullName: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  institution: string;
  major: string;
  year: string;
  gpa: string;
  interests: string[];
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  allowProfileViewing: boolean;
  dataCollection: boolean;
  trackMood: boolean;
  trackStress: boolean;
  crisisAlertsEnabled: boolean;
}

export default function ProfileEditPage() {
  const router = useRouter();
  // Use actual auth context
  const { user, updateUser } = useAuth();
  // Remove the useUserProfile hook since we're implementing the API call directly

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    institution: '',
    major: '',
    year: '',
    gpa: '',
    interests: [],
    allowDirectMessages: true,
    showOnlineStatus: true,
    allowProfileViewing: true,
    dataCollection: true,
    trackMood: false,
    trackStress: false,
    crisisAlertsEnabled: true,
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'interests' | 'privacy' | 'wellness'>('personal');

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      const userData = formatUserData(user);
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        dateOfBirth: '', // We don't store this in the current schema
        gender: '', // We don't store this in the current schema
        institution: user.academicInfo?.institution || '',
        major: user.academicInfo?.major || '',
        year: user.academicInfo?.year?.toString() || '',
        gpa: user.academicInfo?.gpa?.toString() || '',
        interests: user.interests || [],
        allowDirectMessages: user.privacySettings?.allowDirectMessages ?? true,
        showOnlineStatus: user.privacySettings?.showOnlineStatus ?? true,
        allowProfileViewing: user.privacySettings?.allowProfileViewing ?? true,
        dataCollection: user.privacySettings?.dataCollection ?? true,
        trackMood: user.wellnessSettings?.trackMood ?? false,
        trackStress: user.wellnessSettings?.trackStress ?? false,
        crisisAlertsEnabled: user.wellnessSettings?.crisisAlertsEnabled ?? true,
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  const handleInputChange = (field: keyof ProfileFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (saveError) setSaveError(null);
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      const profileData = {
        fullName: formData.fullName || undefined,
        bio: formData.bio || undefined,
        interests: formData.interests.length > 0 ? formData.interests : undefined,
        
        academicInfo: (formData.institution || formData.major || formData.year || formData.gpa) ? {
          institution: formData.institution || undefined,
          major: formData.major || undefined,
          year: formData.year ? parseInt(formData.year) : undefined,
          gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
        } : undefined,
        
        privacySettings: {
          allowDirectMessages: formData.allowDirectMessages,
          showOnlineStatus: formData.showOnlineStatus,
          allowProfileViewing: formData.allowProfileViewing,
          dataCollection: formData.dataCollection,
        },
        
        wellnessSettings: {
          trackMood: formData.trackMood,
          trackStress: formData.trackStress,
          crisisAlertsEnabled: formData.crisisAlertsEnabled,
          allowWellnessInsights: formData.dataCollection,
        },
      };

      console.log('💾 Saving profile data:', profileData);
      
      // Get access token for API call
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }

      // Call the profile update API
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Profile save successful:', result.user);
        
        // Update the user in AuthContext
        if (updateUser && result.user) {
          await updateUser(result.user);
        }
        
        // Redirect to profile page
        router.push('/profile');
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('❌ Profile save failed:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const interestOptions = [
    'Mental Health', 'Academic Success', 'Social Connection', 'Career Development',
    'Physical Wellness', 'Creative Arts', 'Technology', 'Sports & Fitness',
    'Music', 'Reading', 'Travel', 'Volunteering', 'Leadership', 'Research'
  ];

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

  const tabs = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'academic', label: 'Academic', icon: '🎓' },
    { id: 'interests', label: 'Interests', icon: '❤️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'wellness', label: 'Wellness', icon: '🌱' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600">Update your information and preferences</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/profile')}
            >
              Cancel
            </Button>
          </div>
          
          <ProfileCompletionBanner className="mb-6" />
        </div>

        {/* Error Display */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{saveError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Personal Information */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Information */}
              {activeTab === 'academic' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Institution"
                        value={formData.institution}
                        onChange={(e) => handleInputChange('institution', e.target.value)}
                        placeholder="Your university or college"
                      />
                      <Input
                        label="Major/Field of Study"
                        value={formData.major}
                        onChange={(e) => handleInputChange('major', e.target.value)}
                        placeholder="e.g., Computer Science"
                      />
                      <Input
                        label="Academic Year"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        placeholder="e.g., 2024"
                      />
                      <Input
                        label="GPA (Optional)"
                        value={formData.gpa}
                        onChange={(e) => handleInputChange('gpa', e.target.value)}
                        placeholder="e.g., 3.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Interests */}
              {activeTab === 'interests' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Interests</h2>
                    <p className="text-gray-600 mb-4">Select topics you're interested in</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interestOptions.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                            formData.interests.includes(interest)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                    <div className="space-y-4">
                      {[
                        { key: 'allowDirectMessages', label: 'Allow Direct Messages', description: 'Other students can send you private messages' },
                        { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Others can see when you\'re online' },
                        { key: 'allowProfileViewing', label: 'Allow Profile Viewing', description: 'Other students can view your profile' },
                        { key: 'dataCollection', label: 'Data Collection for Insights', description: 'Help us provide better wellness insights' },
                      ].map((setting) => (
                        <label key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{setting.label}</span>
                            <p className="text-xs text-gray-600">{setting.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData[setting.key as keyof ProfileFormData] as boolean}
                            onChange={(e) => handleInputChange(setting.key as keyof ProfileFormData, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Wellness Settings */}
              {activeTab === 'wellness' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Wellness Settings</h2>
                    <div className="space-y-4">
                      {[
                        { key: 'trackMood', label: 'Enable Mood Tracking', description: 'Track your daily mood and emotions' },
                        { key: 'trackStress', label: 'Enable Stress Tracking', description: 'Monitor your stress levels' },
                        { key: 'crisisAlertsEnabled', label: 'Crisis Alerts', description: 'Receive alerts for crisis support resources' },
                      ].map((setting) => (
                        <label key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{setting.label}</span>
                            <p className="text-xs text-gray-600">{setting.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData[setting.key as keyof ProfileFormData] as boolean}
                            onChange={(e) => handleInputChange(setting.key as keyof ProfileFormData, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/profile')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={saving}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}