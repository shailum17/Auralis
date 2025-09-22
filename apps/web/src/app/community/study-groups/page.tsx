'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function StudyGroupsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated Study Groups Vector */}
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
            {/* Study Group Circle */}
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
              {/* Students around table */}
              <circle cx="200" cy="120" r="15" fill="#3B82F6" />
              <text x="200" y="128" fontSize="12" fill="white" textAnchor="middle">👨‍🎓</text>
              
              <circle cx="250" cy="140" r="15" fill="#10B981" />
              <text x="250" y="148" fontSize="12" fill="white" textAnchor="middle">👩‍🎓</text>
              
              <circle cx="250" cy="190" r="15" fill="#F59E0B" />
              <text x="250" y="198" fontSize="12" fill="white" textAnchor="middle">👨‍🎓</text>
              
              <circle cx="200" cy="210" r="15" fill="#EF4444" />
              <text x="200" y="218" fontSize="12" fill="white" textAnchor="middle">👩‍🎓</text>
              
              <circle cx="150" cy="190" r="15" fill="#8B5CF6" />
              <text x="150" y="198" fontSize="12" fill="white" textAnchor="middle">👨‍🎓</text>
              
              <circle cx="150" cy="140" r="15" fill="#EC4899" />
              <text x="150" y="148" fontSize="12" fill="white" textAnchor="middle">👩‍🎓</text>
            </motion.g>
            
            {/* Central Table/Books */}
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
              <circle cx="200" cy="165" r="25" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
              <rect x="190" y="155" width="20" height="3" fill="#3B82F6" />
              <rect x="185" y="160" width="30" height="3" fill="#10B981" />
              <rect x="195" y="165" width="15" height="3" fill="#F59E0B" />
              <rect x="188" y="170" width="25" height="3" fill="#EF4444" />
            </motion.g>
            
            {/* Floating Study Topics */}
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
              <rect x="80" y="80" width="60" height="25" rx="12" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
              <text x="110" y="97" fontSize="10" fill="#1E40AF" textAnchor="middle" fontWeight="bold">Math Study</text>
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
              <rect x="260" y="60" width="70" height="25" rx="12" fill="#D1FAE5" stroke="#10B981" strokeWidth="1" />
              <text x="295" y="77" fontSize="10" fill="#047857" textAnchor="middle" fontWeight="bold">Science Lab</text>
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -6, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: 1.2
              }}
            >
              <rect x="70" y="230" width="80" height="25" rx="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
              <text x="110" y="247" fontSize="10" fill="#D97706" textAnchor="middle" fontWeight="bold">History Group</text>
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -12, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                delay: 0.5
              }}
            >
              <rect x="250" y="240" width="90" height="25" rx="12" fill="#F3E8FF" stroke="#8B5CF6" strokeWidth="1" />
              <text x="295" y="257" fontSize="10" fill="#6B21A8" textAnchor="middle" fontWeight="bold">Language Club</text>
            </motion.g>
            
            {/* Connection Lines */}
            <motion.g
              animate={{
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <line x1="185" y1="130" x2="175" y2="150" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="215" y1="130" x2="225" y2="150" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="235" y1="180" x2="215" y2="180" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="215" y1="200" x2="185" y2="200" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="165" y1="180" x2="185" y2="180" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="165" y1="150" x2="185" y2="150" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
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
            Study Groups
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find your perfect study partners and create collaborative learning experiences. 
            Our study group matching system is being developed to connect you with like-minded peers!
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
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
            <p className="text-sm text-gray-600">AI-powered matching based on subjects and study styles</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Schedule Coordination</h3>
            <p className="text-sm text-gray-600">Find common study times that work for everyone</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-sm text-gray-600">Monitor group goals and celebrate achievements together</p>
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
            href="/community"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Back to Community
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
            🤝 Better together! Study group features are coming to help you succeed collaboratively.
          </p>
        </motion.div>
      </div>
    </div>
  );
}