'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CommunityFeed() {
  const [filter, setFilter] = useState('all');

  const posts = [
    {
      id: 1,
      author: 'Anonymous',
      isAnonymous: true,
      content: "Just finished my first therapy session through the campus counseling center. It was scary at first, but I'm so glad I took that step. For anyone considering it - you're not alone and it's okay to ask for help. 💙",
      tags: ['mental-health', 'therapy', 'support'],
      timestamp: '2 hours ago',
      reactions: { likes: 24, supports: 18, helpful: 12 },
      comments: 8,
      userReacted: false
    },
    {
      id: 2,
      author: 'Alex Chen',
      isAnonymous: false,
      avatar: 'AC',
      content: "Study group for PSYC 301 tomorrow at 3pm in the library! We're covering chapters 8-10. Everyone welcome - let's support each other through finals season! 📚✨",
      tags: ['study-group', 'psychology', 'finals'],
      timestamp: '4 hours ago',
      reactions: { likes: 15, supports: 8, helpful: 22 },
      comments: 5,
      userReacted: true
    },
    {
      id: 3,
      author: 'Anonymous',
      isAnonymous: true,
      content: "Having a really tough week with anxiety. The breathing exercises from last week's wellness workshop are actually helping though. Sometimes the small tools make the biggest difference.",
      tags: ['anxiety', 'wellness', 'coping-strategies'],
      timestamp: '6 hours ago',
      reactions: { likes: 31, supports: 28, helpful: 15 },
      comments: 12,
      userReacted: false
    },
    {
      id: 4,
      author: 'Maya Patel',
      isAnonymous: false,
      avatar: 'MP',
      content: "Reminder: You don't have to be perfect. You don't have to have it all figured out. You just have to keep going, one day at a time. Sending love to everyone who needs to hear this today. 🌟",
      tags: ['motivation', 'self-care', 'positivity'],
      timestamp: '8 hours ago',
      reactions: { likes: 45, supports: 38, helpful: 20 },
      comments: 15,
      userReacted: true
    }
  ];

  const filters = [
    { id: 'all', name: 'All Posts', count: posts.length },
    { id: 'mental-health', name: 'Mental Health', count: 2 },
    { id: 'study-group', name: 'Study Groups', count: 1 },
    { id: 'wellness', name: 'Wellness', count: 2 }
  ];

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'likes':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'supports':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'helpful':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Community Feed</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            New Post
          </button>
        </div>

        {/* Filter Tabs */}
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

      {/* Posts */}
      <div className="divide-y divide-gray-200">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            {/* Post Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                post.isAnonymous 
                  ? 'bg-gray-400' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}>
                {post.isAnonymous ? '?' : post.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{post.author}</span>
                  {post.isAnonymous && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      Anonymous
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{post.timestamp}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-900 leading-relaxed">{post.content}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {Object.entries(post.reactions).map(([type, count]) => (
                  <button
                    key={type}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      post.userReacted && (type === 'likes' || type === 'supports')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {getReactionIcon(type)}
                    <span>{count}</span>
                  </button>
                ))}
              </div>
              <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.comments} comments</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="p-6 border-t border-gray-200">
        <button className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
          Load more posts
        </button>
      </div>
    </div>
  );
}