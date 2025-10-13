'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface DevelopmentOtpNoticeProps {
  otp: string;
  email: string;
  onDismiss?: () => void;
}

export function DevelopmentOtpNotice({ otp, email, onDismiss }: DevelopmentOtpNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy OTP:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-2xl border border-orange-300 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">🔐</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Development Mode</h3>
                  <p className="text-xs opacity-90">OTP for testing</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-white/10 rounded-md p-3 mb-3">
              <div className="text-xs opacity-75 mb-1">Verification code for:</div>
              <div className="font-mono text-sm break-all">{email}</div>
            </div>

            <div className="bg-white/20 rounded-md p-3 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-75 mb-1">Your OTP:</div>
                  <div className="font-mono text-2xl font-bold tracking-wider">{otp}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {copied ? '✓' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="text-xs opacity-75 text-center">
              In production, this code would be sent to your email.
              <br />
              This notice will auto-dismiss in 30 seconds.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}