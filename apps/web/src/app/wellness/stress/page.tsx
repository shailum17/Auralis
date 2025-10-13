'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function StressManagementPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Stress Management Vector */}
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
              {/* Central Person */}
              <motion.g
                animate={{
                  y: [0, -3, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Body */}
                <ellipse cx="200" cy="180" rx="25" ry="35" fill="#10B981" />
                {/* Head */}
                <circle cx="200" cy="130" r="20" fill="#FCD34D" />
                {/* Calm expression */}
                <circle cx="195" cy="125" r="2" fill="#374151" />
                <circle cx="205" cy="125" r="2" fill="#374151" />
                <path d="M190 135 Q200 140 210 135" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Arms relaxed */}
                <circle cx="175" cy="165" r="6" fill="#FCD34D" />
                <circle cx="225" cy="165" r="6" fill="#FCD34D" />
              </motion.g>
              
              {/* Stress Clouds (fading away) */}
              <motion.g
                animate={{
                  opacity: [0.8, 0.3, 0.1],
                  scale: [1, 1.2, 1.5],
                  x: [-10, -20, -30]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              >
                <ellipse cx="120" cy="100" rx="15" ry="10" fill="#EF4444" fillOpacity="0.3" />
                <text x="120" y="105" fontSize="12" fill="#EF4444" textAnchor="middle">😰</text>
              </motion.g>
              
              <motion.g
                animate={{
                  opacity: [0.8, 0.3, 0.1],
                  scale: [1, 1.2, 1.5],
                  x: [10, 20, 30]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5
                }}
              >
                <ellipse cx="280" cy="110" rx="15" ry="10" fill="#F59E0B" fillOpacity="0.3" />
                <text x="280" y="115" fontSize="12" fill="#F59E0B" textAnchor="middle">😤</text>
              </motion.g>
              
              {/* Calming Elements */}
              <motion.g
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  staggerChildren: 0.3
                }}
              >
                <circle cx="150" cy="200" r="8" fill="#10B981" fillOpacity="0.3" />
                <text x="150" y="206" fontSize="14" fill="#10B981" textAnchor="middle">🌱</text>
                
                <circle cx="250" cy="190" r="8" fill="#3B82F6" fillOpacity="0.3" />
                <text x="250" y="196" fontSize="14" fill="#3B82F6" textAnchor="middle">💧</text>
                
                <circle cx="200" cy="220" r="8" fill="#8B5CF6" fillOpacity="0.3" />
                <text x="200" y="226" fontSize="14" fill="#8B5CF6" textAnchor="middle">🧘‍♀️</text>
              </motion.g>
              
              {/* Breathing Circle */}
              <motion.circle
                cx="200"
                cy="150"
                r="50"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeOpacity="0.4"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Positive Affirmations */}
              <motion.g
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  staggerChildren: 0.5
                }}
              >
                <rect x="80" y="250" width="60" height="20" rx="10" fill="#D1FAE5" stroke="#10B981" strokeWidth="1" />
                <text x="110" y="263" fontSize="8" fill="#047857" textAnchor="middle" fontWeight="bold">I am calm</text>
                
                <rect x="260" y="240" width="70" height="20" rx="10" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
                <text x="295" y="253" fontSize="8" fill="#1D4ED8" textAnchor="middle" fontWeight="bold">I can handle this</text>
              </motion.g>
              
              {/* Stress Level Meter (decreasing) */}
              <motion.g
                animate={{
                  scaleX: [1, 0.3, 0.1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              >
                <rect x="320" y="150" width="60" height="8" rx="4" fill="#FEE2E2" />
                <rect x="320" y="150" width="40" height="8" rx="4" fill="#EF4444" />
                <text x="350" y="145" fontSize="10" fill="#374151" textAnchor="middle">Stress</text>
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
              Stress Management
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Learn effective techniques to manage academic stress, build resilience, 
              and maintain mental balance during challenging times.
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
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-semibold text-gray-900 mb-2">Coping Strategies</h3>
              <p className="text-sm text-gray-600">Evidence-based techniques to handle stress and anxiety</p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Stress Tracking</h3>
              <p className="text-sm text-gray-600">Monitor your stress levels and identify triggers</p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
              <div className="text-3xl mb-3">🌱</div>
              <h3 className="font-semibold text-gray-900 mb-2">Resilience Building</h3>
              <p className="text-sm text-gray-600">Develop mental strength and emotional resilience</p>
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
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
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
              🌱 Take a deep breath. Stress management tools launching soon!
            </p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}