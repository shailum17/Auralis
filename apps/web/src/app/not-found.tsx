'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Animated 404 Illustration */}
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
              r="20"
              fill="#E0E7FF"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0
              }}
            />
            <motion.circle
              cx="320"
              cy="100"
              r="15"
              fill="#FEF3C7"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.5
              }}
            />

            {/* Main 404 Text */}
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
              <text
                x="200"
                y="150"
                fontSize="72"
                fontWeight="bold"
                fill="url(#gradient404)"
                textAnchor="middle"
                className="font-mono"
              >
                404
              </text>
            </motion.g>

            {/* Floating Question Marks */}
            <motion.g
              animate={{
                rotate: [0, 10, -10, 0],
                y: [0, -8, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.2
              }}
            >
              <text x="120" y="200" fontSize="24" fill="#6366F1" textAnchor="middle">?</text>
            </motion.g>

            <motion.g
              animate={{
                rotate: [0, -15, 15, 0],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1
              }}
            >
              <text x="280" y="190" fontSize="20" fill="#8B5CF6" textAnchor="middle">?</text>
            </motion.g>

            {/* Search Icon */}
            <motion.g
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1.5
              }}
            >
              <circle cx="200" cy="220" r="25" fill="none" stroke="#6366F1" strokeWidth="3" />
              <path d="m220 240 10 10" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
            </motion.g>

            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradient404" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
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
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Looks like you've wandered off the beaten path! The page you're looking for 
            doesn't exist or may have been moved.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            Go Back
          </button>
        </motion.div>

        {/* Popular Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Link href="/dashboard" className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="text-blue-600 font-semibold mb-1">📊 Dashboard</div>
              <p className="text-gray-600">Your main hub</p>
            </Link>
            <Link href="/wellness" className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="text-green-600 font-semibold mb-1">🌱 Wellness</div>
              <p className="text-gray-600">Mental health tools</p>
            </Link>
            <Link href="/profile" className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="text-purple-600 font-semibold mb-1">👤 Profile</div>
              <p className="text-gray-600">Your account</p>
            </Link>
            <Link href="/auth/signin" className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <div className="text-orange-600 font-semibold mb-1">🔐 Sign In</div>
              <p className="text-gray-600">Access your account</p>
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
            🧭 Lost? No worries! Every great journey has a few detours. 
            Let's get you back on track to achieving your goals!
          </p>
        </motion.div>
      </div>
    </div>
  );
}