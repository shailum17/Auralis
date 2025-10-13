'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

export interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  stress: number; // 1-10 scale
  notes?: string;
  tags?: string[];
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
  wellnessGoals: WellnessGoal[];
  wellnessStats: WellnessStats | null;
  loading: boolean;
  error: string | null;
  hasData: boolean;
  
  // Actions
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => Promise<boolean>;
  updateWellnessGoal: (goalId: string, updates: Partial<WellnessGoal>) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export function useWellnessData(): UseWellnessDataReturn {
  const { user } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [wellnessGoals, setWellnessGoals] = useState<WellnessGoal[]>([]);
  const [wellnessStats, setWellnessStats] = useState<WellnessStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasWellnessTrackingEnabled = useCallback(() => {
    return !!(
      user?.wellnessSettings?.trackMood || 
      user?.wellnessSettings?.trackStress ||
      user?.wellnessSettings?.allowWellnessInsights
    );
  }, [user]);

  const fetchWellnessData = useCallback(async () => {
    if (!user || !hasWellnessTrackingEnabled()) {
      setMoodEntries([]);
      setWellnessGoals([]);
      setWellnessStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch mood entries
      const moodResponse = await apiClient.request<MoodEntry[]>('/wellness/mood-entries', {
        method: 'GET'
      });

      if (moodResponse.success && moodResponse.data) {
        setMoodEntries(moodResponse.data);
      }

      // Fetch wellness goals
      const goalsResponse = await apiClient.request<WellnessGoal[]>('/wellness/goals', {
        method: 'GET'
      });

      if (goalsResponse.success && goalsResponse.data) {
        setWellnessGoals(goalsResponse.data);
      }

      // Fetch wellness stats
      const statsResponse = await apiClient.request<WellnessStats>('/wellness/stats', {
        method: 'GET'
      });

      if (statsResponse.success && statsResponse.data) {
        setWellnessStats(statsResponse.data);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wellness data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, hasWellnessTrackingEnabled]);

  const addMoodEntry = useCallback(async (entry: Omit<MoodEntry, 'id'>): Promise<boolean> => {
    if (!user || !hasWellnessTrackingEnabled()) {
      setError('Wellness tracking is not enabled');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request<MoodEntry>('/wellness/mood-entries', {
        method: 'POST',
        body: JSON.stringify(entry)
      });

      if (response.success && response.data) {
        setMoodEntries(prev => [response.data!, ...prev]);
        // Refresh stats after adding new entry
        await fetchWellnessData();
        return true;
      } else {
        setError(response.error || 'Failed to add mood entry');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add mood entry';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, hasWellnessTrackingEnabled, fetchWellnessData]);

  const updateWellnessGoal = useCallback(async (goalId: string, updates: Partial<WellnessGoal>): Promise<boolean> => {
    if (!user || !hasWellnessTrackingEnabled()) {
      setError('Wellness tracking is not enabled');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request<WellnessGoal>(`/wellness/goals/${goalId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      if (response.success && response.data) {
        setWellnessGoals(prev => 
          prev.map(goal => goal.id === goalId ? response.data! : goal)
        );
        return true;
      } else {
        setError(response.error || 'Failed to update wellness goal');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update wellness goal';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, hasWellnessTrackingEnabled]);

  const refreshData = useCallback(async () => {
    await fetchWellnessData();
  }, [fetchWellnessData]);

  // Fetch data when user changes or wellness settings change
  useEffect(() => {
    fetchWellnessData();
  }, [fetchWellnessData]);

  const hasData = moodEntries.length > 0 || wellnessGoals.length > 0;

  return {
    moodEntries,
    wellnessGoals,
    wellnessStats,
    loading,
    error,
    hasData: hasData && hasWellnessTrackingEnabled(),
    
    addMoodEntry,
    updateWellnessGoal,
    refreshData,
    clearError,
  };
}