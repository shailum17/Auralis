'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

import WellnessInsights from '@/components/dashboard/WellnessInsights';
import { useWellnessData } from '@/hooks/useWellnessData';
import { WellnessOnboarding } from '@/components/wellness/WellnessOnboarding';
import WellnessDataSync from '@/components/wellness/WellnessDataSync';
import MoodTrackerModal from '@/components/wellness/MoodTrackerModal';
import StressTrackerModal from '@/components/wellness/StressTrackerModal';
import SleepTrackerModal from '@/components/wellness/SleepTrackerModal';
import SocialTrackerModal from '@/components/wellness/SocialTrackerModal';
import WeeklyGoalsModal from '@/components/wellness/WeeklyGoalsModal';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Progress,
  CircularProgress,
  LineChart,
  BarChart,
} from '@/components/ui';

// Transform mood entries to chart data format with enhanced analytics
const transformMoodDataForChart = (moodEntries: any[]) => {
  if (!moodEntries || moodEntries.length === 0) return [];
  
  // Only use genuine user records - filter out any entries without valid dates
  const validEntries = moodEntries.filter(entry => {
    const hasValidDate = entry.date || entry.createdAt;
    const hasValidData = (entry.moodScore || entry.mood) !== undefined;
    return hasValidDate && hasValidData;
  });
  
  if (validEntries.length === 0) return [];
  
  // Sort by date (most recent first) and take last 14 entries
  const sortedEntries = validEntries
    .sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt);
      const dateB = new Date(b.date || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 14)
    .reverse(); // Reverse to show chronological order in chart
  
  const chartData = [];
  
  for (const entry of sortedEntries) {
    // Use the actual date from the entry
    const entryDate = new Date(entry.date || entry.createdAt);
    
    // Skip entries with invalid dates
    if (isNaN(entryDate.getTime())) {
      console.warn('Invalid date found in entry:', entry);
      continue;
    }
    
    chartData.push({
      day: entryDate.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
      mood: entry.moodScore || entry.mood || 0,
      energy: entry.energy || 0,
      stress: entry.stress || 0,
      // Add wellness score calculation
      wellnessScore: (entry.moodScore || entry.mood) && entry.stress ? 
        Math.round(((entry.moodScore || entry.mood) + (6 - entry.stress)) / 2 * 10) / 10 : 
        (entry.moodScore || entry.mood) || 0,
    });
  }
  
  return chartData;
};

// Calculate wellness trends and patterns
const calculateWellnessTrends = (moodEntries: any[]) => {
  if (!moodEntries || moodEntries.length < 3) return null;
  
  const recent = moodEntries.slice(0, 7);
  const previous = moodEntries.slice(7, 14);
  
  const recentAvg = recent.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / recent.length;
  const previousAvg = previous.length > 0 ? 
    previous.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / previous.length : recentAvg;
  
  const trend = recentAvg - previousAvg;
  const trendPercentage = previousAvg > 0 ? ((trend / previousAvg) * 100) : 0;
  
  return {
    trend: trend > 0.2 ? 'improving' : trend < -0.2 ? 'declining' : 'stable',
    percentage: Math.abs(trendPercentage),
    direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
  };
};

// Based on analysis of dashboard components and backend API
const wellnessActivities = [
  {
    id: 1,
    title: 'Mood Tracking',
    description: 'Track your daily emotions and identify patterns with mood avatars',
    icon: '😊',
    href: '/wellness/mood',
    status: 'available',
    color: 'primary',
    features: ['Daily mood logging', 'Mood patterns', 'Emotional insights', 'Quick mood entry']
  },
  {
    id: 2,
    title: 'Stress Management',
    description: 'Monitor stress levels, identify triggers, and track coping strategies',
    icon: '🌱',
    href: '/wellness/stress',
    status: 'available',
    color: 'warning',
    features: ['Stress level tracking', 'Trigger identification', 'Coping strategies', 'Stress analytics']
  },
  {
    id: 3,
    title: 'Sleep Tracking',
    description: 'Monitor your sleep patterns, quality, and duration',
    icon: '😴',
    href: '/wellness/sleep',
    status: 'available',
    color: 'info',
    features: ['Sleep quality tracking', 'Duration monitoring', 'Sleep issues logging', 'Sleep analytics']
  },
  {
    id: 4,
    title: 'Social Connection',
    description: 'Track social interactions and connection quality',
    icon: '👥',
    href: '/wellness/social',
    status: 'available',
    color: 'success',
    features: ['Connection quality', 'Social feelings', 'Interaction tracking', 'Social wellness']
  },
  {
    id: 5,
    title: 'Weekly Goals',
    description: 'Set and track personalized wellness goals',
    icon: '🎯',
    href: '#goals',
    status: 'available',
    color: 'primary',
    features: ['Goal setting', 'Progress tracking', 'Achievement celebration', 'Goal history']
  },
  {
    id: 6,
    title: 'Wellness Insights',
    description: 'AI-powered insights based on your wellness data',
    icon: '🧠',
    href: '#insights',
    status: 'available',
    color: 'info',
    features: ['Trend analysis', 'Pattern recognition', 'Personalized recommendations', 'Data visualization']
  },
  {
    id: 7,
    title: 'Meditation & Mindfulness',
    description: 'Guided meditation sessions and breathing exercises',
    icon: '🧘‍♀️',
    href: '/wellness/meditation',
    status: 'coming-soon',
    color: 'success',
    features: ['Guided sessions', 'Breathing exercises', 'Mindfulness practices', 'Progress tracking']
  },
  {
    id: 8,
    title: 'Exercise Planner',
    description: 'Personalized workout plans and activity tracking',
    icon: '💪',
    href: '/wellness/exercise',
    status: 'coming-soon',
    color: 'error',
    features: ['Workout plans', 'Activity tracking', 'Progress monitoring', 'Exercise recommendations']
  },
  {
    id: 9,
    title: 'Nutrition Guide',
    description: 'Healthy eating tips and meal planning assistance',
    icon: '🥗',
    href: '/wellness/nutrition',
    status: 'coming-soon',
    color: 'success',
    features: ['Meal planning', 'Nutrition tracking', 'Healthy recipes', 'Dietary recommendations']
  },
];

const wellnessTips = [
  {
    title: 'Take Regular Breaks',
    description: 'Step away from your studies every 25-30 minutes to refresh your mind.',
    category: 'Productivity',
  },
  {
    title: 'Practice Deep Breathing',
    description: 'Try the 4-7-8 breathing technique when feeling overwhelmed.',
    category: 'Stress Relief',
  },
  {
    title: 'Stay Hydrated',
    description: 'Drink water regularly throughout the day to maintain focus and energy.',
    category: 'Physical Health',
  },
  {
    title: 'Connect with Friends',
    description: 'Social connections are vital for mental health and academic success.',
    category: 'Social Wellness',
  },
];

export default function WellnessPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showStressModal, setShowStressModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showHistorySection, setShowHistorySection] = useState(false);

  const { user } = useAuth();
  const { 
    moodEntries, 
    wellnessGoals, 
    wellnessStats, 
    loading, 
    error, 
    hasData,
    syncStatus,
    refreshData,
    clearError
  } = useWellnessData();

  // Debug: Log all wellness data to console for database synchronization
  React.useEffect(() => {
    console.log('=== WELLNESS DATA SYNCHRONIZATION ===');
    console.log('Mood Entries Count:', moodEntries?.length || 0);
    console.log('Mood Entries Data:', moodEntries);
    console.log('Wellness Goals Count:', wellnessGoals?.length || 0);
    console.log('Wellness Goals Data:', wellnessGoals);
    console.log('Wellness Stats:', wellnessStats);
    console.log('Has Data:', hasData);
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('User Wellness Settings:', user?.wellnessSettings);
    console.log('=====================================');
  }, [moodEntries, wellnessGoals, wellnessStats, hasData, loading, error, user]);
  
  const moodData = transformMoodDataForChart(moodEntries);
  
  const isWellnessEnabled = !!(
    user?.wellnessSettings?.trackMood || 
    user?.wellnessSettings?.trackStress ||
    user?.wellnessSettings?.allowWellnessInsights
  );

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refreshData(); // Refresh data after enabling wellness features
  };

  const handleActivityClick = (activity: typeof wellnessActivities[0]) => {
    if (activity.status === 'coming-soon') return;
    
    switch (activity.id) {
      case 1: // Mood Tracking
        setShowMoodModal(true);
        break;
      case 2: // Stress Management
        setShowStressModal(true);
        break;
      case 3: // Sleep Tracking
        setShowSleepModal(true);
        break;
      case 4: // Social Connection
        setShowSocialModal(true);
        break;
      case 5: // Weekly Goals
        setShowGoalsModal(true);
        break;
      case 6: // Wellness Insights
        document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        if (activity.href.startsWith('/')) {
          window.location.href = activity.href;
        }
    }
  };

  // Close options menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showOptionsMenu && !target.closest('.wellness-options-menu')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  // Show onboarding if wellness is not enabled
  if (!isWellnessEnabled || showOnboarding) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <WellnessOnboarding onComplete={handleOnboardingComplete} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header - Matching Dashboard/Community Style */}
        <div className="sticky top-0 z-40 bg-white overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-8 left-12 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute top-4 right-16 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute bottom-6 left-1/3 w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse delay-500"></div>
              </div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2 space-y-1 sm:space-y-0">
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        Welcome to your
                      </h1>
                      <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Wellness Dashboard!
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm lg:text-base max-w-2xl leading-relaxed">
                      Track your wellness journey, monitor your progress, and discover insights about your mental and physical health.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex-shrink-0 wellness-options-menu">
                  <button
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="p-3 rounded-lg border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title="Options"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="3" cy="3" r="1.5"/>
                      <circle cx="10" cy="3" r="1.5"/>
                      <circle cx="17" cy="3" r="1.5"/>
                      <circle cx="3" cy="10" r="1.5"/>
                      <circle cx="10" cy="10" r="1.5"/>
                      <circle cx="17" cy="10" r="1.5"/>
                      <circle cx="3" cy="17" r="1.5"/>
                      <circle cx="10" cy="17" r="1.5"/>
                      <circle cx="17" cy="17" r="1.5"/>
                    </svg>
                  </button>

                  {/* Simple Options Dropdown */}
                  {showOptionsMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setShowOptionsMenu(false)}
                      />
                      <div className="fixed top-20 right-4 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] overflow-hidden">
                        <div className="p-4 space-y-3">
                          {/* Personal Dashboard */}
                          <div className="flex items-center justify-center">
                            <Badge variant="info" size="lg" className="px-6 py-3 text-sm font-medium">
                              Personal Dashboard
                            </Badge>
                          </div>
                          
                          {/* Wellness Score */}
                          <div className="flex items-center justify-center">
                            <Badge 
                              variant={(() => {
                                if (!moodEntries || moodEntries.length === 0) return 'secondary';
                                
                                const avgMood = moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length;
                                const avgStress = moodEntries.reduce((sum, e) => sum + (e.stress || 0), 0) / moodEntries.length;
                                const avgEnergy = moodEntries.reduce((sum, e) => sum + (e.energy || 0), 0) / moodEntries.length;
                                
                                const wellnessScore = avgStress > 0 ? 
                                  (avgMood + avgEnergy + (5 - avgStress)) / 3 :
                                  (avgMood + avgEnergy) / 2;
                                
                                return wellnessScore >= 4 ? 'success' :
                                       wellnessScore >= 3 ? 'warning' : 'error';
                              })()} 
                              size="lg" 
                              className="px-6 py-3 text-sm font-medium"
                            >
                              Wellness Score: {(() => {
                                if (!moodEntries || moodEntries.length === 0) return 0;
                                
                                const avgMood = moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length;
                                const avgStress = moodEntries.reduce((sum, e) => sum + (e.stress || 0), 0) / moodEntries.length;
                                const avgEnergy = moodEntries.reduce((sum, e) => sum + (e.energy || 0), 0) / moodEntries.length;
                                
                                const wellnessScore = avgStress > 0 ? 
                                  (avgMood + avgEnergy + (5 - avgStress)) / 3 :
                                  (avgMood + avgEnergy) / 2;
                                
                                return Math.round(wellnessScore * 10) / 10;
                              })()}/5
                            </Badge>
                          </div>
                          
                          {/* View My History */}
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="outline" 
                              size="lg" 
                              fullWidth 
                              className="py-3 text-sm font-medium"
                              onClick={() => {
                                setShowHistorySection(true);
                                setShowOptionsMenu(false);
                                // Scroll to history section
                                setTimeout(() => {
                                  document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                            >
                              View My History
                            </Button>
                          </div>
                          
                          {/* View My Insights */}
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="primary" 
                              size="lg" 
                              fullWidth 
                              className="py-3 text-sm font-medium"
                              onClick={() => {
                                document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' });
                                setShowOptionsMenu(false);
                              }}
                            >
                              View My Insights
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Main Content Container */}
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Enhanced Error Display with Recovery Options */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800 mb-1">Unable to load wellness data</h3>
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        clearError();
                        refreshData();
                      }}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Try Again
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearError()}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Data Synchronization Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <WellnessDataSync 
              showDetails={false}
              onSyncComplete={refreshData}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            />
          </motion.div>

          {/* Enhanced Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <div className="text-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-gray-600 font-medium">Loading your wellness data...</p>
                <p className="text-sm text-gray-500 mt-1">Analyzing your wellness patterns</p>
              </div>
            </motion.div>
          )}

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Enhanced Wellness Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card variant="wellness">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Your Wellness Score</h2>
                        <p className="text-sm text-gray-600">Based on your recent mood and stress tracking</p>
                      </div>
                      {(() => {
                        const trends = calculateWellnessTrends(moodEntries);
                        if (!trends) return null;
                        
                        return (
                          <div className="flex items-center space-x-2">
                            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              trends.trend === 'improving' ? 'bg-green-100 text-green-700' :
                              trends.trend === 'declining' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {trends.direction === 'up' && (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                              )}
                              {trends.direction === 'down' && (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                </svg>
                              )}
                              {trends.direction === 'stable' && (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                </svg>
                              )}
                              {trends.trend === 'improving' ? 'Improving' : 
                               trends.trend === 'declining' ? 'Needs Attention' : 'Stable'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Wellness Score Visualization */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <div className="relative">
                            <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">
                                  {(() => {
                                    if (!moodEntries || moodEntries.length === 0) return 0;
                                    
                                    // Calculate wellness score from actual user data
                                    const avgMood = moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length;
                                    const avgStress = moodEntries.reduce((sum, e) => sum + (e.stress || 0), 0) / moodEntries.length;
                                    const avgEnergy = moodEntries.reduce((sum, e) => sum + (e.energy || 0), 0) / moodEntries.length;
                                    
                                    // Calculate overall wellness: (mood + energy + (5 - stress)) / 3
                                    const wellnessScore = avgStress > 0 ? 
                                      (avgMood + avgEnergy + (5 - avgStress)) / 3 :
                                      (avgMood + avgEnergy) / 2;
                                    
                                    return Math.round(wellnessScore * 10) / 10;
                                  })()}
                                </div>
                                <div className="text-sm text-gray-600">/5</div>
                              </div>
                            </div>
                            <div 
                              className={`absolute inset-0 rounded-full border-8 border-transparent ${
                                (() => {
                                  if (!moodEntries || moodEntries.length === 0) return 'border-t-gray-300 border-r-gray-300';
                                  
                                  const avgMood = moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length;
                                  const avgStress = moodEntries.reduce((sum, e) => sum + (e.stress || 0), 0) / moodEntries.length;
                                  const avgEnergy = moodEntries.reduce((sum, e) => sum + (e.energy || 0), 0) / moodEntries.length;
                                  
                                  const wellnessScore = avgStress > 0 ? 
                                    (avgMood + avgEnergy + (5 - avgStress)) / 3 :
                                    (avgMood + avgEnergy) / 2;
                                  
                                  return wellnessScore >= 4 ? 'border-t-green-500 border-r-green-500' :
                                         wellnessScore >= 3 ? 'border-t-yellow-500 border-r-yellow-500' : 
                                         'border-t-red-500 border-r-red-500';
                                })()
                              }`}
                              style={{
                                transform: `rotate(${(() => {
                                  if (!moodEntries || moodEntries.length === 0) return 0;
                                  
                                  const avgMood = moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length;
                                  const avgStress = moodEntries.reduce((sum, e) => sum + (e.stress || 0), 0) / moodEntries.length;
                                  const avgEnergy = moodEntries.reduce((sum, e) => sum + (e.energy || 0), 0) / moodEntries.length;
                                  
                                  const wellnessScore = avgStress > 0 ? 
                                    (avgMood + avgEnergy + (5 - avgStress)) / 3 :
                                    (avgMood + avgEnergy) / 2;
                                  
                                  return (wellnessScore / 5) * 360;
                                })()}deg)`,
                                transition: 'transform 1s ease-in-out'
                              }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">Overall Wellness</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Mood Average</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={moodEntries?.length > 0 ? 
                                (moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length / 5) * 100 : 0
                              } 
                              variant="success" 
                              size="sm" 
                              className="w-20"
                            />
                            <span className="text-sm font-medium">
                              {moodEntries?.length > 0 ? 
                                Math.round((moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length) * 10) / 10 : 0
                              }/5
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Stress Level</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={moodEntries?.length > 0 ? 
                                (moodEntries.reduce((sum, e) => sum + (e.stress || 0), 0) / moodEntries.length / 5) * 100 : 0
                              } 
                              variant="error" 
                              size="sm" 
                              className="w-20"
                            />
                            <span className="text-sm font-medium">
                              {moodEntries?.length > 0 ? 
                                Math.round((moodEntries.reduce((sum, e) => sum + (e.stress || 0), 0) / moodEntries.length) * 10) / 10 : 0
                              }/5
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Energy Level</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={moodEntries?.length > 0 ? 
                                (moodEntries.reduce((sum, e) => sum + (e.energy || 0), 0) / moodEntries.length / 5) * 100 : 0
                              } 
                              variant="info" 
                              size="sm" 
                              className="w-20"
                            />
                            <span className="text-sm font-medium">
                              {moodEntries?.length > 0 ? 
                                Math.round((moodEntries.reduce((sum, e) => sum + (e.energy || 0), 0) / moodEntries.length) * 10) / 10 : 0
                              }/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Chart with Wellness Score */}
                    {hasData && moodEntries && moodEntries.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">14-Day Wellness Trends</h4>
                        <LineChart
                          title="Your Wellness Journey"
                          description="Track your mood, energy, stress, and overall wellness score over time"
                          data={transformMoodDataForChart(moodEntries)}
                          lines={[
                            { dataKey: 'wellnessScore', name: 'Wellness Score', color: '#8b5cf6' },
                            { dataKey: 'mood', name: 'Mood', color: '#22c55e' },
                            { dataKey: 'energy', name: 'Energy', color: '#3b82f6' },
                            { dataKey: 'stress', name: 'Stress', color: '#ef4444' },
                          ]}
                          xAxisKey="day"
                          height={350}
                          curved
                          showGrid
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              


              {/* Weekly Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card variant="wellness">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>This Week's Summary</CardTitle>
                        <CardDescription>
                          Your wellness activity and achievements this week
                        </CardDescription>
                      </div>

                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Chart Visualization */}
                    <div className="mb-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Enhanced Pie Chart */}
                      <div className="flex items-center justify-center">
                        {(() => {
                          const weeklyMoodEntries = moodEntries?.filter(e => {
                            const entryDate = e.createdAt ? new Date(e.createdAt) : new Date();
                            const validDate = isNaN(entryDate.getTime()) ? new Date() : entryDate;
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return validDate >= weekAgo;
                          }).length || 0;
                          
                          const dayStreak = wellnessStats?.dayStreak ?? 0;
                          const goalsMet = wellnessGoals?.filter(g => g.current >= g.target).length || 0;
                          const avgMood = moodEntries?.length > 0 ? 
                            Math.round((moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length) * 10) / 10 : 0;
                          
                          // Create meaningful data for pie chart
                          const data = [
                            { name: 'Mood Entries', value: Math.max(weeklyMoodEntries, 1), color: '#22c55e', icon: '😊' },
                            { name: 'Day Streak', value: Math.max(dayStreak, 1), color: '#3b82f6', icon: '🔥' },
                            { name: 'Goals Met', value: Math.max(goalsMet * 3, 1), color: '#8b5cf6', icon: '🎯' }, // Weight goals
                            { name: 'Avg Mood', value: Math.max(avgMood * 2, 1), color: '#f59e0b', icon: '⭐' }, // Weight mood
                          ];
                          
                          const total = data.reduce((sum, item) => sum + item.value, 0);
                          
                          if (total <= 4) { // All minimum values
                            return (
                              <div className="w-56 h-56 rounded-full border-8 border-gray-200 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <div className="text-center">
                                  <div className="text-5xl mb-3">📊</div>
                                  <div className="text-lg font-medium text-gray-700 mb-1">No Data Yet</div>
                                  <div className="text-sm text-gray-500">Start your wellness journey!</div>
                                </div>
                              </div>
                            );
                          }
                          
                          // Calculate angles for each slice
                          let currentAngle = 0;
                          const slices = data.map(item => {
                            const percentage = (item.value / total) * 100;
                            const angle = (percentage / 100) * 360;
                            const slice = {
                              ...item,
                              percentage: Math.round(percentage),
                              startAngle: currentAngle,
                              endAngle: currentAngle + angle,
                              angle
                            };
                            currentAngle += angle;
                            return slice;
                          });
                          
                          const createPath = (startAngle: number, endAngle: number, outerRadius = 100, innerRadius = 45) => {
                            const startAngleRad = (startAngle - 90) * Math.PI / 180;
                            const endAngleRad = (endAngle - 90) * Math.PI / 180;
                            
                            const x1 = 112 + outerRadius * Math.cos(startAngleRad);
                            const y1 = 112 + outerRadius * Math.sin(startAngleRad);
                            const x2 = 112 + outerRadius * Math.cos(endAngleRad);
                            const y2 = 112 + outerRadius * Math.sin(endAngleRad);
                            
                            const x3 = 112 + innerRadius * Math.cos(endAngleRad);
                            const y3 = 112 + innerRadius * Math.sin(endAngleRad);
                            const x4 = 112 + innerRadius * Math.cos(startAngleRad);
                            const y4 = 112 + innerRadius * Math.sin(startAngleRad);
                            
                            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                            
                            return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
                          };
                          
                          return (
                            <div className="relative w-56 h-56">
                              <svg width="224" height="224" viewBox="0 0 224 224" className="drop-shadow-lg">
                                {/* Background circle */}
                                <circle cx="112" cy="112" r="100" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
                                
                                {/* Pie slices */}
                                {slices.map((slice, index) => (
                                  <g key={slice.name}>
                                    <path
                                      d={createPath(slice.startAngle, slice.endAngle)}
                                      fill={slice.color}
                                      stroke="white"
                                      strokeWidth="3"
                                      className="hover:opacity-80 transition-all duration-300 cursor-pointer hover:scale-105"
                                      style={{ transformOrigin: '112px 112px' }}
                                    />
                                    {/* Slice labels */}
                                    {slice.percentage >= 10 && (
                                      <text
                                        x={112 + 70 * Math.cos(((slice.startAngle + slice.endAngle) / 2 - 90) * Math.PI / 180)}
                                        y={112 + 70 * Math.sin(((slice.startAngle + slice.endAngle) / 2 - 90) * Math.PI / 180)}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-xs font-bold fill-white"
                                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                                      >
                                        {slice.percentage}%
                                      </text>
                                    )}
                                  </g>
                                ))}
                                
                                {/* Center circle */}
                                <circle cx="112" cy="112" r="45" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
                              </svg>
                              
                              {/* Center content */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-gray-900 mb-1">
                                    {Math.round(((weeklyMoodEntries + dayStreak + goalsMet + avgMood) / 4) * 10) / 10}
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">Weekly</div>
                                  <div className="text-xs text-gray-600 font-medium">Score</div>
                                </div>
                              </div>
                              
                              {/* Hover tooltips */}
                              <div className="absolute inset-0 pointer-events-none">
                                {slices.map((slice, index) => (
                                  <div
                                    key={slice.name}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                                    style={{
                                      left: `${50 + 35 * Math.cos(((slice.startAngle + slice.endAngle) / 2 - 90) * Math.PI / 180)}%`,
                                      top: `${50 + 35 * Math.sin(((slice.startAngle + slice.endAngle) / 2 - 90) * Math.PI / 180)}%`,
                                    }}
                                  >
                                    {slice.icon} {slice.name}: {
                                      slice.name === 'Mood Entries' ? weeklyMoodEntries :
                                      slice.name === 'Day Streak' ? dayStreak :
                                      slice.name === 'Goals Met' ? goalsMet :
                                      avgMood
                                    }
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Legend and Stats */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                {moodEntries?.filter(e => {
                                  const entryDate = e.createdAt ? new Date(e.createdAt) : new Date();
                                  const validDate = isNaN(entryDate.getTime()) ? new Date() : entryDate;
                                  const weekAgo = new Date();
                                  weekAgo.setDate(weekAgo.getDate() - 7);
                                  return validDate >= weekAgo;
                                }).length || 0}
                              </div>
                              <div className="text-xs text-green-700">Mood Entries</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <div>
                              <div className="text-lg font-bold text-blue-600">
                                {(wellnessStats?.dayStreak ?? 0)}
                              </div>
                              <div className="text-xs text-blue-700">Day Streak</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                            <div>
                              <div className="text-lg font-bold text-purple-600">
                                {wellnessGoals?.filter(g => g.current >= g.target).length || 0}
                              </div>
                              <div className="text-xs text-purple-700">Goals Met</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <div>
                              <div className="text-lg font-bold text-yellow-600">
                                {moodEntries?.length > 0 ? 
                                  Math.round((moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length) * 10) / 10 : 0
                                }
                              </div>
                              <div className="text-xs text-yellow-700">Avg Mood</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Weekly Progress Summary */}
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                          <h4 className="text-sm font-medium text-indigo-900 mb-2">Weekly Progress</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-indigo-700">Activity Level</span>
                              <span className="text-xs font-medium text-indigo-800">
                                {(() => {
                                  const weeklyEntries = moodEntries?.filter(e => {
                                    const entryDate = e.createdAt ? new Date(e.createdAt) : new Date();
                                    const validDate = isNaN(entryDate.getTime()) ? new Date() : entryDate;
                                    const weekAgo = new Date();
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    return validDate >= weekAgo;
                                  }).length || 0;
                                  
                                  return weeklyEntries >= 5 ? 'High' : weeklyEntries >= 3 ? 'Medium' : 'Low';
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-indigo-700">Consistency</span>
                              <span className="text-xs font-medium text-indigo-800">
                                {(wellnessStats?.dayStreak ?? 0) >= 7 ? 'Excellent' : 
                                 (wellnessStats?.dayStreak ?? 0) >= 3 ? 'Good' : 'Building'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                        </div>
                    </div>
                    
                    {/* Achievement Badges */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">Recent Achievements</h4>
                      <div className="flex flex-wrap gap-2">
                        {moodEntries?.length >= 7 && (
                          <Badge variant="success" size="sm" className="flex items-center space-x-1">
                            <span>🏆</span>
                            <span>Week Warrior</span>
                          </Badge>
                        )}
                        {(wellnessStats?.dayStreak ?? 0) >= 3 && (
                          <Badge variant="info" size="sm" className="flex items-center space-x-1">
                            <span>🔥</span>
                            <span>Streak Master</span>
                          </Badge>
                        )}
                        {wellnessGoals?.some(g => g.current >= g.target) && (
                          <Badge variant="warning" size="sm" className="flex items-center space-x-1">
                            <span>🎯</span>
                            <span>Goal Crusher</span>
                          </Badge>
                        )}
                        {moodEntries?.length === 0 && (
                          <Badge variant="secondary" size="sm" className="flex items-center space-x-1">
                            <span>🌱</span>
                            <span>Getting Started</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>



            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Smart Recommendations */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card variant="wellness">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Smart Recommendations</span>
                    </CardTitle>
                    <CardDescription>
                      Personalized suggestions based on your wellness patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const trends = calculateWellnessTrends(moodEntries);
                      const avgMood = moodEntries?.length > 0 ? 
                        moodEntries.reduce((sum, e) => sum + (e.moodScore || e.mood || 0), 0) / moodEntries.length : 0;
                      const avgStress = moodEntries?.length > 0 ? 
                        moodEntries.reduce((sum, e) => sum + (e.stress || 0), 0) / moodEntries.length : 0;
                      
                      const recommendations = [];
                      
                      if (avgStress > 3.5) {
                        recommendations.push({
                          title: 'Stress Management',
                          description: 'Your stress levels are elevated. Try deep breathing exercises or a 5-minute meditation.',
                          action: 'Try Breathing Exercise',
                          color: 'bg-red-50 border-red-200 text-red-800',
                          icon: '🧘‍♀️'
                        });
                      }
                      
                      if (avgMood < 3) {
                        recommendations.push({
                          title: 'Mood Boost',
                          description: 'Consider reaching out to a friend or doing an activity you enjoy.',
                          action: 'Log Social Activity',
                          color: 'bg-blue-50 border-blue-200 text-blue-800',
                          icon: '💙'
                        });
                      }
                      
                      if (trends?.trend === 'improving') {
                        recommendations.push({
                          title: 'Keep It Up!',
                          description: 'Your wellness is trending upward. Maintain your current habits.',
                          action: 'View Progress',
                          color: 'bg-green-50 border-green-200 text-green-800',
                          icon: '🌟'
                        });
                      }
                      
                      if (moodEntries?.length === 0) {
                        recommendations.push({
                          title: 'Start Tracking',
                          description: 'Begin your wellness journey by logging your first mood entry.',
                          action: 'Log First Mood',
                          color: 'bg-purple-50 border-purple-200 text-purple-800',
                          icon: '🚀'
                        });
                      }
                      
                      if (recommendations.length === 0) {
                        recommendations.push({
                          title: 'Stay Consistent',
                          description: 'You\'re doing great! Keep tracking regularly for better insights.',
                          action: 'Set Reminder',
                          color: 'bg-gray-50 border-gray-200 text-gray-800',
                          icon: '⭐'
                        });
                      }
                      
                      return (
                        <div className="space-y-3">
                          {recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${rec.color}`}>
                              <div className="flex items-start space-x-3">
                                <div className="text-2xl">{rec.icon}</div>
                                <div className="flex-1">
                                  <h4 className="font-medium mb-1">{rec.title}</h4>
                                  <p className="text-sm opacity-90 mb-3">{rec.description}</p>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (rec.action.includes('Mood')) setShowMoodModal(true);
                                      else if (rec.action.includes('Social')) setShowSocialModal(true);
                                      else if (rec.action.includes('Breathing')) setShowStressModal(true);
                                    }}
                                  >
                                    {rec.action}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Wellness Insights Component */}
              <motion.div
                id="insights"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <WellnessInsights />
              </motion.div>

            </div>
          </div>

          {/* Feature Status Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="wellness">
                <CardHeader>
                  <CardTitle className="text-green-700">✅ Available Now</CardTitle>
                  <CardDescription>
                    Features you can use immediately
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {wellnessActivities.filter(a => a.status === 'available').map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900">{activity.title}</h4>
                          <p className="text-sm text-green-700">{activity.features.length} features available</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActivityClick(activity)}
                          className="border-green-300 text-green-700 hover:bg-green-100"
                        >
                          Try Now
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card variant="wellness">
                <CardHeader>
                  <CardTitle className="text-gray-600">🚧 Coming Soon</CardTitle>
                  <CardDescription>
                    Features in development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {wellnessActivities.filter(a => a.status === 'coming-soon').map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-2xl opacity-60">{activity.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-700">{activity.title}</h4>
                          <p className="text-sm text-gray-500">{activity.features.length} features planned</p>
                        </div>
                        <Badge variant="secondary" size="sm">
                          Soon
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Wellness Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <Card variant="wellness">
              <CardHeader>
                <CardTitle>All Wellness Features</CardTitle>
                <CardDescription>
                  Complete overview of available and upcoming wellness tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wellnessActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        variant="wellness"
                        interactive={activity.status === 'available'}
                        asMotion
                        className="h-full"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="text-3xl">{activity.icon}</div>
                            <Badge
                              variant={activity.status === 'available' ? 'success' : 'secondary'}
                              size="xs"
                            >
                              {activity.status === 'available' ? 'Available' : 'Coming Soon'}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-secondary-600 mb-4">
                            {activity.description}
                          </p>
                          
                          {/* Feature List */}
                          <div className="mb-4">
                            <ul className="text-xs text-secondary-500 space-y-1">
                              {activity.features.slice(0, 3).map((feature, idx) => (
                                <li key={idx} className="flex items-center">
                                  <div className="w-1 h-1 bg-secondary-400 rounded-full mr-2"></div>
                                  {feature}
                                </li>
                              ))}
                              {activity.features.length > 3 && (
                                <li className="text-secondary-400">
                                  +{activity.features.length - 3} more features
                                </li>
                              )}
                            </ul>
                          </div>

                          {activity.status === 'available' ? (
                            <Button
                              variant={activity.color as any}
                              size="sm"
                              fullWidth
                              onClick={() => handleActivityClick(activity)}
                            >
                              {activity.id <= 6 ? 'Start Now' : 'Get Started'}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth
                              disabled
                            >
                              Coming Soon
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Wellness History Section - Shows when requested */}
          {showHistorySection && (
            <motion.div
              id="history-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Card variant="wellness">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Wellness History</CardTitle>
                      <CardDescription>
                        Your wellness journey and progress over time
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHistorySection(false)}
                    >
                      Hide History
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* History Summary Stats - Using Real User Data */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {moodEntries?.length || 0}
                      </div>
                      <div className="text-sm text-green-700">Total Entries</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {wellnessGoals?.length || 0}
                      </div>
                      <div className="text-sm text-blue-700">Active Goals</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {(wellnessStats?.dayStreak ?? 0)}
                      </div>
                      <div className="text-sm text-purple-700">Day Streak</div>
                    </div>
                  </div>

                  {/* Recent Wellness Trends - Using Real User Data */}
                  {hasData && moodEntries && moodEntries.length > 0 ? (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Trends</h4>
                      <LineChart
                        title="Weekly Wellness Progress"
                        description="Your actual mood, energy, and stress levels from your entries"
                        data={transformMoodDataForChart(moodEntries)}
                        lines={[
                          { dataKey: 'mood', name: 'Mood', color: '#22c55e' },
                          { dataKey: 'energy', name: 'Energy', color: '#3b82f6' },
                          { dataKey: 'stress', name: 'Stress', color: '#ef4444' },
                        ]}
                        xAxisKey="day"
                        height={300}
                        curved
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📊</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No History Data Yet</h4>
                      <p className="text-gray-600 mb-4">Start tracking your wellness to see your actual progress here</p>
                      <Button 
                        variant="primary" 
                        onClick={() => setShowMoodModal(true)}
                      >
                        Log Your First Entry
                      </Button>
                    </div>
                  )}

                  {/* Recent Entries - Using Real User Data */}
                  {moodEntries && moodEntries.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h4>
                      <div className="space-y-3">
                        {moodEntries.slice(0, 5).map((entry, index) => (
                          <div key={entry.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">
                                {(entry.moodScore || entry.mood || 0) >= 4 ? '�' : (entry.moodScore || entry.mood || 0) >= 3 ? '😐' : (entry.moodScore || entry.mood || 0) >= 2 ? '😕' : '😢'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {(() => {
                                    const entryDate = entry.createdAt ? new Date(entry.createdAt) : new Date();
                                    const validDate = isNaN(entryDate.getTime()) ? new Date() : entryDate;
                                    return validDate.toLocaleDateString('en', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    });
                                  })()}
                                </p>
                                {entry.notes && (
                                  <p className="text-sm text-gray-600">{entry.notes}</p>
                                )}
                                {entry.tags && entry.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {entry.tags.slice(0, 3).map((tag, tagIndex) => (
                                      <span key={tagIndex} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-4 text-sm">
                              <div className="text-center">
                                <p className="text-gray-600">Mood</p>
                                <p className="font-semibold text-green-600">{entry.moodScore || entry.mood || 0}/5</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600">Energy</p>
                                <p className="font-semibold text-blue-600">{entry.energy || 0}/5</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600">Stress</p>
                                <p className="font-semibold text-red-600">{entry.stress || 0}/5</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {moodEntries.length > 5 && (
                        <div className="text-center mt-4">
                          <p className="text-sm text-gray-500">
                            Showing 5 of {moodEntries.length} total entries
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* User's Wellness Goals - Using Real Data */}
                  {wellnessGoals && wellnessGoals.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Wellness Goals</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wellnessGoals.map((goal, index) => (
                          <div key={goal.id || index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900">{goal.name}</h5>
                              <Badge
                                variant={goal.current >= goal.target ? 'success' : 'warning'}
                                size="sm"
                              >
                                {Math.round((goal.current / goal.target) * 100)}%
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-baseline space-x-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {goal.current}
                                </span>
                                <span className="text-sm text-gray-600">
                                  / {goal.target} {goal.unit}
                                </span>
                              </div>
                              <Progress
                                value={(goal.current / goal.target) * 100}
                                variant={goal.current >= goal.target ? 'success' : 'primary'}
                                size="sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Daily Wellness Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card variant="wellness">
              <CardHeader>
                <CardTitle>Daily Wellness Tips</CardTitle>
                <CardDescription>
                  Simple practices to enhance your daily wellbeing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wellnessTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-secondary-900">
                          {tip.title}
                        </h4>
                        <Badge variant="primary" size="xs">
                          {tip.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary-700">
                        {tip.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Wellness Tracking Modals */}
      <MoodTrackerModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSave={() => {
          refreshData();
          setShowMoodModal(false);
        }}
      />

      <StressTrackerModal
        isOpen={showStressModal}
        onClose={() => setShowStressModal(false)}
        onSave={() => {
          refreshData();
          setShowStressModal(false);
        }}
      />

      <SleepTrackerModal
        isOpen={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        onSave={() => {
          refreshData();
          setShowSleepModal(false);
        }}
      />

      <SocialTrackerModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        onSave={() => {
          refreshData();
          setShowSocialModal(false);
        }}
      />

      <WeeklyGoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        onSave={() => {
          refreshData();
          setShowGoalsModal(false);
        }}
        existingGoals={wellnessGoals.map((g, i) => ({
          id: `goal-${i}`,
          name: g.name,
          target: g.target,
          current: g.current,
          category: (g.category as any) || 'mood',
          unit: g.unit,
        }))}
      />
    </DashboardLayout>
  );
}