'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface WellnessMetric {
  name: string;
  value: number;
  change: string;
  color: string;
}

interface MoodEntry {
  date: string;
  mood: number;
  note: string;
}

interface WellnessData {
  overallScore: number;
  trend: string;
  metrics: WellnessMetric[];
  recentEntries: MoodEntry[];
}

export default function WellnessOverview() {
  const { user } = useAuth();
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    overallScore: 0,
    trend: '+0.0',
    metrics: [
      { name: 'Mood', value: 0, change: '+0.0', color: 'bg-green-500' },
      { name: 'Stress', value: 0, change: '+0.0', color: 'bg-yellow-500' },
      { name: 'Sleep', value: 0, change: '+0.0', color: 'bg-blue-500' },
      { name: 'Social', value: 0, change: '+0.0', color: 'bg-purple-500' },
    ],
    recentEntries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user-specific wellness data
    const loadWellnessData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, show placeholder data that indicates it's user-specific
      setWellnessData({
        overallScore: 0,
        trend: '+0.0',
        metrics: [
          { name: 'Mood', value: 0, change: '+0.0', color: 'bg-green-500' },
          { name: 'Stress', value: 0, change: '+0.0', color: 'bg-yellow-500' },
          { name: 'Sleep', value: 0, change: '+0.0', color: 'bg-blue-500' },
          { name: 'Social', value: 0, change: '+0.0', color: 'bg-purple-500' },
        ],
        recentEntries: []
      });
      
      setLoading(false);
    };

    loadWellnessData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Wellness Overview</h2>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-green-600">{wellnessData.overallScore}</span>
          <div className="flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            {wellnessData.trend}
          </div>
        </div>
      </div>

      {/* Wellness Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {wellnessData.metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{metric.name}</span>
              <div className={`w-3 h-3 rounded-full ${metric.color}`}></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">{metric.value}</span>
              <span className={`text-xs ${
                metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${metric.color}`}
                style={{ width: `${(metric.value / 10) * 100}%` }}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Mood Entries */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood Entries</h3>
        {wellnessData.recentEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No mood entries yet</h4>
            <p className="text-gray-600 mb-4">Start tracking your wellness by recording your first mood entry.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wellnessData.recentEntries.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    entry.mood >= 8 ? 'bg-green-500' : entry.mood >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {entry.mood}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{entry.date}</p>
                  <p className="text-sm text-gray-600 truncate">{entry.note}</p>
                </div>
                <div className="flex-shrink-0">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Mood Entry */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
        <h4 className="text-sm font-medium text-blue-900 mb-3">How are you feeling today?</h4>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
            <button
              key={mood}
              className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 hover:border-blue-400 flex items-center justify-center text-sm font-medium text-blue-700 transition-colors"
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}