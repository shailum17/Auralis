'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WellnessData() {
  const [timeRange, setTimeRange] = useState('30days');

  const wellnessStats = {
    averageMood: 7.8,
    moodTrend: '+0.5',
    stressLevel: 6.2,
    stressTrend: '-0.8',
    sleepQuality: 7.5,
    sleepTrend: '+1.2',
    socialConnection: 8.1,
    socialTrend: '+0.3'
  };

  const moodHistory = [
    { date: '2024-01-15', mood: 8, note: 'Great day with friends!' },
    { date: '2024-01-14', mood: 6, note: 'Stressed about upcoming exam' },
    { date: '2024-01-13', mood: 9, note: 'Aced my presentation!' },
    { date: '2024-01-12', mood: 7, note: 'Normal day, feeling okay' },
    { date: '2024-01-11', mood: 5, note: 'Feeling overwhelmed with coursework' },
    { date: '2024-01-10', mood: 8, note: 'Study group was really helpful' },
    { date: '2024-01-09', mood: 7, note: 'Good workout session' },
    { date: '2024-01-08', mood: 6, note: 'Missing home a bit' }
  ];

  const stressFactors = [
    { factor: 'Academic Workload', level: 8, color: 'bg-red-500' },
    { factor: 'Social Situations', level: 4, color: 'bg-yellow-500' },
    { factor: 'Financial Concerns', level: 6, color: 'bg-orange-500' },
    { factor: 'Family Expectations', level: 7, color: 'bg-red-400' },
    { factor: 'Future Career', level: 5, color: 'bg-yellow-400' }
  ];

  const wellnessGoals = [
    { goal: 'Daily Mood Check-in', current: 25, target: 30, unit: 'days' },
    { goal: 'Stress Management', current: 18, target: 20, unit: 'sessions' },
    { goal: 'Social Activities', current: 12, target: 15, unit: 'events' },
    { goal: 'Sleep Quality', current: 7.5, target: 8.0, unit: 'avg rating' }
  ];

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