'use client';

import { motion } from 'framer-motion';

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'post',
      action: 'created a new post',
      content: 'Just finished my first therapy session...',
      timestamp: '2 hours ago',
      reactions: 24,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      type: 'mood',
      action: 'logged mood entry',
      content: 'Feeling good - 8/10',
      timestamp: '5 hours ago',
      reactions: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 3,
      type: 'study_group',
      action: 'joined study group',
      content: 'PSYC 301 - Final Exam Prep',
      timestamp: '1 day ago',
      reactions: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      type: 'comment',
      action: 'commented on a post',
      content: 'Thanks for sharing this resource!',
      timestamp: '2 days ago',
      reactions: 8,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 5,
      type: 'wellness',
      action: 'completed wellness check-in',
      content: 'Weekly wellness assessment',
      timestamp: '3 days ago',
      reactions: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                You <span className="font-medium">{activity.action}</span>
              </p>
              <p className="text-sm text-gray-600 truncate mt-1">{activity.content}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
                {activity.reactions && (
                  <span className="text-xs text-gray-500">
                    {activity.reactions} reactions
                  </span>
                )}
              </div>
            </div>
            <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}