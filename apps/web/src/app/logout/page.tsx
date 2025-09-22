'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LogoutPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // In a real app, you would redirect to home or login page
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated Logout Vector */}
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
            {/* Door Frame */}
            <rect x="150" y="80" width="100" height="140" rx="5" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="2" />
            <rect x="160" y="90" width="80" height="120" rx="3" fill="#F3F4F6" />
            
            {/* Door Handle */}
            <motion.circle
              cx="220"
              cy="150"
              r="4"
              fill="#6B7280"
              animate={{
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Exit Arrow */}
            <motion.g
              animate={{
                x: [0, 10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <path
                d="M270 140 L290 150 L270 160 M280 150 L260 150"
                stroke="#EF4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </motion.g>
            
            {/* Waving Hand */}
            <motion.g
              animate={{
                rotate: [0, 20, -20, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <circle cx="120" cy="150" r="20" fill="#FEF3C7" />
              <text x="120" y="158" fontSize="24" textAnchor="middle">👋</text>
            </motion.g>
            
            {/* Floating Goodbye Messages */}
            <motion.g
              animate={{
                y: [0, -10, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.5
              }}
            >
              <rect x="80" y="100" width="60" height="25" rx="12" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
              <text x="110" y="117" fontSize="10" fill="#DC2626" textAnchor="middle" fontWeight="bold">See you soon!</text>
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -8, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1.2
              }}
            >
              <rect x="260" y="200" width="70" height="25" rx="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
              <text x="295" y="217" fontSize="10" fill="#D97706" textAnchor="middle" fontWeight="bold">Take care!</text>
            </motion.g>
            
            {/* Countdown Circle */}
            <motion.g
              animate={{
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <circle cx="200" cy="250" r="25" fill="#EF4444" />
              <text x="200" y="258" fontSize="20" fill="white" textAnchor="middle" fontWeight="bold">
                {countdown}
              </text>
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
            Goodbye! 👋
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            You have been successfully logged out. Thank you for using our Student Community Platform. 
            We hope to see you again soon!
          </p>
        </motion.div>

        {/* Logout Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 max-w-md mx-auto"
        >
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-900">Logout Successful</h3>
          </div>
          <p className="text-green-800 text-sm">
            Your session has been securely ended. Redirecting to home page in {countdown} seconds...
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Session</h3>
            <p className="text-sm text-gray-600">Your data is safe and session is cleared</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="font-semibold text-gray-900 mb-2">Data Saved</h3>
            <p className="text-sm text-gray-600">All your progress has been automatically saved</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="font-semibold text-gray-900 mb-2">Come Back Soon</h3>
            <p className="text-sm text-gray-600">Your community is waiting for you</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Go to Home
          </Link>
          <Link
            href="/auth/signin"
            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            Sign In Again
          </Link>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-8 text-sm text-gray-500"
        >
          <p>
            🚀 Thank you for being part of our community. Your mental health and success matter to us!
          </p>
        </motion.div>
      </div>
    </div>
  );
}