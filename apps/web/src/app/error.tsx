'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Animated Error Vector */}
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
            {/* Background Warning Elements */}
            <motion.polygon
              points="50,50 60,30 70,50"
              fill="#FEF3C7"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0
              }}
            />
            <motion.polygon
              points="330,70 340,50 350,70"
              fill="#FED7AA"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.5
              }}
            />

            {/* Main Error Symbol */}
            <motion.g
              animate={{
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Warning Triangle */}
              <motion.polygon
                points="200,80 160,180 240,180"
                fill="#FEF3C7"
                stroke="#F59E0B"
                strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
              
              {/* Exclamation Mark */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <rect x="195" y="110" width="10" height="40" rx="5" fill="#F59E0B" />
                <circle cx="200" cy="165" r="6" fill="#F59E0B" />
              </motion.g>
            </motion.g>

            {/* Broken Elements */}
            <motion.g
              animate={{
                x: [0, 2, -2, 0],
                y: [0, 1, -1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Broken Code Blocks */}
              <rect x="80" y="220" width="40" height="20" rx="4" fill="#EF4444" opacity="0.7" />
              <rect x="130" y="240" width="30" height="15" rx="3" fill="#F97316" opacity="0.6" />
              <rect x="280" y="230" width="35" height="18" rx="4" fill="#EF4444" opacity="0.8" />
              
              {/* Crack Lines */}
              <motion.path
                d="M120 230 L140 250 M150 235 L170 255"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{
                  pathLength: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 1
                }}
              />
            </motion.g>

            {/* Floating Error Messages */}
            <motion.g
              animate={{
                y: [0, -10, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.2
              }}
            >
              <rect x="60" y="100" width="60" height="25" rx="12" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
              <text x="90" y="117" fontSize="10" fill="#DC2626" textAnchor="middle" fontWeight="bold">ERROR</text>
            </motion.g>

            <motion.g
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 0.9, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1.5
              }}
            >
              <rect x="290" y="120" width="50" height="20" rx="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
              <text x="315" y="133" fontSize="8" fill="#D97706" textAnchor="middle" fontWeight="bold">OOPS!</text>
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
            Something Went Wrong
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Don't worry! Even the best platforms have hiccups sometimes. 
            We're here to help you get back on track with your student journey.
          </p>
        </motion.div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-2xl mx-auto"
          >
            <h3 className="text-sm font-semibold text-red-800 mb-2">Development Error Details:</h3>
            <p className="text-sm text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={reset}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            Go Home
          </button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What can you do?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold mb-2">🔄 Refresh</div>
              <p className="text-gray-600">Try refreshing the page or clicking "Try Again"</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold mb-2">🏠 Go Home</div>
              <p className="text-gray-600">Return to the main page and navigate from there</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-semibold mb-2">💬 Get Help</div>
              <p className="text-gray-600">Contact support if the problem persists</p>
            </div>
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
            💪 Remember: Every challenge is an opportunity to grow stronger. 
            We're here to support you through any technical difficulties!
          </p>
        </motion.div>
      </div>
    </div>
  );
}