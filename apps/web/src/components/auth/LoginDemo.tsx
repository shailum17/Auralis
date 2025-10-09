'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginDemoProps {
  className?: string;
}

export function LoginDemo({ className = '' }: LoginDemoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const demoCredentials = [
    {
      type: 'Email',
      value: 'john.doe@example.com',
      description: 'Standard email login',
      username: 'john_doe'
    },
    {
      type: 'Username',
      value: 'student123',
      description: 'Username-based login',
      email: 'student123@example.com'
    },
    {
      type: 'Username',
      value: 'demo_user',
      description: 'Demo account',
      email: 'demo@example.com'
    }
  ];

  const features = [
    'Smart input detection (email vs username)',
    'Real-time validation and feedback',
    'Two-factor authentication with OTP',
    'Customizable session duration',
    'Social authentication integration',
    'Accessibility-first design'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.8 }}
      className={`bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-1">Database Authentication</h3>
          <p className="text-sm text-blue-700">Use your actual database credentials (email or username)</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-lg transition-colors"
          aria-label={isExpanded ? 'Collapse demo' : 'Expand demo'}
        >
          <svg 
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Demo Credentials */}
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-3">How to Use</h4>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-900">Database Credentials</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Use any existing user from your database:
                  </p>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p>• Enter your <strong>email address</strong> or <strong>username</strong></p>
                    <p>• Use your actual <strong>password</strong></p>
                    <p>• Complete <strong>OTP verification</strong> via email</p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium text-blue-900">Smart Detection</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    The system automatically detects whether you're entering an email or username and validates accordingly.
                  </p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-3">Enhanced Features</h4>
              <div className="grid grid-cols-1 gap-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center space-x-2 text-sm text-blue-800"
                  >
                    <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200">
              <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
                Try Password Login
              </button>
              <button className="text-xs bg-white text-blue-600 border border-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors">
                Try OTP Login
              </button>
              <button className="text-xs bg-white text-blue-600 border border-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors">
                Test Social Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed State */}
      {!isExpanded && (
        <div className="flex items-center space-x-4 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Email & Username Support</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Enhanced Security</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export type { LoginDemoProps };