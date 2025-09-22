'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MoodTrackingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated Mood Vector */}
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
            {/* Mood Faces */}
            <motion.g
              animate={{
                y: [0, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Happy Face */}
              <circle cx="120" cy="120" r="25" fill="#10B981" />
              <circle cx="115" cy="115" r="3" fill="white" />
              <circle cx="125" cy="115" r="3" fill="white" />
              <path d="M110 125 Q120 135 130 125" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -8, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              {/* Neutral Face */}
              <circle cx="200" cy="100" r="25" fill="#F59E0B" />
              <circle cx="195" cy="95" r="3" fill="white" />
              <circle cx="205" cy="95" r="3" fill="white" />
              <line x1="190" y1="105" x2="210" y2="105" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -6, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              {/* Sad Face */}
              <circle cx="280" cy="130" r="25" fill="#EF4444" />
              <circle cx="275" cy="125" r="3" fill="white" />
              <circle cx="285" cy="125" r="3" fill="white" />
              <path d="M270 140 Q280 130 290 140" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            </motion.g>
            
            {/* Central Mood Tracker */}
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
              <circle cx="200" cy="180" r="35" fill="#8B5CF6" />
              <text x="200" y="188" fontSize="24" fill="white" textAnchor="middle">📊</text>
            </motion.g>
            
            {/* Mood Scale */}
            <motion.g
              animate={{
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <rect x="150" y="240" width="100" height="8" rx="4" fill="#E5E7EB" />
              <rect x="150" y="240" width="70" height="8" rx="4" fill="#8B5CF6" />
              <circle cx="220" cy="244" r="6" fill="#8B5CF6" />
            </motion.g>
            
            {/* Floating Labels */}
            <motion.g
              animate={{
                y: [0, -3, 0],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.3
              }}
            >
              <rect x="80" y="60" width="50" height="20" rx="10" fill="#D1FAE5" stroke="#10B981" strokeWidth="1" />
              <text x="105" y="73" fontSize="10" fill="#047857" textAnchor="middle" fontWeight="bold">Great</text>
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -4, 0],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: 0.8
              }}
            >
              <rect x="270" y="70" width="50" height="20" rx="10" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
              <text x="295" y="83" fontSize="10" fill="#DC2626" textAnchor="middle" fontWeight="bold">Low</text>
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
            Mood Tracking
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track your daily mood and emotional patterns with our intelligent mood logging system. 
            This feature is being developed to help you understand your mental health journey.
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
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900 mb-2">Daily Tracking</h3>
            <p className="text-sm text-gray-600">Log your mood multiple times per day with simple taps</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold text-gray-900 mb-2">Pattern Recognition</h3>
            <p className="text-sm text-gray-600">AI-powered insights into your emotional patterns</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Tips</h3>
            <p className="text-sm text-gray-600">Get recommendations based on your mood trends</p>
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
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
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
            💖 Your emotional wellbeing matters. Advanced mood tracking tools coming soon!
          </p>
        </motion.div>
      </div>
    </div>
  );
}