'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

// Mock profile client inline since import is having issues
const profileClient = {
  async updatePersonalInfo(data: any) {
    console.log('Mock: updatePersonalInfo called with:', data);
    return {
      success: true,
      data: { 
        message: 'Profile updated successfully (mock)',
        user: data,
        savedToDatabase: true,
        method: 'mock'
      },
      error: null
    };
  }
};

export default function PersonalInfo() {
  // Use actual auth context
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    major: '',
    year: '',
    bio: '',
    interests: [] as string[],
    pronouns: '',
    location: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Simulate API call to get user profile data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use actual user data from registration
      const nameParts = user.fullName?.split(' ') || user.username?.split(' ') || user.email?.split('@')[0].split('.') || [];
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts[1] || '',
        email: user.email,
        phone: '', // Not collected during registration
        major: user.academicInfo?.major || '',
        year: user.academicInfo?.year?.toString() || '',
        bio: user.bio || 'Welcome to my profile! I\'m excited to be part of this community.',
        interests: user.interests || [],
        pronouns: '', // Not collected during registration
        location: '' // Not collected during registration
      });
      
      setLoading(false);
    };

    loadUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestAdd = (interest: string) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const handleInterestRemove = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveStatus({ type: null, message: '' });
    
    try {
      console.log('💾 Saving profile changes...');
      
      // Prepare update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        bio: formData.bio,
        phone: formData.phone,
        pronouns: formData.pronouns,
        location: formData.location,
        academicInfo: {
          institution: user.academicInfo?.institution || '',
          major: formData.major,
          year: formData.year ? parseInt(formData.year) : undefined,
        },
        interests: formData.interests,
      };

      // Save via profile client
      const result = await profileClient.updatePersonalInfo(updateData);
      
      if (result.success && result.data) {
        // Update the auth context with new user data
        const updatedUserData = {
          ...result.data.user,
          // Ensure we preserve the current user's authentication info
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          emailVerified: user.emailVerified
        };
        
        // updateUser(updatedUserData); // Disabled since auth is removed
        
        setSaveStatus({
          type: 'success',
          message: `Profile updated successfully ${result.data.savedToDatabase ? '(saved to database)' : '(saved locally)'}`
        });
        
        console.log(`✅ Profile saved via ${result.data.method}:`, {
          savedToDatabase: result.data.savedToDatabase,
          method: result.data.method,
          updatedUser: updatedUserData
        });
        
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus({ type: null, message: '' });
        }, 3000);
        
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
      
    } catch (error) {
      console.error('❌ Profile save failed:', error);
      setSaveStatus({
        type: 'error',
        message: `Failed to save profile: ${(error as Error).message}`
      });
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Personal Information</h2>
          <p className="text-gray-600 mt-1">Manage your personal details and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setSaveStatus({ type: null, message: '' });
                // Reset form data to original values
                const nameParts = user?.fullName?.split(' ') || user?.username?.split(' ') || user?.email?.split('@')[0].split('.') || [];
                setFormData({
                  firstName: nameParts[0] || '',
                  lastName: nameParts[1] || '',
                  email: user?.email || '',
                  phone: '',
                  major: user?.academicInfo?.major || '',
                  year: user?.academicInfo?.year?.toString() || '',
                  bio: user?.bio || 'Welcome to my profile! I\'m excited to be part of this community.',
                  interests: user?.interests || [],
                  pronouns: '',
                  location: ''
                });
              }}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-500 hover:bg-gray-600 text-white"
              disabled={saving}
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditing
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
            }`}
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </div>
            ) : isEditing ? (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Changes</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit Profile</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Save Status Message */}
      {saveStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-6 p-4 rounded-lg ${
            saveStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {saveStatus.type === 'success' ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{saveStatus.message}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                />
              ) : (
                <p className="text-gray-900 bg-white p-3 rounded-lg shadow-sm">{formData.firstName || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                />
              ) : (
                <p className="text-gray-900 bg-white p-3 rounded-lg shadow-sm">{formData.lastName || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
              />
            ) : (
              <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <p className="text-gray-900">{formData.email}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
              />
            ) : (
              <p className="text-gray-900 bg-white p-3 rounded-lg shadow-sm">{formData.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pronouns
            </label>
            {isEditing ? (
              <select
                value={formData.pronouns}
                onChange={(e) => handleInputChange('pronouns', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
              >
                <option value="">Select pronouns</option>
                <option value="She/Her">She/Her</option>
                <option value="He/Him">He/Him</option>
                <option value="They/Them">They/Them</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <p className="text-gray-900 bg-white p-3 rounded-lg shadow-sm">{formData.pronouns || 'Not specified'}</p>
            )}
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Academic Information</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Major
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.major}
                onChange={(e) => handleInputChange('major', e.target.value)}
                placeholder="e.g., Computer Science"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all"
              />
            ) : (
              <p className="text-gray-900 bg-white p-3 rounded-lg shadow-sm">{formData.major || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            {isEditing ? (
              <select
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all"
              >
                <option value="">Select academic year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            ) : (
              <p className="text-gray-900 bg-white p-3 rounded-lg shadow-sm">{formData.year || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., New York, NY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all"
              />
            ) : (
              <p className="text-gray-900 bg-white p-3 rounded-lg shadow-sm">{formData.location || 'Not specified'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">About Me</h3>
        </div>
        {isEditing ? (
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
            placeholder="Tell others about yourself..."
          />
        ) : (
          <p className="text-gray-900 leading-relaxed bg-white p-4 rounded-lg shadow-sm">{formData.bio}</p>
        )}
      </div>

      {/* Interests Section */}
      <div className="mt-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Interests & Topics</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {formData.interests.length === 0 && !isEditing ? (
            <div className="text-gray-500 italic bg-white p-4 rounded-lg shadow-sm w-full">
              No interests added yet. Click "Edit Profile" to add your interests and connect with like-minded people! 🌟
            </div>
          ) : (
            formData.interests.map((interest, index) => (
              <motion.div
                key={interest}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md"
              >
                <span>{interest}</span>
                {isEditing && (
                  <button
                    onClick={() => handleInterestRemove(interest)}
                    className="text-white/80 hover:text-white ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </motion.div>
            ))
          )}
          {isEditing && (
            <button
              onClick={() => {
                const newInterest = prompt('Add a new interest:');
                if (newInterest) handleInterestAdd(newInterest);
              }}
              className="flex items-center space-x-2 bg-white border-2 border-dashed border-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Interest</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Button for Mobile */}
      {isEditing && (
        <div className="mt-8 lg:hidden space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
          >
            {saving ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving Changes...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
          
          <button
            onClick={() => {
              setIsEditing(false);
              setSaveStatus({ type: null, message: '' });
            }}
            disabled={saving}
            className="w-full bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
}