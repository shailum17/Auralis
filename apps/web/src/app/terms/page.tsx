'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated Terms Vector */}
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
            {/* Document */}
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
              <rect x="120" y="60" width="160" height="200" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
              <rect x="140" y="80" width="120" height="4" fill="#64748B" />
              <rect x="140" y="100" width="100" height="3" fill="#94A3B8" />
              <rect x="140" y="115" width="110" height="3" fill="#94A3B8" />
              <rect x="140" y="130" width="90" height="3" fill="#94A3B8" />
              <rect x="140" y="150" width="120" height="3" fill="#94A3B8" />
              <rect x="140" y="165" width="80" height="3" fill="#94A3B8" />
              <rect x="140" y="180" width="100" height="3" fill="#94A3B8" />
              <rect x="140" y="195" width="110" height="3" fill="#94A3B8" />
              <rect x="140" y="210" width="70" height="3" fill="#94A3B8" />
            </motion.g>
            
            {/* Legal Icons */}
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
              <circle cx="80" cy="100" r="12" fill="#EFF6FF" />
              <text x="80" y="107" fontSize="12" textAnchor="middle">⚖️</text>
              
              <circle cx="320" cy="120" r="12" fill="#F0FDF4" />
              <text x="320" y="127" fontSize="12" textAnchor="middle">📋</text>
              
              <circle cx="340" cy="200" r="12" fill="#FEF3C7" />
              <text x="340" y="207" fontSize="12" textAnchor="middle">🔒</text>
              
              <circle cx="60" cy="220" r="12" fill="#FDF2F8" />
              <text x="60" y="227" fontSize="12" textAnchor="middle">✅</text>
            </motion.g>
            
            {/* Signature Line */}
            <motion.g
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <line x1="140" y1="235" x2="220" y2="235" stroke="#64748B" strokeWidth="2" strokeDasharray="5,5" />
              <text x="180" y="250" fontSize="10" fill="#64748B" textAnchor="middle">Signature</text>
            </motion.g>
            
            {/* Floating Legal Badges */}
            <motion.g
              animate={{
                y: [0, -8, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.3
              }}
            >
              <rect x="50" y="50" width="80" height="20" rx="10" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
              <text x="90" y="63" fontSize="10" fill="#1E40AF" textAnchor="middle" fontWeight="bold">Terms of Use</text>
            </motion.g>
            
            <motion.g
              animate={{
                y: [0, -6, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 0.8
              }}
            >
              <rect x="270" y="240" width="90" height="20" rx="10" fill="#F0FDF4" stroke="#10B981" strokeWidth="1" />
              <text x="315" y="253" fontSize="10" fill="#047857" textAnchor="middle" fontWeight="bold">User Agreement</text>
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
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're drafting comprehensive terms of service that protect both our users 
            and the platform. Clear, fair, and student-friendly terms are coming soon!
          </p>
        </motion.div>

        {/* Terms Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">⚖️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Fair Usage</h3>
            <p className="text-sm text-gray-600">Clear guidelines for respectful community interaction</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Privacy Rights</h3>
            <p className="text-sm text-gray-600">Your data rights and privacy protections explained</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-gray-900 mb-2">User Responsibilities</h3>
            <p className="text-sm text-gray-600">What we expect from our community members</p>
          </div>
        </motion.div>

        {/* Temporary Terms Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Terms Notice</h3>
          <p className="text-slate-800 text-sm leading-relaxed">
            We are currently developing our comprehensive terms of service. In the meantime, 
            by using our platform, you agree to use it respectfully and in accordance with 
            our community guidelines. Full terms will be available before public launch.
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
            href="/privacy"
            className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Privacy Policy
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
            📋 Clear, fair terms that protect our student community are being finalized.
          </p>
        </motion.div>
      </div>
    </div>
  );
}