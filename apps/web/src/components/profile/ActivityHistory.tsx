'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { DynamicProfileService } from '@/lib/dynamic-profile-service';

export default function ActivityHistory() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Array<{
    id: number;
    type: string;
    action: string;
    title: string;
    timestamp: string;
    engagement?: any;
    isAnonymous?: boolean;
    icon: React.ReactNode;
    color: string;
  }>>([]);

  // Load user's actual activity data
  useEffect(() => {
    const loadActivityData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get dynamic activity data for the user
      const userActivities = DynamicProfileService.getUserActivityHistory(user);
      setActivities(userActivities);
      
      setLoading(false);
    };

    loadActivityData();
  }, [user, timeRange]);



  const filters = [
    { id: 'all', name: 'All Activity', count: activities.length },
    { id: 'post', name: 'Posts', count: activities.filter(a => a.type === 'post').length },
    { id: 'comment', name: 'Comments', count: activities.filter(a => a.type === 'comment').length },
    { id: 'wellness', name: 'Wellness', count: activities.filter(a => ['mood', 'wellness'].includes(a.type)).length },
    { id: 'social', name: 'Social', count: activities.filter(a => ['study_group', 'message', 'event'].includes(a.type)).length }
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => {
        if (filter === 'wellness') return ['mood', 'wellness'].includes(activity.type);
        if (filter === 'social') return ['study_group', 'message', 'event'].includes(activity.type);
        return activity.type === filter;
      });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getEngagementText = (activity: any) => {
    if (!activity.engagement) return null;
    
    const parts = [];
    if (activity.engagement.likes) parts.push(`${activity.engagement.likes} likes`);
    if (activity.engagement.comments) parts.push(`${activity.engagement.comments} comments`);
    if (activity.engagement.shares) parts.push(`${activity.engagement.shares} shares`);
    if (activity.engagement.replies) parts.push(`${activity.engagement.replies} replies`);
    if (activity.engagement.members) parts.push(`${activity.engagement.members} members`);
    if (activity.engagement.attendees) parts.push(`${activity.engagement.attendees} attendees`);
    
    return parts.join(' • ');
  };

  if (loading) {
    return (
      <div className="max-w-4xl animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-lg h-64"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity History</h2>
          <p className="text-gray-600 mt-1">Your engagement and participation on the platform</p>
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

      {/* Activity Stats - Dynamic based on actual user data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
          <div className="text-sm text-gray-600">Total Activities</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{activities.filter(a => a.type === 'post').length}</div>
          <div className="text-sm text-gray-600">Posts Created</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{activities.filter(a => a.type === 'comment').length}</div>
          <div className="text-sm text-gray-600">Comments Made</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{activities.filter(a => a.type === 'reaction').length}</div>
          <div className="text-sm text-gray-600">Reactions Given</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterOption.name}
                <span className="ml-2 text-xs text-gray-500">({filterOption.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div className="divide-y divide-gray-200">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activities.length === 0 
                  ? "No activities yet" 
                  : `No ${filter === 'all' ? '' : filter} activities yet`
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {activities.length === 0 
                  ? "Start engaging with the community to see your activity history here."
                  : filter === 'all' 
                    ? "No activities match your current filter."
                    : `You haven't ${filter === 'post' ? 'created any posts' : 
                        filter === 'comment' ? 'made any comments' :
                        filter === 'wellness' ? 'logged any wellness activities' :
                        filter === 'social' ? 'participated in social activities' : 
                        'done this type of activity'} yet.`
                }
              </p>
              {activities.length === 0 && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Explore Community
                </button>
              )}
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    {activity.isAnonymous && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.title}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatTimestamp(activity.timestamp)}</span>
                    {getEngagementText(activity) && (
                      <>
                        <span>•</span>
                        <span>{getEngagementText(activity)}</span>
                      </>
                    )}
                  </div>
                </div>
                <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </motion.div>
            ))
          )}
        </div>

        {/* Load More - Only show if there are activities */}
        {filteredActivities.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Load more activities
            </button>
          </div>
        )}
      </div>

      {/* Export Activity Data */}
      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export Activity Data</span>
        </button>
      </div>
    </motion.div>
  );
}