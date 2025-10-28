'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityService } from '@/lib/community-service';

interface ForumSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function ForumSidebar({ selectedCategory, setSelectedCategory }: ForumSidebarProps) {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    posts: 0,
    replies: 0,
    likes: 0,
    reputation: 0
  });
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    count: number;
    color: string;
  }>>([]);
  const [trendingTopics, setTrendingTopics] = useState<Array<{
    name: string;
    posts: number;
    trend: 'up' | 'stable' | 'down';
  }>>([]);

  useEffect(() => {
    // Load category stats
    const loadCategoryStats = () => {
      const categoryStats = CommunityService.getCategoryStats();
      setCategories(categoryStats);
    };

    // Load trending topics
    const loadTrendingTopics = () => {
      const trending = CommunityService.getTrendingTopics();
      setTrendingTopics(trending);
    };

    // Load user stats if user is logged in
    const loadUserStats = () => {
      if (user) {
        const stats = CommunityService.getUserCommunityStats(user.id);
        setUserStats(stats);
      }
    };

    loadCategoryStats();
    loadTrendingTopics();
    loadUserStats();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* User Stats Card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.fullName?.charAt(0) || user.username?.charAt(0) || user.email.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">
                {user.fullName || user.username || user.email.split('@')[0]}
              </h3>
              <p className="text-xs text-gray-500">Community Member</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-lg font-bold text-blue-600">{userStats.posts}</div>
              <div className="text-xs text-blue-600">Posts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <div className="text-lg font-bold text-green-600">{userStats.replies}</div>
              <div className="text-xs text-green-600">Replies</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="text-lg font-bold text-purple-600">{userStats.likes}</div>
              <div className="text-xs text-purple-600">Likes</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2">
              <div className="text-lg font-bold text-orange-600">{userStats.reputation}</div>
              <div className="text-xs text-orange-600">Rep</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span>📂</span>
            <span>Categories</span>
          </h3>
        </div>
        <div className="p-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{category.icon}</span>
                <div className="text-left">
                  <div className={`font-medium text-sm ${
                    selectedCategory === category.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {category.name}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedCategory === category.id 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {category.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span>🔥</span>
            <span>Trending Topics</span>
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {trendingTopics.length === 0 ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">No trending topics yet</p>
              <p className="text-xs text-gray-500">Start posting to see trends!</p>
            </div>
          ) : (
            trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-medium text-sm text-gray-900">{topic.name}</div>
                  <div className="text-xs text-gray-500">{topic.posts} posts</div>
                </div>
                <div className="flex items-center space-x-1">
                  {topic.trend === 'up' ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Admin Panel Link - Only show for admins/moderators */}
      {user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
          <h3 className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
            <span>🛡️</span>
            <span>Administration</span>
          </h3>
          <p className="text-sm text-red-800 mb-3">
            Manage and moderate the community forum
          </p>
          <button 
            onClick={() => window.location.href = '/community/admin'}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Open Admin Panel
          </button>
        </div>
      )}

      {/* Community Guidelines */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
          <span>📋</span>
          <span>Community Guidelines</span>
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be respectful and kind</li>
          <li>• No spam or self-promotion</li>
          <li>• Use appropriate categories</li>
          <li>• Help others when you can</li>
        </ul>
        <button className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium">
          Read full guidelines →
        </button>
      </div>
    </div>
  );
}