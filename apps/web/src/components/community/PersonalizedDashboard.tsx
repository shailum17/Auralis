'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  memberCount: number;
  postCount: number;
  recentPosts: number;
  isUserInterest: boolean;
}

interface PersonalizedDashboardProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategory: string;
}

const forumCategories: Record<string, ForumCategory> = {
  'academic-help': {
    id: 'academic-help',
    name: 'Academic Help',
    description: 'Get help with assignments and study tips',
    icon: '📚',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    memberCount: 2847,
    postCount: 1523,
    recentPosts: 12,
    isUserInterest: false
  },
  'career-guidance': {
    id: 'career-guidance',
    name: 'Career Guidance',
    description: 'Discuss career paths and internships',
    icon: '💼',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    memberCount: 1956,
    postCount: 892,
    recentPosts: 8,
    isUserInterest: false
  },
  'mental-wellness': {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    description: 'Share experiences and support',
    icon: '🧘‍♀️',
    color: 'bg-green-100 text-green-700 border-green-200',
    memberCount: 1634,
    postCount: 756,
    recentPosts: 15,
    isUserInterest: false
  },
  'tech-innovation': {
    id: 'tech-innovation',
    name: 'Tech & Innovation',
    description: 'Explore latest technologies',
    icon: '💻',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    memberCount: 2156,
    postCount: 1234,
    recentPosts: 23,
    isUserInterest: false
  },
  'creative-arts': {
    id: 'creative-arts',
    name: 'Creative Arts',
    description: 'Share your creative work',
    icon: '🎨',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    memberCount: 987,
    postCount: 543,
    recentPosts: 6,
    isUserInterest: false
  },
  'sports-fitness': {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    description: 'Discuss fitness and sports',
    icon: '⚽',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    memberCount: 1423,
    postCount: 678,
    recentPosts: 9,
    isUserInterest: false
  },
  'campus-life': {
    id: 'campus-life',
    name: 'Campus Life',
    description: 'Share campus experiences',
    icon: '🏫',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    memberCount: 3245,
    postCount: 2156,
    recentPosts: 18,
    isUserInterest: false
  },
  'study-groups': {
    id: 'study-groups',
    name: 'Study Groups',
    description: 'Form study groups and collaborate',
    icon: '👥',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    memberCount: 1789,
    postCount: 934,
    recentPosts: 11,
    isUserInterest: false
  }
};

export default function PersonalizedDashboard({ onCategorySelect, selectedCategory }: PersonalizedDashboardProps) {
  const { user } = useAuth();
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [personalizedCategories, setPersonalizedCategories] = useState<ForumCategory[]>([]);
  const [otherCategories, setOtherCategories] = useState<ForumCategory[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    // Load user interests from localStorage
    const interests = localStorage.getItem('userInterests');
    if (interests) {
      const parsedInterests = JSON.parse(interests);
      setUserInterests(parsedInterests);

      // Separate categories into user interests and others
      const userInterestCategories: ForumCategory[] = [];
      const otherCategoriesList: ForumCategory[] = [];

      Object.values(forumCategories).forEach(category => {
        const categoryWithInterest = {
          ...category,
          isUserInterest: parsedInterests.includes(category.id)
        };

        if (parsedInterests.includes(category.id)) {
          userInterestCategories.push(categoryWithInterest);
        } else {
          otherCategoriesList.push(categoryWithInterest);
        }
      });

      setPersonalizedCategories(userInterestCategories);
      setOtherCategories(otherCategoriesList);
    } else {
      // If no interests saved, show all categories
      setOtherCategories(Object.values(forumCategories));
    }
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect(categoryId);
  };

  const handleManageInterests = () => {
    // Navigate to interest management
    window.location.href = '/community/interests';
  };

  return (
    <div className="space-y-6">
      {/* Your Forums Section */}
      {personalizedCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Your Forums</h2>
                  <p className="text-blue-100 text-sm">Based on your interests</p>
                </div>
              </div>
              <button
                onClick={handleManageInterests}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Manage
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalizedCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedCategory === category.id
                      ? `${category.color} shadow-lg scale-105`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{category.description}</p>
                      </div>
                    </div>
                    {category.recentPosts > 0 && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {category.recentPosts}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{category.memberCount.toLocaleString()} members</span>
                    <span>{category.postCount.toLocaleString()} posts</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* All Forums Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🌐</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {personalizedCategories.length > 0 ? 'Explore More Forums' : 'All Forums'}
                </h2>
                <p className="text-gray-600 text-sm">Discover new communities</p>
              </div>
            </div>
            {otherCategories.length > 4 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {showAllCategories ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(showAllCategories ? otherCategories : otherCategories.slice(0, 6)).map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleCategoryClick(category.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedCategory === category.id
                    ? `${category.color} shadow-lg scale-105`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                    </div>
                  </div>
                  {category.recentPosts > 0 && (
                    <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                      {category.recentPosts}
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{category.memberCount.toLocaleString()} members</span>
                  <span>{category.postCount.toLocaleString()} posts</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 border border-green-200"
      >
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <span>🚀</span>
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 transition-colors text-center">
            <div className="text-xl mb-1">✍️</div>
            <div className="text-sm font-medium text-gray-900">Create Post</div>
          </button>
          <button className="bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 transition-colors text-center">
            <div className="text-xl mb-1">🔍</div>
            <div className="text-sm font-medium text-gray-900">Search</div>
          </button>
          <button 
            onClick={handleManageInterests}
            className="bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 transition-colors text-center"
          >
            <div className="text-xl mb-1">⚙️</div>
            <div className="text-sm font-medium text-gray-900">Settings</div>
          </button>
          <button className="bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 transition-colors text-center">
            <div className="text-xl mb-1">📊</div>
            <div className="text-sm font-medium text-gray-900">Analytics</div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}