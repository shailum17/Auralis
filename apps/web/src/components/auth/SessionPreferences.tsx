'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionPreferencesProps {
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
  sessionDuration?: number;
  onSessionDurationChange?: (duration: number) => void;
  showAdvanced?: boolean;
  className?: string;
}

const sessionDurations = [
  { value: 1, label: '1 hour', description: 'Most secure' },
  { value: 8, label: '8 hours', description: 'Work day' },
  { value: 24, label: '1 day', description: 'Recommended' },
  { value: 168, label: '1 week', description: 'Convenient' },
  { value: 720, label: '30 days', description: 'Extended' }
];

export function SessionPreferences({
  rememberMe,
  onRememberMeChange,
  sessionDuration = 24,
  onSessionDurationChange,
  showAdvanced = false,
  className = ''
}: SessionPreferencesProps) {
  const [showDurationOptions, setShowDurationOptions] = useState(false);

  const selectedDuration = sessionDurations.find(d => d.value === sessionDuration) || sessionDurations[2];

  const handleRememberMeToggle = () => {
    const newValue = !rememberMe;
    onRememberMeChange(newValue);
    
    // If turning off remember me, hide duration options
    if (!newValue) {
      setShowDurationOptions(false);
    }
  };

  const handleDurationChange = (duration: number) => {
    onSessionDurationChange?.(duration);
    setShowDurationOptions(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Remember Me Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeToggle}
              className="sr-only"
            />
            <div className={`
              w-11 h-6 rounded-full transition-all duration-200 ease-in-out
              ${rememberMe 
                ? 'bg-blue-600 shadow-lg' 
                : 'bg-gray-300 group-hover:bg-gray-400'
              }
            `}>
              <div className={`
                absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                transition-transform duration-200 ease-in-out
                ${rememberMe ? 'translate-x-5' : 'translate-x-0'}
              `} />
            </div>
          </div>
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700">
              Keep me signed in
            </span>
            <p className="text-xs text-gray-500">
              {rememberMe 
                ? `Stay signed in for ${selectedDuration.label.toLowerCase()}`
                : 'Sign out when browser closes'
              }
            </p>
          </div>
        </label>

        {/* Security Icon */}
        <div className="flex items-center">
          <div className={`
            p-1.5 rounded-full transition-colors duration-200
            ${rememberMe ? 'bg-blue-100' : 'bg-gray-100'}
          `}>
            <svg 
              className={`h-4 w-4 ${rememberMe ? 'text-blue-600' : 'text-gray-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Advanced Session Options */}
      <AnimatePresence>
        {rememberMe && showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDurationOptions(!showDurationOptions)}
                className="flex items-center justify-between w-full p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <span>Session duration: {selectedDuration.label}</span>
                <svg 
                  className={`h-4 w-4 transition-transform ${showDurationOptions ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showDurationOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-1 overflow-hidden"
                  >
                    {sessionDurations.map((duration) => (
                      <button
                        key={duration.value}
                        type="button"
                        onClick={() => handleDurationChange(duration.value)}
                        className={`
                          w-full text-left p-2 rounded-md text-sm transition-colors
                          ${sessionDuration === duration.value
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{duration.label}</span>
                          <span className="text-xs opacity-75">{duration.description}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Notice */}
      {rememberMe && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <svg className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-xs text-amber-700">
            <p className="font-medium">Security reminder</p>
            <p>Only enable this on your personal devices. We'll automatically sign you out if we detect suspicious activity.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export type { SessionPreferencesProps };