'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';

interface OTPVerificationProps {
  email: string;
  method: 'password' | 'otp';
  onComplete: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function OTPVerification({
  email,
  method,
  onComplete,
  onResend,
  onBack,
  loading = false,
  error,
  className = ''
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);

  // Start cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Auto-confirm email after a short delay to simulate checking
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEmailConfirmed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleOtpChange = useCallback((newOtp: string[]) => {
    setOtp(newOtp);
  }, []);

  const handleOtpComplete = useCallback((otpCode: string) => {
    if (loading) return; // Prevent multiple submissions while loading
    setAttempts(prev => prev + 1);
    onComplete(otpCode);
  }, [onComplete, loading]);

  const handleResend = useCallback(() => {
    if (resendCooldown > 0) return;
    
    setResendCooldown(60);
    setOtp(Array(6).fill(''));
    setAttempts(0);
    onResend();
  }, [resendCooldown, onResend]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHeaderContent = () => {
    if (method === 'password') {
      return {
        icon: (
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'Secure Login Verification',
        description: `Password verified! We sent a 6-digit verification code to ${email} for additional security.`
      };
    } else {
      return {
        icon: (
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        title: 'Check Your Email',
        description: `We sent a 6-digit verification code to ${email}`
      };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {headerContent.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {headerContent.title}
        </h3>
        <p className="text-gray-600 text-sm">
          {headerContent.description}
        </p>
      </div>

      {/* Email Confirmation Status */}
      <AnimatePresence>
        {!isEmailConfirmed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span className="text-sm text-blue-700">Checking email delivery...</span>
          </motion.div>
        )}
        
        {isEmailConfirmed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-700">Email delivered successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Input */}
      <div className="space-y-4">
        <OTPInput
          length={6}
          value={otp}
          onChange={handleOtpChange}
          onComplete={handleOtpComplete}
          loading={loading}
          error={error}
          autoFocus
          size="md"
          aria-label="Enter 6-digit verification code"
        />

        {/* Attempt Counter */}
        {attempts > 0 && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {attempts === 1 ? '1 attempt' : `${attempts} attempts`} made
              {attempts >= 3 && (
                <span className="text-amber-600 ml-1">
                  • Account may be temporarily locked after 5 failed attempts
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {/* Resend Code */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span className="text-gray-600">Didn't receive the code?</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={loading || resendCooldown > 0}
              className="text-blue-600 hover:text-blue-500"
            >
              {resendCooldown > 0 ? (
                <span className="flex items-center space-x-1">
                  <svg className="h-3 w-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Resend in {formatTime(resendCooldown)}</span>
                </span>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>

          {/* Rate Limiting Info */}
          {resendCooldown === 0 && attempts > 1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500 mt-2"
            >
              You can request a new code every minute
            </motion.p>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={loading}
            className="text-gray-600 hover:text-gray-900"
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Back to Login
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <details className="group">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 list-none">
            <span className="flex items-center justify-center space-x-1">
              <span>Need help?</span>
              <svg className="h-3 w-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </summary>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 p-3 bg-gray-50 rounded-lg text-left"
          >
            <div className="space-y-2 text-xs text-gray-600">
              <p><strong>Code not arriving?</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Check your spam/junk folder</li>
                <li>Ensure {email} is correct</li>
                <li>Wait up to 2 minutes for delivery</li>
                <li>Try requesting a new code</li>
              </ul>
              <p className="mt-2">
                <strong>Still having trouble?</strong>{' '}
                <a href="/support" className="text-blue-600 hover:text-blue-500 underline">
                  Contact support
                </a>
              </p>
            </div>
          </motion.div>
        </details>
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>This code expires in 10 minutes for your security</span>
        </div>
      </motion.div>
    </div>
  );
}

export type { OTPVerificationProps };