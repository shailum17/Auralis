'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useWellnessData } from '@/hooks/useWellnessData';
import { WellnessOnboarding } from '@/components/wellness/WellnessOnboarding';
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

// Transform mood entries to chart data format
const transformMoodDataForChart = (moodEntries: any[]) => {
  if (!moodEntries || moodEntries.length === 0) return [];
  
  // Get last 7 days of data
  const last7Days = moodEntries.slice(0, 7).reverse();
  
  return last7Days.map(entry => ({
    day: new Date(entry.date).toLocaleDateString('en', { weekday: 'short' }),
    mood: entry.mood || 0,
    energy: entry.energy || 0,
    stress: entry.stress || 0,
  }));
};

const wellnessActivities = [
  {
    id: 1,
    title: 'Mood Tracking',
    description: 'Track your daily emotions and identify patterns',
    icon: '😊',
    href: '/wellness/mood',
    status: 'available',
    color: 'primary',
  },
  {
    id: 2,
    title: 'Meditation & Mindfulness',
    description: 'Guided meditation sessions and breathing exercises',
    icon: '🧘‍♀️',
    href: '/wellness/meditation',
    status: 'coming-soon',
    color: 'success',
  },
  {
    id: 3,
    title: 'Sleep Tracker',
    description: 'Monitor your sleep patterns and improve sleep quality',
    icon: '😴',
    href: '/wellness/sleep',
    status: 'coming-soon',
    color: 'info',
  },
  {
    id: 4,
    title: 'Stress Management',
    description: 'Tools and techniques to manage stress effectively',
    icon: '🌱',
    href: '/wellness/stress',
    status: 'coming-soon',
    color: 'warning',
  },
  {
    id: 5,
    title: 'Exercise Planner',
    description: 'Personalized workout plans and activity tracking',
    icon: '💪',
    href: '/wellness/exercise',
    status: 'coming-soon',
    color: 'error',
  },
  {
    id: 6,
    title: 'Nutrition Guide',
    description: 'Healthy eating tips and meal planning assistance',
    icon: '🥗',
    href: '/wellness/nutrition',
    status: 'coming-soon',
    color: 'success',
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
  // Mock user since auth is removed
  const user = {
    wellnessSettings: {
      trackMood: false,
      trackStress: false,
      allowWellnessInsights: false
    }
  };
  const { 
    moodEntries, 
    wellnessGoals, 
    wellnessStats, 
    loading, 
    error, 
    hasData,
    refreshData
  } = useWellnessData();
  
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
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-secondary-600">Loading wellness data...</p>
              </div>
            </motion.div>
          )}

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900">
                  Wellness Dashboard
                </h1>
                <p className="text-lg text-secondary-600 mt-2">
                  Your personal wellness journey starts here
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {hasData ? (
                  <Badge variant="success" size="lg">
                    Wellness Score: --% 
                  </Badge>
                ) : (
                  <Badge variant="secondary" size="lg">
                    Start Tracking
                  </Badge>
                )}
                <Button variant="primary" size="sm">
                  {hasData ? 'View Insights' : 'Get Started'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {hasData && wellnessGoals.length > 0 ? (
              wellnessGoals.map((goal, index) => (
                <motion.div key={goal.name} variants={itemVariants}>
                  <Card variant="wellness" asMotion>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-secondary-700">
                          {goal.name}
                        </h3>
                        <Badge
                          variant={goal.current >= goal.target ? 'success' : 'warning'}
                          size="xs"
                        >
                          {Math.round((goal.current / goal.target) * 100)}%
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-secondary-900">
                            {goal.current}
                          </span>
                          <span className="text-sm text-secondary-600">
                            / {goal.target} {goal.unit}
                          </span>
                        </div>
                        <Progress
                          value={(goal.current / goal.target) * 100}
                          variant={goal.current >= goal.target ? 'success' : 'primary'}
                          size="sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-4">
                <Card variant="wellness" asMotion>
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      No Wellness Data Yet
                    </h3>
                    <p className="text-secondary-600 mb-4">
                      Start tracking your wellness journey to see personalized insights and goals here.
                    </p>
                    <Button variant="primary" size="sm">
                      Start Tracking
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {hasData && moodData.length > 0 ? (
                <LineChart
                  title="Weekly Wellness Trends"
                  description="Track your mood, energy, and stress levels"
                  data={moodData}
                  lines={[
                    { dataKey: 'mood', name: 'Mood', color: '#22c55e' },
                    { dataKey: 'energy', name: 'Energy', color: '#3b82f6' },
                    { dataKey: 'stress', name: 'Stress', color: '#ef4444' },
                  ]}
                  xAxisKey="day"
                  height={300}
                  curved
                />
              ) : (
                <Card variant="wellness">
                  <CardHeader>
                    <CardTitle>Weekly Wellness Trends</CardTitle>
                    <CardDescription>
                      Track your mood, energy, and stress levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📈</div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                        No Wellness Data
                      </h3>
                      <p className="text-secondary-600 mb-4">
                        Start logging your daily mood and stress to see trends here.
                      </p>
                      <Button variant="primary" size="sm">
                        Log Today's Mood
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card variant="wellness">
                <CardHeader>
                  <CardTitle>Wellness Overview</CardTitle>
                  <CardDescription>
                    Your overall wellness score and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasData && wellnessStats ? (
                    <>
                      <div className="flex items-center justify-center mb-6">
                        <CircularProgress
                          value={wellnessStats.overallScore}
                          size={150}
                          strokeWidth={12}
                          variant="success"
                          label="Overall Score"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success-600">
                            {wellnessStats.dayStreak}
                          </div>
                          <div className="text-sm text-secondary-600">Day Streak</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-600">
                            {wellnessStats.totalActivities}
                          </div>
                          <div className="text-sm text-secondary-600">Activities</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                          Start Your Journey
                        </h3>
                        <p className="text-secondary-600 mb-4">
                          Begin tracking to see your wellness score and progress.
                        </p>
                        <Button variant="primary" size="sm">
                          Enable Tracking
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Wellness Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <Card variant="wellness">
              <CardHeader>
                <CardTitle>Wellness Activities</CardTitle>
                <CardDescription>
                  Explore tools and resources to improve your wellbeing
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
                          {activity.status === 'available' ? (
                            <Link href={activity.href}>
                              <Button
                                variant={activity.color as any}
                                size="sm"
                                fullWidth
                              >
                                Get Started
                              </Button>
                            </Link>
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
    </DashboardLayout>
  );
}