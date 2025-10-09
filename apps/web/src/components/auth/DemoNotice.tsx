'use client';

import { motion } from 'framer-motion';

interface DemoNoticeProps {
  className?: string;
}

export function DemoNotice({ className = '' }: DemoNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-green-900 mb-1">
            🎉 Database Authentication Active!
          </h4>
          <p className="text-sm text-green-800 mb-2">
            Enhanced login now uses real database credentials. You can authenticate with both email and username from your database.
          </p>
          <div className="text-xs text-green-700 space-y-1">
            <p><strong>✅ Database:</strong> Real user authentication</p>
            <p><strong>✅ Enhanced:</strong> Email & username support</p>
            <p><strong>✅ Secure:</strong> OTP verification & session control</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export type { DemoNoticeProps };