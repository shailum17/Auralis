'use client';

import React from 'react';

export interface SessionDurationOption {
  value: number;
  label: string;
  description: string;
}

export const SESSION_DURATION_OPTIONS: SessionDurationOption[] = [
  { value: 0, label: 'Session Only', description: 'Expires when browser closes' },
  { value: 1, label: '1 Hour', description: 'Short session' },
  { value: 8, label: '8 Hours', description: 'Work day' },
  { value: 24, label: '24 Hours', description: 'Full day' },
  { value: 168, label: '7 Days', description: 'One week' },
  { value: 720, label: '30 Days', description: 'One month' },
];

interface SessionDurationSelectorProps {
  rememberMe: boolean;
  sessionDuration: number;
  onRememberMeChange: (checked: boolean) => void;
  onSessionDurationChange: (duration: number) => void;
  className?: string;
}

export function SessionDurationSelector({
  rememberMe,
  sessionDuration,
  onRememberMeChange,
  onSessionDurationChange,
  className = '',
}: SessionDurationSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Remember Me Checkbox */}
      <div className="flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => onRememberMeChange(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
          Remember me
        </label>
      </div>

      {/* Session Duration Selector */}
      {rememberMe && (
        <div className="space-y-2">
          <label htmlFor="session-duration" className="block text-sm font-medium text-gray-700">
            Stay logged in for:
          </label>
          <select
            id="session-duration"
            value={sessionDuration}
            onChange={(e) => onSessionDurationChange(Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {SESSION_DURATION_OPTIONS.filter(opt => opt.value > 0).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Your session will automatically expire after this duration
          </p>
        </div>
      )}

      {/* Session Only Notice */}
      {!rememberMe && (
        <p className="text-xs text-gray-500">
          Your session will expire when you close the browser
        </p>
      )}
    </div>
  );
}

// Compact version for smaller forms
interface CompactSessionSelectorProps {
  rememberMe: boolean;
  sessionDuration: number;
  onRememberMeChange: (checked: boolean) => void;
  onSessionDurationChange: (duration: number) => void;
  className?: string;
}

export function CompactSessionSelector({
  rememberMe,
  sessionDuration,
  onRememberMeChange,
  onSessionDurationChange,
  className = '',
}: CompactSessionSelectorProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <input
          id="remember-me-compact"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => onRememberMeChange(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="remember-me-compact" className="ml-2 block text-sm text-gray-900">
          Remember me
        </label>
      </div>

      {rememberMe && (
        <select
          value={sessionDuration}
          onChange={(e) => onSessionDurationChange(Number(e.target.value))}
          className="text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
        >
          {SESSION_DURATION_OPTIONS.filter(opt => opt.value > 0).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// Hook for managing session preferences
export function useSessionPreferences(defaultDuration: number = 24) {
  const [rememberMe, setRememberMe] = React.useState(false);
  const [sessionDuration, setSessionDuration] = React.useState(defaultDuration);

  const handleRememberMeChange = React.useCallback((checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      setSessionDuration(0); // Reset to session only
    } else if (sessionDuration === 0) {
      setSessionDuration(defaultDuration); // Set to default if was 0
    }
  }, [sessionDuration, defaultDuration]);

  const handleSessionDurationChange = React.useCallback((duration: number) => {
    setSessionDuration(duration);
    if (duration > 0 && !rememberMe) {
      setRememberMe(true); // Auto-enable remember me if duration is set
    }
  }, [rememberMe]);

  return {
    rememberMe,
    sessionDuration,
    handleRememberMeChange,
    handleSessionDurationChange,
  };
}
