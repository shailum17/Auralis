'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Animated 404 Vector */}
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
            {/* Background Elements */}
            <motion.circle
              cx="100"
              cy="80"
              r="4"
              fill="#E5E7EB"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0
              }}
            />
            <motion.circle
              cx="300"
              cy="60"
              r="3"
              fill="#D1D5DB"
              animate={{
                y: [0, -8, 0],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.5
              }}
            />
            <motion.circle
              cx="320"
              cy="200"
              r="5"
              fill="#F3F4F6"
              animate={{
                y: [0, -12, 0],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1
              }}
            />

            {/* Main Character - Lost Student */}
            <motion.g
              initial={{ y: 10 }}
              animate={{ y: [10, 0, 10] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Body */}
              <ellipse cx="200" cy="220" rx="25" ry="35" fill="#3B82F6" />
              
              {/* Head */}
              <circle cx="200" cy="170" r="20" fill="#FEF3C7" />
              
              {/* Hair */}
              <path
                d="M185 155 Q200 145 215 155 Q210 150 200 150 Q190 150 185 155"
                fill="#92400E"
              />
              
              {/* Eyes */}
              <motion.g
                animate={{
                  scaleY: [1, 0.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 2
                }}
              >
                <circle cx="195" cy="168" r="2" fill="#1F2937" />
                <circle cx="205" cy="168" r="2" fill="#1F2937" />
              </motion.g>
              
              {/* Mouth - Confused */}
              <path
                d="M195 175 Q200 180 205 175"
                stroke="#1F2937"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Arms */}
              <motion.line
                x1="175"
                y1="200"
                x2="160"
                y2="190"
                stroke="#3B82F6"
                strokeWidth="8"
                strokeLinecap="round"
                animate={{
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
              <motion.line
                x1="225"
                y1="200"
                x2="240"
                y2="190"
                stroke="#3B82F6"
                strokeWidth="8"
                strokeLinecap="round"
                animate={{
                  rotate: [0, -10, 10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5
                }}
              />
              
              {/* Legs */}
              <line x1="190" y1="250" x2="185" y2="280" stroke="#1F2937" strokeWidth="6" strokeLinecap="round" />
              <line x1="210" y1="250" x2="215" y2="280" stroke="#1F2937" strokeWidth="6" strokeLinecap="round" />
            </motion.g>

            {/* Question Marks */}
            <motion.g
              animate={{
                y: [0, -5, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.3
              }}
            >
              <text x="250" y="140" fontSize="24" fill="#6B7280" fontWeight="bold">?</text>
            </motion.g>
            <motion.g
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.8
              }}
            >
              <text x="140" y="120" fontSize="18" fill="#9CA3AF" fontWeight="bold">?</text>
            </motion.g>

            {/* 404 Text */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <text
                x="200"
                y="50"
                fontSize="48"
                fontWeight="bold"
                fill="url(#gradient404)"
                textAnchor="middle"
              >
                404
              </text>
            </motion.g>

            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradient404" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Looks like you've wandered into uncharted territory. This page is still under development 
            or doesn't exist yet. Don't worry, even the best students get lost sometimes!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            Go to Dashboard
          </Link>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you think this is an error, or if you're looking for something specific, 
            here are some helpful links:
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/community"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Community Forum
            </Link>
            <Link
              href="/resources"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Resources
            </Link>
            <Link
              href="/wellness"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Wellness Center
            </Link>
            <Link
              href="/support"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Get Support
            </Link>
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-8 text-sm text-gray-500"
        >
          <p>
            🌟 Remember: Every great journey has a few detours. 
            You're doing great, and we're here to support you!
          </p>
        </motion.div>
      </div>
    </div>
  );
}