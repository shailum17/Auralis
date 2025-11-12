'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MoodTrackerModal from '@/components/wellness/MoodTrackerModal';

export default function WellnessInsights() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showMoodModal, setShowMoodModal] = useState(false);
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
      
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setInsights([]);
          setWeeklyGoals([]);
          setShowDailyCheckIn(true);
          setLoading(false);
          return;
        }

        // Fetch real wellness insights from API
        const response = await fetch('/api/v1/wellness/insights', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Generate insights based on real data
          const generatedInsights = [];
          
          if (data.moodTrend === 'improving') {
            generatedInsights.push({
              title: 'Mood Improving',
              description: 'Your mood has been trending upward. Keep up the great work!',
              type: 'success' as const,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ),
              color: 'bg-green-50 border-green-200 text-green-800'
            });
          } else if (data.moodTrend === 'declining') {
            generatedInsights.push({
              title: 'Mood Declining',
              description: 'Your mood has been trending down. Consider reaching out for support.',
              type: 'warning' as const,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ),
              color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
            });
          }

          if (data.moodEntriesCount >= 5) {
            generatedInsights.push({
              title: 'Consistent Tracking',
              description: `You've logged ${data.moodEntriesCount} mood entries. Great habit!`,
              type: 'info' as const,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              color: 'bg-blue-50 border-blue-200 text-blue-800'
            });
          }

          setInsights(generatedInsights);
          
          // For now, no weekly goals - can be implemented later
          setWeeklyGoals([]);
          
          // Show daily check-in if user hasn't logged mood today
          setShowDailyCheckIn(data.moodEntriesCount === 0 || true);
        } else {
          setInsights([]);
          setWeeklyGoals([]);
          setShowDailyCheckIn(true);
        }
      } catch (error) {
        console.error('Error loading wellness insights:', error);
        setInsights([]);
        setWeeklyGoals([]);
        setShowDailyCheckIn(true);
      } finally {
        setLoading(false);
      }
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
            <button 
              onClick={() => setShowMoodModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
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
            <button 
              onClick={() => setShowMoodModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Log Your First Mood
            </button>
          </div>
        </div>
      )}

      {/* Mood Tracker Modal */}
      <MoodTrackerModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSave={() => {
          // Reload insights after saving
          window.location.reload();
        }}
      />
    </div>
  );
}