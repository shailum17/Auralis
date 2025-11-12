'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface StressAnalytics {
  averageStressLevel: number;
  trend: 'improving' | 'stable' | 'declining' | null;
  totalEntries: number;
  commonTriggers: Array<{ trigger: string; count: number }>;
  commonSymptoms: Array<{ symptom: string; count: number }>;
  effectiveCoping: Array<{ coping: string; count: number }>;
  highStressDays: number;
}

export default function StressAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StressAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/wellness/stress/analytics', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading stress analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalEntries === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Stress Data Yet</h3>
        <p className="text-gray-600 mb-4">
          Start tracking your stress to see analytics and insights.
        </p>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (analytics.trend === 'improving') {
      return (
        <div className="flex items-center text-green-600">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="font-semibold">Improving</span>
        </div>
      );
    } else if (analytics.trend === 'declining') {
      return (
        <div className="flex items-center text-red-600">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          <span className="font-semibold">Declining</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-blue-600">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
          <span className="font-semibold">Stable</span>
        </div>
      );
    }
  };

  const getStressColor = (level: number) => {
    if (level >= 4) return 'text-red-600 bg-red-50';
    if (level >= 3) return 'text-orange-600 bg-orange-50';
    if (level >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white"
      >
        <h2 className="text-2xl font-bold mb-6">Stress Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm opacity-90 mb-2">Average Stress Level</div>
            <div className="text-4xl font-bold">{analytics.averageStressLevel.toFixed(1)}/5</div>
          </div>
          <div>
            <div className="text-sm opacity-90 mb-2">Trend</div>
            <div className="text-2xl font-bold">{getTrendIcon()}</div>
          </div>
          <div>
            <div className="text-sm opacity-90 mb-2">High Stress Days</div>
            <div className="text-4xl font-bold">{analytics.highStressDays}</div>
            <div className="text-sm opacity-75">out of {analytics.totalEntries} days</div>
          </div>
        </div>
      </motion.div>

      {/* Top Triggers */}
      {analytics.commonTriggers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Top Stress Triggers
          </h3>
          <div className="space-y-3">
            {analytics.commonTriggers.map((trigger, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{trigger.trigger}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{trigger.count} times</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(trigger.count / analytics.totalEntries) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Common Symptoms */}
      {analytics.commonSymptoms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Common Symptoms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analytics.commonSymptoms.map((symptom, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-900">{symptom.symptom}</span>
                <span className="text-sm text-red-600 font-semibold">{symptom.count}x</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Effective Coping Strategies */}
      {analytics.effectiveCoping.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your Most Used Coping Strategies
          </h3>
          <div className="space-y-3">
            {analytics.effectiveCoping.map((coping, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{coping.coping}</div>
                    <div className="text-sm text-gray-600">Used {coping.count} times</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">#{index + 1}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Keep using what works! These strategies have been most helpful for you.
            </p>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Personalized Recommendations
        </h3>
        <div className="space-y-3">
          {analytics.averageStressLevel >= 4 && (
            <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded">
              <p className="font-semibold text-red-900">⚠️ High Stress Alert</p>
              <p className="text-sm text-red-800 mt-1">
                Your average stress level is high. Consider speaking with a counselor or mental health professional.
              </p>
            </div>
          )}
          {analytics.trend === 'declining' && (
            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
              <p className="font-semibold text-yellow-900">📉 Stress Increasing</p>
              <p className="text-sm text-yellow-800 mt-1">
                Your stress levels have been rising. Try to identify new triggers and increase use of coping strategies.
              </p>
            </div>
          )}
          {analytics.trend === 'improving' && (
            <div className="p-4 bg-green-100 border-l-4 border-green-500 rounded">
              <p className="font-semibold text-green-900">✅ Great Progress!</p>
              <p className="text-sm text-green-800 mt-1">
                Your stress levels are improving. Keep up the good work with your coping strategies!
              </p>
            </div>
          )}
          {analytics.highStressDays > analytics.totalEntries * 0.5 && (
            <div className="p-4 bg-orange-100 border-l-4 border-orange-500 rounded">
              <p className="font-semibold text-orange-900">🔔 Frequent High Stress</p>
              <p className="text-sm text-orange-800 mt-1">
                You've had many high-stress days recently. Consider exploring additional stress management resources.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
