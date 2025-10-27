'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WellnessOverview from '@/components/dashboard/WellnessOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';
import CommunityFeed from '@/components/dashboard/CommunityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import WellnessInsights from '@/components/dashboard/WellnessInsights';

import { DynamicProfileService } from '@/lib/dynamic-profile-service';

export default function Dashboard() {
  // Use actual auth context
  const { user } = useAuth();

  // Get display name from user data
  const getDisplayName = () => {
    if (!user) return 'User';
    return user.fullName || 'User';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Dashboard Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {getGreeting()}, {getDisplayName()}! 👋
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Here&apos;s what&apos;s happening in your community today
                  </p>

                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Wellness Score: {DynamicProfileService.getUserWellnessScore(user).toFixed(1)}/10
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    New Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Wellness Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <WellnessOverview />
              </motion.div>

              {/* Community Feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <CommunityFeed />
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <RecentActivity />
              </motion.div>

            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <QuickActions />
              </motion.div>

              {/* Wellness Insights */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <WellnessInsights />
              </motion.div>

              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <UpcomingEvents />
              </motion.div>

            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}