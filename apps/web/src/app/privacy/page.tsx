'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated Privacy Vector */}
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
            {/* Shield */}
            <motion.g
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <path
                d="M200 80 L160 100 L160 180 Q160 200 200 220 Q240 200 240 180 L240 100 Z"
                fill="#3B82F6"
                stroke="#1E40AF"
                strokeWidth="2"
              />
              <path
                d="M200 90 L170 105 L170 175 Q170 190 200 205 Q230 190 230 175 L230 105 Z"
                fill="#60A5FA"
              />
            </motion.g>
            
            {/* Lock Icon in Shield */}
            <motion.g
              animate={{
                y: [0, -2, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <rect x="190" y="140" width="20" height="25" rx="3" fill="#1E40AF" />
              <circle cx="200" cy="130" r="8" fill="none" stroke="#1E40AF" strokeWidth="3" />
              <circle cx="200" cy="150" r="2" fill="#60A5FA" />
            </motion.g>
            
            {/* Floating Privacy Elements */}
            <motion.g
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <circle cx="120" cy="120" r="12" fill="#DBEAFE" />
              <text x="120" y="127" fontSize="12" textAnchor="middle">🔐</text>
              
              <circle cx="280" cy="140" r="12" fill="#EFF6FF" />
              <text x="280" y="147" fontSize="12" textAnchor="middle">👁️</text>
              
              <circle cx="300" cy="200" r="12" fill="#DBEAFE" />
              <text x="300" y="207" fontSize="12" textAnchor="middle">🛡️</text>
              
              <circle cx="100" cy="200" r="12" fill="#EFF6FF" />
              <text x="100" y="207" fontSize="12" textAnchor="middle">🔒</text>
            </motion.g>
            
            {/* Data Protection Indicators */}
            <motion.g
              animate={{
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity
              }}
            >
              <rect x="80" y="60" width="70" height="20" rx="10" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
              <text x="115" y="73" fontSize="10" fill="#1E40AF" textAnchor="middle" fontWeight="bold">Data Protected</text>
            </motion.g>
            
            <motion.g
              animate={{
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 1
              }}
            >
              <rect x="250" y="240" width="80" height="20" rx="10" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1" />
              <text x="290" y="253" fontSize="10" fill="#1E40AF" textAnchor="middle" fontWeight="bold">Privacy First</text>
            </motion.g>
            
            {/* Connection Lines */}
            <motion.g
              animate={{
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
            >
              <line x1="132" y1="130" x2="175" y2="140" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="268" y1="150" x2="225" y2="140" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="288" y1="190" x2="225" y2="170" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="112" y1="190" x2="175" y2="170" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
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
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your privacy is our top priority. We're crafting comprehensive privacy controls 
            and transparent policies to keep your data safe and secure.
          </p>
        </motion.div>

        {/* Privacy Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-semibold text-gray-900 mb-2">Data Encryption</h3>
            <p className="text-sm text-gray-600">End-to-end encryption for all your personal data</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">👁️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Transparency</h3>
            <p className="text-sm text-gray-600">Clear information about how we use your data</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">⚖️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Your Rights</h3>
            <p className="text-sm text-gray-600">Full control over your personal information</p>
          </div>
        </motion.div>

        {/* Temporary Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Privacy Notice</h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            We are currently developing our comprehensive privacy policy. In the meantime, 
            please know that we follow industry best practices for data protection and will 
            never share your personal information without your explicit consent.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/settings"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Privacy Settings
          </Link>
          <Link
            href="/dashboard"
            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            Back to Dashboard
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
            🛡️ Your trust is everything to us. Comprehensive privacy controls coming soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
}