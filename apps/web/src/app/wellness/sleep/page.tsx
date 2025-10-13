'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SleepTrackingPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Sleep Vector */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <svg
              className="w-80 h-80 mx-auto"
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Moon */}
              <motion.g
                animate={{
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <circle cx="120" cy="80" r="25" fill="#FCD34D" />
                <circle cx="115" cy="75" r="3" fill="#F59E0B" />
                <circle cx="125" cy="85" r="2" fill="#F59E0B" />
                <circle cx="118" cy="88" r="1.5" fill="#F59E0B" />
              </motion.g>
              
              {/* Stars */}
              <motion.g
                animate={{
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  staggerChildren: 0.2
                }}
              >
                <text x="80" y="50" fontSize="16" fill="#8B5CF6">⭐</text>
                <text x="160" y="40" fontSize="12" fill="#3B82F6">✨</text>
                <text x="200" y="60" fontSize="14" fill="#8B5CF6">⭐</text>
                <text x="280" y="45" fontSize="10" fill="#3B82F6">✨</text>
                <text x="320" y="70" fontSize="16" fill="#8B5CF6">⭐</text>
              </motion.g>
              
              {/* Sleeping Person */}
              <motion.g
                animate={{
                  y: [0, -3, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Bed */}
                <rect x="150" y="180" width="100" height="40" rx="5" fill="#8B5CF6" />
                <rect x="140" y="200" width="120" height="15" rx="7" fill="#6366F1" />
                
                {/* Person */}
                <ellipse cx="200" cy="170" rx="25" ry="15" fill="#F59E0B" />
                <circle cx="200" cy="155" r="12" fill="#FCD34D" />
                
                {/* Closed eyes */}
                <path d="M195 152 Q197 155 199 152" stroke="#374151" strokeWidth="1.5" fill="none" />
                <path d="M201 152 Q203 155 205 152" stroke="#374151" strokeWidth="1.5" fill="none" />
                
                {/* Peaceful expression */}
                <path d="M195 160 Q200 162 205 160" stroke="#374151" strokeWidth="1" fill="none" strokeLinecap="round" />
              </motion.g>
              
              {/* Sleep Waves */}
              <motion.g
                animate={{
                  opacity: [0.2, 0.8, 0.2]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  staggerChildren: 0.3
                }}
              >
                <path d="M260 140 Q270 135 280 140 Q290 145 300 140" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeOpacity="0.6" />
                <path d="M260 150 Q270 145 280 150 Q290 155 300 150" stroke="#3B82F6" strokeWidth="2" fill="none" strokeOpacity="0.4" />
                <path d="M260 160 Q270 155 280 160 Q290 165 300 160" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeOpacity="0.3" />
              </motion.g>
              
              {/* ZZZ */}
              <motion.g
                animate={{
                  y: [0, -10, -20],
                  opacity: [1, 0.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  staggerChildren: 0.3
                }}
              >
                <text x="220" y="130" fontSize="20" fill="#8B5CF6" fontWeight="bold">Z</text>
                <text x="230" y="120" fontSize="16" fill="#6366F1" fontWeight="bold">Z</text>
                <text x="240" y="110" fontSize="12" fill="#3B82F6" fontWeight="bold">Z</text>
              </motion.g>
              
              {/* Sleep Quality Indicator */}
              <motion.g
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <circle cx="200" cy="240" r="20" fill="#10B981" fillOpacity="0.2" />
                <text x="200" y="247" fontSize="16" fill="#10B981" textAnchor="middle">😴</text>
              </motion.g>
            </svg>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Sleep Tracker
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Monitor your sleep patterns, improve sleep quality, and wake up refreshed. 
              Better sleep leads to better academic performance and overall wellbeing.
            </p>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Sleep Analytics</h3>
              <p className="text-sm text-gray-600">Detailed insights into your sleep duration and quality</p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Alarms</h3>
              <p className="text-sm text-gray-600">Wake up during light sleep phases for better mornings</p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
              <div className="text-3xl mb-3">🌙</div>
              <h3 className="font-semibold text-gray-900 mb-2">Sleep Hygiene</h3>
              <p className="text-sm text-gray-600">Personalized tips to improve your sleep habits</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/wellness"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Back to Wellness
            </Link>
            <Link
              href="/dashboard"
              className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              Go to Dashboard
            </Link>
          </motion.div>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="mt-8 text-sm text-gray-500"
          >
            <p>
              😴 Sweet dreams! Advanced sleep tracking features coming soon!
            </p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}