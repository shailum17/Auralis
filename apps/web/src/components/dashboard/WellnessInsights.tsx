'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { DynamicProfileService } from '@/lib/dynamic-profile-service';

export default function WellnessInsights() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Array<{
    title: string;
    description: string;
    type: 'warning' | 'success' | 'info';
    icon: React.ReactNode;
    color: string;
  }>>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<Array<{
    name: string;
    progress: number;
    target: number;
    current: number;
  }>>([]);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);

  useEffect(() => {
    const loadWellnessData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Get dynamic wellness insights and goals
      const userInsights = DynamicProfileService.getUserWellnessInsights(user);
      const userGoals = DynamicProfileService.getUserWeeklyGoals(user);
      const shouldShowCheckIn = DynamicProfileService.shouldShowDailyCheckIn(user);
      
      setInsights(userInsights);
      setWeeklyGoals(userGoals);
      setShowDailyCheckIn(shouldShowCheckIn);
      
      setLoading(false);
    };

    loadWellnessData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellness Insights</h3>
      
      {/* AI Insights */}
      <div className="space-y-3 mb-6">
        {insights.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-2">No insights yet</p>
            <p className="text-xs text-gray-500">
              Start tracking your wellness to get personalized insights
            </p>
          </div>
        ) : (
          insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`p-3 rounded-lg border shadow-md hover:shadow-lg transition-all duration-200 ${insight.color}`}
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs mt-1 opacity-90">{insight.description}</p>
              </div>
            </div>
          </motion.div>
          ))
        )}
      </div>

      {/* Weekly Goals */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Weekly Goals</h4>
        <div className="space-y-3">
          {weeklyGoals.length === 0 ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">No goals set</p>
              <p className="text-xs text-gray-500">
                Set weekly wellness goals to track your progress
              </p>
            </div>
          ) : (
            weeklyGoals.map((goal, index) => (
            <motion.div
              key={goal.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{goal.name}</span>
                <span className="text-xs text-gray-500">{goal.current}/{goal.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`h-2 rounded-full ${
                    goal.progress >= 80 ? 'bg-green-500' : 
                    goal.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Quick Action - Only show if user should do daily check-in */}
      {showDailyCheckIn && (
        <div className="mt-6 p-3 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Ready for your daily check-in?</p>
              <p className="text-xs text-blue-700">Track your mood and get personalized insights</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
              Start
            </button>
          </div>
        </div>
      )}

      {/* Empty state action when no data */}
      {insights.length === 0 && weeklyGoals.length === 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Start Your Wellness Journey</h4>
            <p className="text-xs text-gray-600 mb-3">
              Begin tracking your mood and wellness to unlock personalized insights and goals.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Log Your First Mood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}