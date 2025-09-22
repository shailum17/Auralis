'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ProfileHeader() {
  const [isEditing, setIsEditing] = useState(false);

  const userProfile = {
    name: 'Sarah Anderson',
    username: '@sarah_a',
    major: 'Psychology Major',
    year: 'Junior',
    bio: 'Passionate about mental health advocacy and peer support. Always here to listen and share resources. 🌟',
    joinDate: 'September 2023',
    stats: {
      posts: 24,
      helpfulVotes: 156,
      studyGroups: 8,
      wellnessStreak: 12
    },
    badges: [
      { name: 'Supportive Peer', icon: '🤝', color: 'bg-blue-100 text-blue-800' },
      { name: 'Wellness Warrior', icon: '💪', color: 'bg-green-100 text-green-800' },
      { name: 'Study Buddy', icon: '📚', color: 'bg-purple-100 text-purple-800' }
    ]
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            
            {/* Profile Info */}
            <div className="flex items-start space-x-6">
              
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">SA</span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
                  <span className="text-gray-500">{userProfile.username}</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span>{userProfile.major}</span>
                  <span>•</span>
                  <span>{userProfile.year}</span>
                  <span>•</span>
                  <span>Joined {userProfile.joinDate}</span>
                </div>

                <p className="text-gray-700 max-w-2xl mb-4">{userProfile.bio}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {userProfile.badges.map((badge, index) => (
                    <motion.div
                      key={badge.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 lg:mt-0 flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Edit Profile
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                Share Profile
              </button>
              <button className="text-gray-400 hover:text-gray-600 p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(userProfile.stats).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}