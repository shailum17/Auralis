'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated Settings Vector */}
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
            {/* Settings Gear */}
            <motion.g
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <circle cx="200" cy="150" r="40" fill="#6B7280" />
              <circle cx="200" cy="150" r="25" fill="#F9FAFB" />
              {/* Gear teeth */}
              <rect x="195" y="100" width="10" height="15" fill="#6B7280" />
              <rect x="195" y="185" width="10" height="15" fill="#6B7280" />
              <rect x="145" y="145" width="15" height="10" fill="#6B7280" />
              <rect x="240" y="145" width="15" height="10" fill="#6B7280" />
              <rect x="165" y="115" width="12" height="12" fill="#6B7280" transform="rotate(45 171 121)" />
              <rect x="223" y="115" width="12" height="12" fill="#6B7280" transform="rotate(-45 229 121)" />
              <rect x="165" y="173" width="12" height="12" fill="#6B7280" transform="rotate(-45 171 179)" />
              <rect x="223" y="173" width="12" height="12" fill="#6B7280" transform="rotate(45 229 179)" />
            </motion.g>
            
            {/* Floating Settings Icons */}
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
              <circle cx="120" cy="80" r="15" fill="#E5E7EB" />
              <text x="120" y="87" fontSize="14" textAnchor="middle">🔔</text>
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -8, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 0.8
              }}
            >
              <circle cx="280" cy="100" r="15" fill="#E5E7EB" />
              <text x="280" y="107" fontSize="14" textAnchor="middle">🔒</text>
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -12, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: 1.2
              }}
            >
              <circle cx="100" cy="220" r="15" fill="#E5E7EB" />
              <text x="100" y="227" fontSize="14" textAnchor="middle">🎨</text>
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -6, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                delay: 0.5
              }}
            >
              <circle cx="300" cy="200" r="15" fill="#E5E7EB" />
              <text x="300" y="207" fontSize="14" textAnchor="middle">⚙️</text>
            </motion.g>
            
            {/* Connection Lines */}
            <motion.g
              animate={{
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <line x1="135" y1="90" x2="175" y2="130" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="265" y1="110" x2="225" y2="130" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="115" y1="210" x2="175" y2="170" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="285" y1="190" x2="225" y2="170" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,5" />
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
            Settings
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Customize your experience with personalized settings and preferences. 
            This comprehensive settings panel is being developed!
          </p>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🔔</div>
            <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
            <p className="text-sm text-gray-600">Control when and how you receive updates</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Appearance</h3>
            <p className="text-sm text-gray-600">Customize themes, colors, and layout preferences</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Privacy Controls</h3>
            <p className="text-sm text-gray-600">Manage your data and privacy settings</p>
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
            href="/dashboard"
            className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/profile"
            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            View Profile
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
            ⚙️ Powerful customization options are coming soon. Your preferences matter to us!
          </p>
        </motion.div>
      </div>
    </div>
  );
}