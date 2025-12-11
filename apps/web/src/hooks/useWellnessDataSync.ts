'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface WellnessDataSyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  pendingChanges: number;
  errors: string[];
}

export interface SyncedMoodEntry {
  id: string;
  date: string;
  createdAt: string;
  moodScore: number;
  mood: number; // Backward compatibility
  energy?: number;
  stress?: number;
  notes?: string;
  tags?: string[];
  synced: boolean;
  localId?: string; // For offline entries
}

export interface SyncedWellnessGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  category: 'mood' | 'sleep' | 'exercise' | 'meditation' | 'other';
  synced: boolean;
  localId?: string;
}

export interface SyncedWellnessStats {
  overallScore: number;
  dayStreak: number;
  totalActivities: number;
  weeklyAverage: {
    mood: number;
    energy: number;
    stress: number;
  };
  lastCalculated: Date;
  synced: boolean;
}

interface UseWellnessDataSyncReturn {
  // Data
  moodEntries: SyncedMoodEntry[];
  wellnessGoals: SyncedWellnessGoal[];
  wellnessStats: SyncedWellnessStats | null;
  
  // Sync status
  syncStatus: WellnessDataSyncStatus;
  
  // Actions
  syncData: () => Promise<void>;
  addMoodEntry: (entry: Omit<SyncedMoodEntry, 'id' | 'synced' | 'localId'>) => Promise<boolean>;
  updateWellnessGoal: (goalId: string, updates: Partial<SyncedWellnessGoal>) => Promise<boolean>;
  
  // Utilities
  clearSyncErrors: () => void;
  forceSyncAll: () => Promise<void>;
  getUnsyncedData: () => { moodEntries: SyncedMoodEntry[]; goals: SyncedWellnessGoal[] };
}

export function useWellnessDataSync(): UseWellnessDataSyncReturn {
  const { user } = useAuth();
  
  // Data state
  const [moodEntries, setMoodEntries] = useState<SyncedMoodEntry[]>([]);
  const [wellnessGoals, setWellnessGoals] = useState<SyncedWellnessGoal[]>([]);
  const [wellnessStats, setWellnessStats] = useState<SyncedWellnessStats | null>(null);
  
  // Sync status state
  const [syncStatus, setSyncStatus] = useState<WellnessDataSyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    syncInProgress: false,
    pendingChanges: 0,
    errors: []
  });
  
  // Refs for managing sync operations
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Local storage keys
  const STORAGE_KEYS = {
    moodEntries: `wellness_mood_entries_${user?.id}`,
    goals: `wellness_goals_${user?.id}`,
    stats: `wellness_stats_${user?.id}`,
    lastSync: `wellness_last_sync_${user?.id}`
  };

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      syncData(); // Auto-sync when coming back online
    };
    
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached data on mount
  useEffect(() => {
    if (!user) return;
    
    loadCachedData();
  }, [user]);

  // Auto-sync every 5 minutes when online
  useEffect(() => {
    if (!syncStatus.isOnline || !user) return;
    
    const interval = setInterval(() => {
      syncData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [syncStatus.isOnline, user]);

  const loadCachedData = useCallback(() => {
    try {
      // Load mood entries
      const cachedMoodEntries = localStorage.getItem(STORAGE_KEYS.moodEntries);
      if (cachedMoodEntries) {
        setMoodEntries(JSON.parse(cachedMoodEntries));
      }

      // Load goals
      const cachedGoals = localStorage.getItem(STORAGE_KEYS.goals);
      if (cachedGoals) {
        setWellnessGoals(JSON.parse(cachedGoals));
      }

      // Load stats
      const cachedStats = localStorage.getItem(STORAGE_KEYS.stats);
      if (cachedStats) {
        const stats = JSON.parse(cachedStats);
        stats.lastCalculated = new Date(stats.lastCalculated);
        setWellnessStats(stats);
      }

      // Load last sync time
      const lastSyncTime = localStorage.getItem(STORAGE_KEYS.lastSync);
      if (lastSyncTime) {
        setSyncStatus(prev => ({ 
          ...prev, 
          lastSync: new Date(lastSyncTime) 
        }));
      }
    } catch (error) {
      console.error('Error loading cached wellness data:', error);
      setSyncStatus(prev => ({
        ...prev,
        errors: [...prev.errors, 'Failed to load cached data']
      }));
    }
  }, [user]);

  const saveCachedData = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.moodEntries, JSON.stringify(moodEntries));
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(wellnessGoals));
      if (wellnessStats) {
        localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(wellnessStats));
      }
      localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString());
    } catch (error) {
      console.error('Error saving cached wellness data:', error);
    }
  }, [moodEntries, wellnessGoals, wellnessStats]);

  const syncData = useCallback(async () => {
    if (!user || !syncStatus.isOnline || syncStatus.syncInProgress) {
      return;
    }

    // Cancel any existing sync operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setSyncStatus(prev => ({ 
      ...prev, 
      syncInProgress: true, 
      errors: [] 
    }));

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      // Fetch all data in parallel with timeout
      const fetchPromises = [
        fetch('/api/v1/wellness/mood/history', { headers, signal }),
        fetch('/api/v1/wellness/goals', { headers, signal }),
        fetch('/api/v1/wellness/insights', { headers, signal })
      ];

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sync timeout')), 10000); // 10 second timeout
      });

      const responses = await Promise.race([
        Promise.all(fetchPromises),
        timeoutPromise
      ]) as Response[];

      // Process mood entries
      if (responses[0].ok) {
        const moodData = await responses[0].json();
        const syncedMoodEntries: SyncedMoodEntry[] = (Array.isArray(moodData) ? moodData : []).map(entry => ({
          ...entry,
          date: entry.createdAt,
          mood: entry.moodScore || entry.mood || 0,
          synced: true
        }));
        setMoodEntries(syncedMoodEntries);
      } else {
        throw new Error(`Failed to fetch mood data: ${responses[0].status}`);
      }

      // Process wellness goals
      if (responses[1].ok) {
        const goalsData = await responses[1].json();
        const syncedGoals: SyncedWellnessGoal[] = (Array.isArray(goalsData) ? goalsData : []).map(goal => ({
          ...goal,
          synced: true
        }));
        setWellnessGoals(syncedGoals);
      } else {
        console.warn('Failed to fetch goals data:', responses[1].status);
        // Goals are optional, don't throw error
      }

      // Process wellness stats
      if (responses[2].ok) {
        const statsData = await responses[2].json();
        const syncedStats: SyncedWellnessStats = {
          overallScore: statsData.averageMood || 0,
          dayStreak: 0, // Calculate from mood entries
          totalActivities: statsData.moodEntriesCount || 0,
          weeklyAverage: {
            mood: statsData.averageMood || 0,
            energy: 0, // Calculate from mood entries
            stress: statsData.averageStress || 0
          },
          lastCalculated: new Date(),
          synced: true
        };

        // Calculate day streak from mood entries
        if (moodEntries.length > 0) {
          syncedStats.dayStreak = calculateDayStreak(moodEntries);
          syncedStats.weeklyAverage.energy = calculateAverageEnergy(moodEntries);
        }

        setWellnessStats(syncedStats);
      } else {
        console.warn('Failed to fetch stats data:', responses[2].status);
      }

      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date(),
        pendingChanges: 0,
        errors: []
      }));

      // Save to cache
      saveCachedData();

      console.log('✅ Wellness data synchronized successfully');

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Sync operation was cancelled');
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      console.error('❌ Wellness data sync failed:', errorMessage);
      
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        errors: [...prev.errors, errorMessage]
      }));
    }
  }, [user, syncStatus.isOnline, syncStatus.syncInProgress, moodEntries, saveCachedData]);

  const addMoodEntry = useCallback(async (entry: Omit<SyncedMoodEntry, 'id' | 'synced' | 'localId'>): Promise<boolean> => {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to local state immediately (optimistic update)
    const localEntry: SyncedMoodEntry = {
      ...entry,
      id: localId,
      localId,
      synced: false
    };
    
    setMoodEntries(prev => [localEntry, ...prev]);
    setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));

    if (!syncStatus.isOnline) {
      // Save to local storage for later sync
      saveCachedData();
      return true;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/v1/wellness/mood', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moodScore: entry.moodScore,
          energy: entry.energy,
          stress: entry.stress,
          notes: entry.notes,
          tags: entry.tags
        }),
      });

      if (response.ok) {
        const savedEntry = await response.json();
        
        // Update local entry with server data
        setMoodEntries(prev => prev.map(e => 
          e.localId === localId 
            ? { ...savedEntry, date: savedEntry.createdAt, mood: savedEntry.moodScore, synced: true }
            : e
        ));
        
        setSyncStatus(prev => ({ ...prev, pendingChanges: Math.max(0, prev.pendingChanges - 1) }));
        
        // Trigger a full sync to update stats
        setTimeout(() => syncData(), 1000);
        
        return true;
      } else {
        throw new Error(`Failed to save mood entry: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to save mood entry:', error);
      
      // Mark entry as failed but keep it for retry
      setMoodEntries(prev => prev.map(e => 
        e.localId === localId 
          ? { ...e, synced: false }
          : e
      ));
      
      setSyncStatus(prev => ({
        ...prev,
        errors: [...prev.errors, 'Failed to save mood entry']
      }));
      
      return false;
    }
  }, [syncStatus.isOnline, saveCachedData, syncData]);

  const updateWellnessGoal = useCallback(async (goalId: string, updates: Partial<SyncedWellnessGoal>): Promise<boolean> => {
    // Update local state immediately
    setWellnessGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, ...updates, synced: false }
        : goal
    ));

    if (!syncStatus.isOnline) {
      saveCachedData();
      return true;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/v1/wellness/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        
        setWellnessGoals(prev => prev.map(goal => 
          goal.id === goalId 
            ? { ...updatedGoal, synced: true }
            : goal
        ));
        
        return true;
      } else {
        throw new Error(`Failed to update goal: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to update wellness goal:', error);
      
      setSyncStatus(prev => ({
        ...prev,
        errors: [...prev.errors, 'Failed to update wellness goal']
      }));
      
      return false;
    }
  }, [syncStatus.isOnline, saveCachedData]);

  const clearSyncErrors = useCallback(() => {
    setSyncStatus(prev => ({ ...prev, errors: [] }));
  }, []);

  const forceSyncAll = useCallback(async () => {
    // Force sync all unsynced data
    const unsyncedMoodEntries = moodEntries.filter(entry => !entry.synced);
    const unsyncedGoals = wellnessGoals.filter(goal => !goal.synced);

    for (const entry of unsyncedMoodEntries) {
      if (entry.localId) {
        await addMoodEntry(entry);
      }
    }

    for (const goal of unsyncedGoals) {
      await updateWellnessGoal(goal.id, goal);
    }

    await syncData();
  }, [moodEntries, wellnessGoals, addMoodEntry, updateWellnessGoal, syncData]);

  const getUnsyncedData = useCallback(() => {
    return {
      moodEntries: moodEntries.filter(entry => !entry.synced),
      goals: wellnessGoals.filter(goal => !goal.synced)
    };
  }, [moodEntries, wellnessGoals]);

  // Helper functions
  const calculateDayStreak = (entries: SyncedMoodEntry[]): number => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  const calculateAverageEnergy = (entries: SyncedMoodEntry[]): number => {
    const entriesWithEnergy = entries.filter(entry => entry.energy !== undefined);
    if (entriesWithEnergy.length === 0) return 0;
    
    return entriesWithEnergy.reduce((sum, entry) => sum + (entry.energy || 0), 0) / entriesWithEnergy.length;
  };

  // Update pending changes count
  useEffect(() => {
    const pendingCount = moodEntries.filter(e => !e.synced).length + 
                        wellnessGoals.filter(g => !g.synced).length;
    
    setSyncStatus(prev => ({ ...prev, pendingChanges: pendingCount }));
  }, [moodEntries, wellnessGoals]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    moodEntries,
    wellnessGoals,
    wellnessStats,
    syncStatus,
    syncData,
    addMoodEntry,
    updateWellnessGoal,
    clearSyncErrors,
    forceSyncAll,
    getUnsyncedData
  };
}