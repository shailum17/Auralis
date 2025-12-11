'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Progress,
  LineChart,
  BarChart,
} from '@/components/ui';

interface WellnessHistoryData {
  moodHistory: Array<{
    date: string;
    mood: number;
    energy: number;
    stress: number;
    notes?: string;
  }>;
  sleepHistory: Array<{
    date: string;
    duration: number;
    quality: number;
    bedtime: string;
    wakeTime: string;
  }>;
  goalHistory: Array<{
    weekStart: string;
    weekEnd: string;
    goals: Array<{
      name: string;
      target: number;
      achieved: number;
      category: string;
    }>;
  }>;
  stressHistory: Array<{
    date: string;
    level: number;
    triggers: string[];
    copingStrategies: string[];
  }>;
}

export default function WellnessHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [historyData, setHistoryData] = useState<WellnessHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWellnessHistory();
    }
  }, [isAuthenticated, user, selectedTimeframe]);

  const fetchWellnessHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const days = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 90;

      // Fetch mood history
      const moodResponse = await apiClient.request(`/wellness/mood/history?days=${days}`, {
        method: 'GET'
      });

      // Fetch sleep history
      const sleepResponse = await apiClient.request(`/wellness/sleep/history?days=${days}`, {
        method: 'GET'
      });

      // Fetch stress history
      const stressResponse = await apiClient.request(`/wellness/stress/history?days=${days}`, {
        method: 'GET'
      });

      // Fetch goal history
      const weeks = selectedTimeframe === 'week' ? 1 : selectedTimeframe === 'month' ? 4 : 12;
      const goalResponse = await apiClient.request(`/wellness/goals/history?weeks=${weeks}`, {
        method: 'GET'
      });

      setHistoryData({
        moodHistory: (moodResponse.success && Array.isArray(moodResponse.data)) ? moodResponse.data : [],
        sleepHistory: (sleepResponse.success && Array.isArray(sleepResponse.data)) ? sleepResponse.data : [],
        stressHistory: (stressResponse.success && Array.isArray(stressResponse.data)) ? stressResponse.data : [],
        goalHistory: (goalResponse.success && Array.isArray(goalResponse.data)) ? goalResponse.data : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wellness history');
    } finally {
      setLoading(false);
    }
  };

  const transformMoodDataForChart = (moodData: any[]) => {
    // Only use genuine user records with valid dates and data
    const validEntries = moodData.filter(entry => {
      const hasValidDate = entry.date || entry.createdAt;
      const hasValidData = (entry.moodScore || entry.mood) !== undefined;
      return hasValidDate && hasValidData;
    });
    
    if (validEntries.length === 0) return [];
    
    return validEntries.map(entry => {
      // Use the actual date from the entry
      const entryDate = new Date(entry.date || entry.createdAt);
      
      // Skip entries with invalid dates
      if (isNaN(entryDate.getTime())) {
        console.warn('Invalid date found in entry:', entry);
        return null;
      }
      
      return {
        date: entryDate.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        mood: entry.mood || entry.moodScore || 0,
        energy: entry.energy || 0,
        stress: entry.stress || 0,
      };
    }).filter(Boolean); // Remove any null entries from invalid dates
  };

  const transformSleepDataForChart = (sleepData: any[]) => {
    return sleepData.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      duration: entry.duration || 0,
      quality: entry.quality || 0,
    }));
  };

  const calculateAverages = () => {
    if (!historyData?.moodHistory.length) return null;

    const moodSum = historyData.moodHistory.reduce((sum, entry) => sum + (entry.mood || 0), 0);
    const energySum = historyData.moodHistory.reduce((sum, entry) => sum + (entry.energy || 0), 0);
    const stressSum = historyData.moodHistory.reduce((sum, entry) => sum + (entry.stress || 0), 0);
    const count = historyData.moodHistory.length;

    return {
      avgMood: (moodSum / count).toFixed(1),
      avgEnergy: (energySum / count).toFixed(1),
      avgStress: (stressSum / count).toFixed(1),
    };
  };

  const averages = calculateAverages();

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to view your wellness history.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Wellness History</h1>
                <p className="text-lg text-gray-600 mt-2">
                  Track your wellness journey over time
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last 3 Months</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading wellness history...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <p className="text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Summary Stats */}
              {averages && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Average Mood</p>
                          <p className="text-2xl font-bold text-green-600">{averages.avgMood}/10</p>
                        </div>
                        <div className="text-3xl">😊</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Average Energy</p>
                          <p className="text-2xl font-bold text-blue-600">{averages.avgEnergy}/10</p>
                        </div>
                        <div className="text-3xl">⚡</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Average Stress</p>
                          <p className="text-2xl font-bold text-red-600">{averages.avgStress}/10</p>
                        </div>
                        <div className="text-3xl">😰</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Mood Trends */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {historyData?.moodHistory.length ? (
                    <LineChart
                      title="Mood & Energy Trends"
                      description="Track your emotional wellbeing over time"
                      data={transformMoodDataForChart(historyData.moodHistory)}
                      lines={[
                        { dataKey: 'mood', name: 'Mood', color: '#22c55e' },
                        { dataKey: 'energy', name: 'Energy', color: '#3b82f6' },
                        { dataKey: 'stress', name: 'Stress', color: '#ef4444' },
                      ]}
                      xAxisKey="date"
                      height={300}
                      curved
                    />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Mood & Energy Trends</CardTitle>
                        <CardDescription>No mood data available for this period</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-4">📊</div>
                          <p className="text-gray-600">Start tracking your mood to see trends here</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>

                {/* Sleep Trends */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {historyData?.sleepHistory.length ? (
                    <LineChart
                      title="Sleep Patterns"
                      description="Monitor your sleep duration and quality"
                      data={transformSleepDataForChart(historyData.sleepHistory)}
                      lines={[
                        { dataKey: 'duration', name: 'Duration (hrs)', color: '#8b5cf6' },
                        { dataKey: 'quality', name: 'Quality', color: '#06b6d4' },
                      ]}
                      xAxisKey="date"
                      height={300}
                      curved
                    />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sleep Patterns</CardTitle>
                        <CardDescription>No sleep data available for this period</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-4">😴</div>
                          <p className="text-gray-600">Start tracking your sleep to see patterns here</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </div>

              {/* Goal History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Goal Achievement History</CardTitle>
                    <CardDescription>
                      Your wellness goal progress over the selected timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historyData?.goalHistory.length ? (
                      <div className="space-y-6">
                        {historyData.goalHistory.map((week, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Week of {new Date(week.weekStart).toLocaleDateString()}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {week.goals.map((goal, goalIndex) => (
                                <div key={goalIndex} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">{goal.name}</span>
                                    <Badge
                                      variant={goal.achieved >= goal.target ? 'success' : 'warning'}
                                      size="sm"
                                    >
                                      {Math.round((goal.achieved / goal.target) * 100)}%
                                    </Badge>
                                  </div>
                                  <Progress
                                    value={(goal.achieved / goal.target) * 100}
                                    variant={goal.achieved >= goal.target ? 'success' : 'primary'}
                                    size="sm"
                                  />
                                  <p className="text-sm text-gray-600 mt-1">
                                    {goal.achieved} / {goal.target}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goal History</h3>
                        <p className="text-gray-600">Start setting wellness goals to track your progress here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Entries */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Wellness Entries</CardTitle>
                    <CardDescription>
                      Your latest mood and wellness logs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historyData?.moodHistory.length ? (
                      <div className="space-y-4">
                        {historyData.moodHistory.slice(0, 10).map((entry, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">
                                {entry.mood >= 8 ? '😊' : entry.mood >= 6 ? '😐' : entry.mood >= 4 ? '😕' : '😢'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {new Date(entry.date).toLocaleDateString('en', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                                {entry.notes && (
                                  <p className="text-sm text-gray-600">{entry.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-4 text-sm">
                              <div className="text-center">
                                <p className="text-gray-600">Mood</p>
                                <p className="font-semibold text-green-600">{entry.mood}/10</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600">Energy</p>
                                <p className="font-semibold text-blue-600">{entry.energy}/10</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600">Stress</p>
                                <p className="font-semibold text-red-600">{entry.stress}/10</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Entries Yet</h3>
                        <p className="text-gray-600 mb-4">Start logging your daily mood to see your history here</p>
                        <Button variant="primary">Log Today's Mood</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}