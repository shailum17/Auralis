'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWellnessDataSync } from './useWellnessDataSync';

export interface MoodEntry {
  id: string;
  date?: string;
  createdAt?: string;
  mood?: number; // 1-5 scale (backward compatibility)
  moodScore?: number; // 1-5 scale (new field)
  energy?: number; // 1-5 scale
  stress?: number; // 1-5 scale
  notes?: string;
  tags?: string[];
}

export interface StressEntry {
  id: string;
  date: string;
  stressLevel: number;
  triggers: string[];
  copingStrategies: string[];
  notes?: string;
}

export interface SleepEntry {
  id: string;
  date: string;
  hoursSlept: number;
  sleepQuality: number;
  bedtime: string;
  wakeTime: string;
  sleepIssues: string[];
  notes?: string;
}

export interface SocialEntry {
  id: string;
  date: string;
  connectionQuality: number;
  feelings: string[];
  socialActivities: string[];
  notes?: string;
}

export interface WellnessGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  category: 'mood' | 'sleep' | 'exercise' | 'meditation' | 'other';
}

export interface WellnessStats {
  overallScore: number;
  dayStreak: number;
  totalActivities: number;
  weeklyAverage: {
    mood: number;
    energy: number;
    stress: number;
  };
}

interface UseWellnessDataReturn {
  moodEntries: MoodEntry[];
  stressEntries: StressEntry[];
  sleepEntries: SleepEntry[];
  socialEntries: SocialEntry[];
  wellnessGoals: WellnessGoal[];
  wellnessStats: WellnessStats | null;
  loading: boolean;
  error: string | null;
  hasData: boolean;
  
  // Sync status
  syncStatus: any;
  
  // Actions
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => Promise<boolean>;
  updateWellnessGoal: (goalId: string, updates: Partial<WellnessGoal>) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export function useWellnessData(): UseWellnessDataReturn {
  const { user } = useAuth();
  
  // Use the new sync hook for core data
  const {
    moodEntries: syncedMoodEntries,
    wellnessGoals: syncedWellnessGoals,
    wellnessStats: syncedWellnessStats,
    syncStatus,
    addMoodEntry: syncAddMoodEntry,
    updateWellnessGoal: syncUpdateWellnessGoal,
    syncData
  } = useWellnessDataSync();
  
  // Legacy state for other data types (not yet migrated to sync)
  const [stressEntries, setStressEntries] = useState<StressEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [socialEntries, setSocialEntries] = useState<SocialEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Convert synced data to legacy format
  const moodEntries: MoodEntry[] = syncedMoodEntries.map(entry => ({
    id: entry.id,
    date: entry.date,
    createdAt: entry.createdAt,
    mood: entry.mood,
    moodScore: entry.moodScore,
    energy: entry.energy,
    stress: entry.stress,
    notes: entry.notes,
    tags: entry.tags
  }));

  const wellnessGoals: WellnessGoal[] = syncedWellnessGoals.map(goal => ({
    id: goal.id,
    name: goal.name,
    current: goal.current,
    target: goal.target,
    unit: goal.unit,
    category: goal.category
  }));

  const wellnessStats: WellnessStats | null = syncedWellnessStats ? {
    overallScore: syncedWellnessStats.overallScore,
    dayStreak: syncedWellnessStats.dayStreak,
    totalActivities: syncedWellnessStats.totalActivities,
    weeklyAverage: syncedWellnessStats.weeklyAverage
  } : null;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasWellnessTrackingEnabled = useCallback(() => {
    if (!user) return false;
    return !!(
      user.wellnessSettings?.trackMood || 
      user.wellnessSettings?.trackStress ||
      user.wellnessSettings?.allowWellnessInsights
    );
  }, [user]);



  const addMoodEntry = useCallback(async (entry: Omit<MoodEntry, 'id'>): Promise<boolean> => {
    if (!user || !hasWellnessTrackingEnabled()) {
      setError('Wellness tracking is not enabled');
      return false;
    }

    // Use the sync version which handles offline/online scenarios
    const result = await syncAddMoodEntry({
      date: entry.date || new Date().toISOString(),
      createdAt: entry.createdAt || new Date().toISOString(),
      moodScore: entry.moodScore || entry.mood || 0,
      mood: entry.mood || entry.moodScore || 0,
      energy: entry.energy,
      stress: entry.stress,
      notes: entry.notes,
      tags: entry.tags,
      synced: false
    });

    if (!result) {
      setError('Failed to add mood entry');
    }

    return result;
  }, [user, hasWellnessTrackingEnabled, syncAddMoodEntry]);

  const updateWellnessGoal = useCallback(async (goalId: string, updates: Partial<WellnessGoal>): Promise<boolean> => {
    if (!user || !hasWellnessTrackingEnabled()) {
      setError('Wellness tracking is not enabled');
      return false;
    }

    // Use the sync version which handles offline/online scenarios
    const result = await syncUpdateWellnessGoal(goalId, updates);

    if (!result) {
      setError('Failed to update wellness goal');
    }

    return result;
  }, [user, hasWellnessTrackingEnabled, syncUpdateWellnessGoal]);

  const refreshData = useCallback(async () => {
    await syncData(); // Use sync data instead
  }, [syncData]);

  // Legacy data fetching for non-synced data types
  const fetchLegacyData = useCallback(async () => {
    if (!user || !hasWellnessTrackingEnabled()) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      // Fetch stress, sleep, and social entries (not yet migrated to sync)
      const [stressResponse, sleepResponse, socialResponse] = await Promise.all([
        fetch('/api/v1/wellness/stress/history', { headers }).catch(() => null),
        fetch('/api/v1/wellness/sleep/history', { headers }).catch(() => null),
        fetch('/api/v1/wellness/social/history', { headers }).catch(() => null)
      ]);

      if (stressResponse?.ok) {
        const stressData = await stressResponse.json();
        setStressEntries(Array.isArray(stressData) ? stressData : []);
      }

      if (sleepResponse?.ok) {
        const sleepData = await sleepResponse.json();
        setSleepEntries(Array.isArray(sleepData) ? sleepData : []);
      }

      if (socialResponse?.ok) {
        const socialData = await socialResponse.json();
        setSocialEntries(Array.isArray(socialData) ? socialData : []);
      }

    } catch (err) {
      console.error('Error fetching legacy wellness data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, hasWellnessTrackingEnabled]);

  // Fetch legacy data when user changes
  useEffect(() => {
    fetchLegacyData();
  }, [fetchLegacyData]);

  const hasData = moodEntries.length > 0 || wellnessGoals.length > 0 || 
                  stressEntries.length > 0 || sleepEntries.length > 0 || socialEntries.length > 0;

  return {
    moodEntries,
    stressEntries,
    sleepEntries,
    socialEntries,
    wellnessGoals,
    wellnessStats,
    loading: loading || syncStatus.syncInProgress,
    error: error || (syncStatus.errors.length > 0 ? syncStatus.errors[0] : null),
    hasData: hasData && hasWellnessTrackingEnabled(),
    syncStatus,
    
    addMoodEntry,
    updateWellnessGoal,
    refreshData,
    clearError,
  };
}