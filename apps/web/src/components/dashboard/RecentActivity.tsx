'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Activity {
  id: number;
  type: string;
  action: string;
  title: string;
  timestamp: string;
  engagement?: string;
  iconType: 'post' | 'mood' | 'group' | 'comment' | 'like' | 'event';
  color: string;
  isAnonymous?: boolean;
}

const getActivityIcon = (iconType: string) => {
  switch (iconType) {
    case 'post':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    case 'mood':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'group':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'comment':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
  }
};

export default function RecentActivity() {
  // Use actual auth context
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user-specific activity data
    const loadActivityData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // For now, show empty state - activity tracking can be implemented later
      // This could fetch from API: /api/v1/users/activity
      setActivities([]);
      setLoading(false);
    };

    loadActivityData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <button 
          onClick={() => router.push('/profile?tab=activity')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
            <p className="text-gray-600 mb-4">
              Start engaging with the community to see your activity here.
            </p>
            <button 
              onClick={() => router.push('/community')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore Community
            </button>
          </div>
        ) : (
          activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-md"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
              {getActivityIcon(activity.iconType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                You <span className="font-medium">{activity.action}</span>
              </p>
              <p className="text-sm text-gray-600 truncate mt-1">{activity.title}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
                {activity.engagement && (
                  <span className="text-xs text-gray-500">
                    {activity.engagement}
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => {
                // Navigate based on activity type
                if (activity.iconType === 'post') router.push('/community');
                else if (activity.iconType === 'mood') router.push('/wellness/mood');
                else if (activity.iconType === 'group') router.push('/community/study-groups');
                else router.push('/community');
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
          ))
        )}
      </div>
    </div>
  );
}