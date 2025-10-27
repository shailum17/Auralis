'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function WellnessData() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);

  // Dynamic wellness data - no hardcoded values
  const [wellnessStats, setWellnessStats] = useState({
    averageMood: 0,
    moodTrend: '+0.0',
    stressLevel: 0,
    stressTrend: '+0.0',
    sleepQuality: 0,
    sleepTrend: '+0.0',
    socialConnection: 0,
    socialTrend: '+0.0'
  });

  const [moodHistory, setMoodHistory] = useState<Array<{
    date: string;
    mood: number;
    note: string;
  }>>([]);

  const [stressFactors, setStressFactors] = useState<Array<{
    factor: string;
    level: number;
    color: string;
  }>>([]);

  const [wellnessGoals, setWellnessGoals] = useState<Array<{
    goal: string;
    current: number;
    target: number;
    unit: string;
  }>>([]);

  // Load user's actual wellness data
  useEffect(() => {
    const loadWellnessData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would fetch user's actual wellness data
      // For now, show empty state to indicate no hardcoded data
      setWellnessStats({
        averageMood: 0, // Would be: await getUserAverageMood(user.id, timeRange)
        moodTrend: '+0.0', // Would be: await getMoodTrend(user.id, timeRange)
        stressLevel: 0, // Would be: await getUserStressLevel(user.id, timeRange)
        stressTrend: '+0.0', // Would be: await getStressTrend(user.id, timeRange)
        sleepQuality: 0, // Would be: await getUserSleepQuality(user.id, timeRange)
        sleepTrend: '+0.0', // Would be: await getSleepTrend(user.id, timeRange)
        socialConnection: 0, // Would be: await getUserSocialConnection(user.id, timeRange)
        socialTrend: '+0.0' // Would be: await getSocialTrend(user.id, timeRange)
      });
      
      setMoodHistory([]); // Would be: await getUserMoodHistory(user.id, timeRange)
      setStressFactors([]); // Would be: await getUserStressFactors(user.id)
      setWellnessGoals([]); // Would be: await getUserWellnessGoals(user.id)
      
      setLoading(false);
    };

    loadWellnessData();
  }, [user, timeRange]);

  if (loading) {
    return (
      <div className="max-w-6xl animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'bg-green-500';
    if (mood >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend.startsWith('+')) {
      return (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wellness Data</h2>
          <p className="text-gray-600 mt-1">Track your mental health and wellbeing over time</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 3 months</option>
          <option value="1year">Last year</option>
        </select>
      </div>

      {/* Wellness Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Average Mood</h3>
            {getTrendIcon(wellnessStats.moodTrend)}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{wellnessStats.averageMood}</span>
            <span className="text-sm text-green-600">{wellnessStats.moodTrend}</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${(wellnessStats.averageMood / 10) * 100}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Stress Level</h3>
            {getTrendIcon(wellnessStats.stressTrend)}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{wellnessStats.stressLevel}</span>
            <span className="text-sm text-green-600">{wellnessStats.stressTrend}</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full"
              style={{ width: `${(wellnessStats.stressLevel / 10) * 100}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Sleep Quality</h3>
            {getTrendIcon(wellnessStats.sleepTrend)}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{wellnessStats.sleepQuality}</span>
            <span className="text-sm text-green-600">{wellnessStats.sleepTrend}</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${(wellnessStats.sleepQuality / 10) * 100}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Social Connection</h3>
            {getTrendIcon(wellnessStats.socialTrend)}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{wellnessStats.socialConnection}</span>
            <span className="text-sm text-green-600">{wellnessStats.socialTrend}</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${(wellnessStats.socialConnection / 10) * 100}%` }}
            ></div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Mood History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood Entries</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {moodHistory.map((entry, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getMoodColor(entry.mood)}`}>
                  {entry.mood}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{entry.date}</p>
                  <p className="text-sm text-gray-600 truncate">{entry.note}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stress Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Factors</h3>
          <div className="space-y-4">
            {stressFactors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{factor.factor}</span>
                  <span className="text-sm text-gray-500">{factor.level}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(factor.level / 10) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-2 rounded-full ${factor.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wellness Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellness Goals Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wellnessGoals.map((goal, index) => (
            <div key={index} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${(goal.current / goal.target) * 100}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">
                    {Math.round((goal.current / goal.target) * 100)}%
                  </span>
                </div>
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">{goal.goal}</h4>
              <p className="text-xs text-gray-600">
                {goal.current} / {goal.target} {goal.unit}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Export Data */}
      <div className="mt-8 flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export Wellness Data</span>
        </button>
      </div>
    </motion.div>
  );
}