'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Clock, Ban, CheckCircle, XCircle } from 'lucide-react';

interface SecurityStatusDisplayProps {
  securityStatus: {
    level: 'low' | 'medium' | 'high';
    isRateLimited: boolean;
    isBlocked: boolean;
    remainingAttempts: number;
    violations: string[];
    timeUntilReset: string;
  };
  className?: string;
}

export function SecurityStatusDisplay({ securityStatus, className = '' }: SecurityStatusDisplayProps) {
  const {
    level,
    isRateLimited,
    isBlocked,
    remainingAttempts,
    violations,
    timeUntilReset
  } = securityStatus;

  // Don't show anything if everything is normal
  if (level === 'low' && !isRateLimited && violations.length === 0) {
    return null;
  }

  const getSecurityIcon = () => {
    if (isBlocked) return <Ban className="w-5 h-5 text-error-500" />;
    if (isRateLimited) return <Clock className="w-5 h-5 text-warning-500" />;
    if (level === 'high') return <XCircle className="w-5 h-5 text-error-500" />;
    if (level === 'medium') return <AlertTriangle className="w-5 h-5 text-warning-500" />;
    return <Shield className="w-5 h-5 text-success-500" />;
  };

  const getSecurityColor = () => {
    if (isBlocked || level === 'high') return 'error';
    if (isRateLimited || level === 'medium') return 'warning';
    return 'info';
  };

  const getSecurityMessage = () => {
    if (isBlocked) {
      return `Account temporarily blocked. Try again in ${timeUntilReset}.`;
    }
    if (isRateLimited) {
      return `Too many attempts. ${remainingAttempts} attempts remaining. Reset in ${timeUntilReset}.`;
    }
    if (level === 'high') {
      return 'Security violation detected. Please review your input.';
    }
    if (level === 'medium') {
      return 'Input contains potentially unsafe content.';
    }
    return 'Security check passed.';
  };

  const colorClasses = {
    error: 'bg-error-50 border-error-200 text-error-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-info-50 border-info-200 text-info-800',
    success: 'bg-success-50 border-success-200 text-success-800'
  };

  const color = getSecurityColor();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg border p-4 ${colorClasses[color]} ${className}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getSecurityIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">
                {isBlocked ? 'Account Blocked' : 
                 isRateLimited ? 'Rate Limited' :
                 level === 'high' ? 'Security Alert' :
                 level === 'medium' ? 'Security Warning' :
                 'Security Status'}
              </h4>
              
              {(isRateLimited || isBlocked) && timeUntilReset && (
                <div className="flex items-center space-x-1 text-xs font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{timeUntilReset}</span>
                </div>
              )}
            </div>
            
            <p className="text-sm mb-3">
              {getSecurityMessage()}
            </p>

            {/* Rate Limit Progress Bar */}
            {isRateLimited && !isBlocked && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Attempts Remaining</span>
                  <span>{remainingAttempts}</span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      remainingAttempts > 2 ? 'bg-success-500' :
                      remainingAttempts > 0 ? 'bg-warning-500' : 'bg-error-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, (remainingAttempts / 5) * 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Security Violations */}
            {violations.length > 0 && (
              <div className="space-y-1">
                <h5 className="text-xs font-medium uppercase tracking-wide opacity-75">
                  Security Issues:
                </h5>
                <ul className="space-y-1">
                  {violations.map((violation, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="flex items-start space-x-2 text-xs"
                    >
                      <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{violation}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Security Tips */}
            {(isRateLimited || level !== 'low') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-3 pt-3 border-t border-current border-opacity-20"
              >
                <h5 className="text-xs font-medium uppercase tracking-wide opacity-75 mb-2">
                  Security Tips:
                </h5>
                <ul className="space-y-1 text-xs opacity-90">
                  {isBlocked && (
                    <li>• Wait for the block period to expire before trying again</li>
                  )}
                  {isRateLimited && !isBlocked && (
                    <>
                      <li>• Wait between attempts to avoid being blocked</li>
                      <li>• Ensure you're using correct credentials</li>
                    </>
                  )}
                  {level === 'high' && (
                    <>
                      <li>• Remove any special characters or scripts from your input</li>
                      <li>• Use only standard text characters</li>
                    </>
                  )}
                  {level === 'medium' && (
                    <li>• Review your input for unusual characters or patterns</li>
                  )}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}