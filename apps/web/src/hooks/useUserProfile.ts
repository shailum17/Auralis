'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, UserProfileData } from '@/lib/user-api';

interface UseUserProfileReturn {
  loading: boolean;
  error: string | null;
  updateProfile: (data: UserProfileData) => Promise<boolean>;
  updatePersonalInfo: (data: Pick<UserProfileData, 'fullName' | 'bio' | 'dateOfBirth' | 'gender'>) => Promise<boolean>;
  updateAcademicInfo: (data: UserProfileData['academicInfo']) => Promise<boolean>;
  updateInterests: (interests: string[]) => Promise<boolean>;
  updatePrivacySettings: (settings: UserProfileData['privacySettings']) => Promise<boolean>;
  updateWellnessSettings: (settings: UserProfileData['wellnessSettings']) => Promise<boolean>;
  updatePreferences: (preferences: UserProfileData['preferences']) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user, updateUser, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiCall = useCallback(async (
    apiCall: () => Promise<any>,
    successMessage?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        // Update user context with new data
        updateUser(response.data.user);
        return true;
      } else {
        setError(response.error || 'Operation failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  const updateProfile = useCallback(async (data: UserProfileData): Promise<boolean> => {
    return handleApiCall(() => userAPI.updateProfile(data));
  }, [handleApiCall]);

  const updatePersonalInfo = useCallback(async (
    data: Pick<UserProfileData, 'fullName' | 'bio' | 'dateOfBirth' | 'gender'>
  ): Promise<boolean> => {
    return handleApiCall(() => userAPI.updatePersonalInfo(data));
  }, [handleApiCall]);

  const updateAcademicInfo = useCallback(async (
    academicInfo: UserProfileData['academicInfo']
  ): Promise<boolean> => {
    return handleApiCall(() => userAPI.updateAcademicInfo(academicInfo));
  }, [handleApiCall]);

  const updateInterests = useCallback(async (interests: string[]): Promise<boolean> => {
    return handleApiCall(() => userAPI.updateInterests(interests));
  }, [handleApiCall]);

  const updatePrivacySettings = useCallback(async (
    settings: UserProfileData['privacySettings']
  ): Promise<boolean> => {
    return handleApiCall(() => userAPI.updatePrivacySettings(settings));
  }, [handleApiCall]);

  const updateWellnessSettings = useCallback(async (
    settings: UserProfileData['wellnessSettings']
  ): Promise<boolean> => {
    return handleApiCall(() => userAPI.updateWellnessSettings(settings));
  }, [handleApiCall]);

  const updatePreferences = useCallback(async (
    preferences: UserProfileData['preferences']
  ): Promise<boolean> => {
    return handleApiCall(() => userAPI.updatePreferences(preferences));
  }, [handleApiCall]);

  const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
    return handleApiCall(() => userAPI.uploadAvatar(file));
  }, [handleApiCall]);

  const refreshProfile = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await refreshUserData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [refreshUserData]);

  return {
    loading,
    error,
    updateProfile,
    updatePersonalInfo,
    updateAcademicInfo,
    updateInterests,
    updatePrivacySettings,
    updateWellnessSettings,
    updatePreferences,
    uploadAvatar,
    refreshProfile,
    clearError,
  };
}