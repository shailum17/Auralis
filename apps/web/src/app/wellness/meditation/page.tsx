'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui';

export default function MeditationPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Meditation Vector */}
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
              {/* Meditation Person */}
              <motion.g
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Body */}
                <ellipse cx="200" cy="180" rx="30" ry="40" fill="#10B981" />
                {/* Head */}
                <circle cx="200" cy="120" r="25" fill="#F59E0B" />
                {/* Eyes closed */}
                <path d="M190 115 Q195 120 200 115" stroke="#374151" strokeWidth="2" fill="none" />
                <path d="M200 115 Q205 120 210 115" stroke="#374151" strokeWidth="2" fill="none" />
                {/* Peaceful smile */}
                <path d="M190 130 Q200 135 210 130" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Arms in meditation pose */}
                <circle cx="170" cy="160" r="8" fill="#F59E0B" />
                <circle cx="230" cy="160" r="8" fill="#F59E0B" />
              </motion.g>
              
              {/* Breathing Circles */}
              <motion.circle
                cx="200"
                cy="150"
                r="60"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeOpacity="0.3"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.circle
                cx="200"
                cy="150"
                r="80"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeOpacity="0.2"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              
              {/* Floating Elements */}
              <motion.g
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 0.5
                }}
              >
                <text x="120" y="80" fontSize="20" fill="#10B981">🌸</text>
                <text x="280" y="90" fontSize="20" fill="#3B82F6">🍃</text>
                <text x="100" y="220" fontSize="20" fill="#8B5CF6">✨</text>
                <text x="300" y="210" fontSize="20" fill="#F59E0B">🌟</text>
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
              Meditation & Mindfulness
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Find inner peace and reduce stress with guided meditation sessions, breathing exercises, 
              and mindfulness practices designed for students.
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
              <div className="text-3xl mb-3">🧘‍♀️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Guided Sessions</h3>
              <p className="text-sm text-gray-600">5-30 minute guided meditations for all experience levels</p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
              <div className="text-3xl mb-3">🌬️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Breathing Exercises</h3>
              <p className="text-sm text-gray-600">Proven breathing techniques to reduce anxiety and stress</p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-sm text-gray-600">Track your meditation streaks and mindfulness journey</p>
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
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
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
              🧘‍♀️ Take a moment to breathe. Meditation features launching soon!
            </p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}