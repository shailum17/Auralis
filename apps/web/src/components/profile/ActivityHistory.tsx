'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ActivityHistory() {
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30days');

  const activities = [
    {
      id: 1,
      type: 'post',
      action: 'Created a post',
      title: 'Just finished my first therapy session...',
      timestamp: '2024-01-15T14:30:00Z',
      engagement: { likes: 24, comments: 8, shares: 3 },
      isAnonymous: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      type: 'comment',
      action: 'Commented on a post',
      title: 'Thanks for sharing this resource! It really helped me...',
      timestamp: '2024-01-15T10:15:00Z',
      engagement: { likes: 12, replies: 3 },
      isAnonymous: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 3,
      type: 'mood',
      action: 'Logged mood entry',
      title: 'Feeling good today - 8/10',
      timestamp: '2024-01-14T20:45:00Z',
      engagement: null,
      isAnonymous: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 4,
      type: 'study_group',
      action: 'Joined study group',
      title: 'PSYC 301 - Final Exam Preparation',
      timestamp: '2024-01-14T16:20:00Z',
      engagement: { members: 8 },
      isAnonymous: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 5,
      type: 'wellness',
      action: 'Completed wellness check-in',
      title: 'Weekly wellness assessment',
      timestamp: '2024-01-13T09:30:00Z',
      engagement: null,
      isAnonymous: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 6,
      type: 'message',
      action: 'Sent direct message',
      title: 'Reached out to a peer for support',
      timestamp: '2024-01-12T15:45:00Z',
      engagement: null,
      isAnonymous: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 7,
      type: 'event',
      action: 'Attended event',
      title: 'Mindfulness Workshop - Stress Reduction Techniques',
      timestamp: '2024-01-11T14:00:00Z',
      engagement: { attendees: 25 },
      isAnonymous: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-teal-100 text-teal-600'
    },
    {
      id: 8,
      type: 'reaction',
      action: 'Reacted to posts',
      title: 'Gave 5 supportive reactions to community posts',
      timestamp: '2024-01-10T18:20:00Z',
      engagement: null,
      isAnonymous: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'bg-red-100 text-red-600'
    }
  ];

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

      {/* Activity Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">127</div>
          <div className="text-sm text-gray-600">Total Activities</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">45</div>
          <div className="text-sm text-gray-600">Posts Created</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">89</div>
          <div className="text-sm text-gray-600">Comments Made</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">234</div>
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
          {filteredActivities.map((activity, index) => (
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
          ))}
        </div>

        {/* Load More */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Load more activities
          </button>
        </div>
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