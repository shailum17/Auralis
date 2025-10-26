'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authUtils } from '@/lib/auth-utils';

interface SessionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function SessionStatus({ className = '', showDetails = false }: SessionStatusProps) {
  const { tokens, isAuthenticated } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<{
    expiresAt: Date | null;
    timeRemaining: string;
    isExtended: boolean;
  }>({
    expiresAt: null,
    timeRemaining: '',
    isExtended: false,
  });

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) {
      return;
    }

    const updateSessionInfo = () => {
      const expiresAt = authUtils.getTokenExpirationTime(tokens.accessToken);
      const sessionConfig = localStorage.getItem('sessionConfig');
      
      let isExtended = false;
      if (sessionConfig) {
        try {
          const config = JSON.parse(sessionConfig);
          isExtended = config.rememberMe && config.sessionDuration > 24;
        } catch (error) {
          console.error('Error parsing session config:', error);
        }
      }

      if (expiresAt) {
        const now = new Date();
        const timeDiff = expiresAt.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          let timeRemaining = '';
          if (hours > 0) {
            timeRemaining = `${hours}h ${minutes}m`;
          } else {
            timeRemaining = `${minutes}m`;
          }
          
          setSessionInfo({
            expiresAt,
            timeRemaining,
            isExtended,
          });
        } else {
          setSessionInfo({
            expiresAt: null,
            timeRemaining: 'Expired',
            isExtended,
          });
        }
      }
    };

    // Update immediately
    updateSessionInfo();

    // Update every minute
    const interval = setInterval(updateSessionInfo, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, tokens]);

  if (!isAuthenticated || !sessionInfo.expiresAt) {
    return null;
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-1 text-xs text-secondary-600 ${className}`}>
        <Clock size={12} />
        <span>{sessionInfo.timeRemaining}</span>
        {sessionInfo.isExtended && <Shield size={12} className="text-primary-600" />}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-secondary-200 rounded-lg p-3 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-secondary-500" />
          <span className="text-sm font-medium text-secondary-900">Session Status</span>
        </div>
        {sessionInfo.isExtended && (
          <div className="flex items-center space-x-1">
            <Shield size={14} className="text-primary-600" />
            <span className="text-xs text-primary-600">Extended</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Time remaining:</span>
          <span className="font-medium text-secondary-900">{sessionInfo.timeRemaining}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Expires at:</span>
          <span className="font-medium text-secondary-900">
            {sessionInfo.expiresAt.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>

      {sessionInfo.isExtended && (
        <div className="mt-2 p-2 bg-primary-50 border border-primary-200 rounded text-xs text-primary-700">
          <div className="flex items-start space-x-1">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            <span>Extended session active. Your session will be automatically refreshed.</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}