'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log the error to an error reporting service
    console.error('Global Application Error:', error);
  }, [error]);

  if (!mounted) {
    return (
      <html lang="en">
        <body>
          <div>Loading...</div>
        </body>
      </html>
    );
  }

  const ErrorContent = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Animated Critical Error Vector */}
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
            {/* Background Alert Elements */}
            <motion.circle
              cx="80"
              cy="60"
              r="6"
              fill="#FEE2E2"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0
              }}
            />
            <motion.circle
              cx="320"
              cy="80"
              r="4"
              fill="#FECACA"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.3
              }}
            />

            {/* Main Error Robot/Character */}
            <motion.g
              animate={{
                y: [0, -5, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Robot Body */}
              <rect x="170" y="180" width="60" height="80" rx="15" fill="#DC2626" />
              
              {/* Robot Head */}
              <rect x="175" y="140" width="50" height="50" rx="10" fill="#EF4444" />
              
              {/* Eyes - X marks */}
              <motion.g
                animate={{
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1
                }}
              >
                <path d="M185 155 L195 165 M195 155 L185 165" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                <path d="M205 155 L215 165 M215 155 L205 165" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              </motion.g>
              
              {/* Mouth - Sad */}
              <path
                d="M185 175 Q200 170 215 175"
                stroke="#FFFFFF"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Arms - Hanging Down */}
              <motion.rect
                x="140"
                y="190"
                width="20"
                height="40"
                rx="10"
                fill="#DC2626"
                animate={{
                  rotate: [0, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5
                }}
              />
              <motion.rect
                x="240"
                y="190"
                width="20"
                height="40"
                rx="10"
                fill="#DC2626"
                animate={{
                  rotate: [0, 10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.8
                }}
              />
              
              {/* Legs */}
              <rect x="180" y="260" width="15" height="30" rx="7" fill="#991B1B" />
              <rect x="205" y="260" width="15" height="30" rx="7" fill="#991B1B" />
            </motion.g>

            {/* Error Sparks/Glitches */}
            <motion.g
              animate={{
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <path d="M160 140 L150 130 L155 135 L145 125" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              <path d="M240 150 L250 140 L245 145 L255 135" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              <path d="M200 120 L195 110 L200 115 L190 105" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            </motion.g>

            {/* Error Text */}
            <motion.text
              x="200"
              y="50"
              fontSize="36"
              fontWeight="bold"
              fill="url(#gradientError)"
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              ERROR
            </motion.text>

            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradientError" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#F97316" />
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
            Oops! Something Broke
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We encountered an unexpected error. Don't worry - this happens sometimes, 
            and it's not your fault! Our team has been notified and we're working on a fix.
          </p>
        </motion.div>

        {/* Error Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <button
            onClick={reset}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            Go to Homepage
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all"
          >
            Refresh Page
          </button>
        </motion.div>

        {/* Support Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Immediate Help?</h3>
          <p className="text-gray-600 mb-4">
            If you're experiencing a mental health crisis or need immediate support:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-red-600 font-semibold mb-2">🚨 Crisis Support</div>
              <p className="text-sm text-gray-700">National Suicide Prevention Lifeline</p>
              <p className="text-lg font-bold text-red-600">988</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-blue-600 font-semibold mb-2">💬 Campus Support</div>
              <p className="text-sm text-gray-700">Student Counseling Services</p>
              <p className="text-lg font-bold text-blue-600">(555) 123-HELP</p>
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
            🌟 Technical difficulties don't define your journey. 
            You're resilient, and we're here to support you every step of the way!
          </p>
        </motion.div>
      </div>
    </div>
  );

  return (
    <html lang="en">
      <body>
        <ErrorContent />
      </body>
    </html>
  );
}