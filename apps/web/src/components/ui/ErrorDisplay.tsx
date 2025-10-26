'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Card } from './Card';

export type ErrorType = 'network' | 'validation' | 'server' | 'authentication' | 'permission' | 'generic';

export interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
  details?: string;
  code?: string;
  suggestions?: string[];
  retryable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

interface ErrorDisplayProps {
  error: ErrorInfo;
  className?: string;
  compact?: boolean;
  showDetails?: boolean;
}

const errorConfig = {
  network: {
    icon: AlertTriangle,
    colorClasses: 'bg-warning-50 border-warning-200 text-warning-800',
    iconColor: 'text-warning-600',
    defaultTitle: 'Connection Error',
    defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
  },
  validation: {
    icon: AlertCircle,
    colorClasses: 'bg-error-50 border-error-200 text-error-800',
    iconColor: 'text-error-600',
    defaultTitle: 'Validation Error',
    defaultMessage: 'Please check your input and try again.',
  },
  server: {
    icon: XCircle,
    colorClasses: 'bg-error-50 border-error-200 text-error-800',
    iconColor: 'text-error-600',
    defaultTitle: 'Server Error',
    defaultMessage: 'Something went wrong on our end. Please try again later.',
  },
  authentication: {
    icon: XCircle,
    colorClasses: 'bg-error-50 border-error-200 text-error-800',
    iconColor: 'text-error-600',
    defaultTitle: 'Authentication Error',
    defaultMessage: 'Please sign in again to continue.',
  },
  permission: {
    icon: XCircle,
    colorClasses: 'bg-warning-50 border-warning-200 text-warning-800',
    iconColor: 'text-warning-600',
    defaultTitle: 'Permission Denied',
    defaultMessage: 'You do not have permission to perform this action.',
  },
  generic: {
    icon: AlertTriangle,
    colorClasses: 'bg-error-50 border-error-200 text-error-800',
    iconColor: 'text-error-600',
    defaultTitle: 'Error',
    defaultMessage: 'An unexpected error occurred.',
  },
};

export function ErrorDisplay({ error, className, compact = false, showDetails = false }: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = errorConfig[error.type];
  const Icon = config.icon;

  const hasExpandableContent = error.details || error.suggestions?.length || error.code;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex items-center space-x-2 p-3 rounded-lg border',
          config.colorClasses,
          className
        )}
      >
        <Icon className={cn('w-4 h-4 flex-shrink-0', config.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{error.title}</p>
          <p className="text-xs opacity-90 truncate">{error.message}</p>
        </div>
        {error.onDismiss && (
          <button
            onClick={error.onDismiss}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Card className={cn('border', config.colorClasses.includes('warning') ? 'border-warning-200' : 'border-error-200')}>
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-shrink-0"
              >
                <Icon className={cn('w-5 h-5', config.iconColor)} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-sm font-semibold"
                >
                  {error.title}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-sm mt-1 opacity-90"
                >
                  {error.message}
                </motion.p>

                {error.code && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="text-xs mt-2 font-mono opacity-70"
                  >
                    Error Code: {error.code}
                  </motion.p>
                )}

                {/* Expandable Details */}
                {hasExpandableContent && (showDetails || isExpanded) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-3"
                  >
                    {error.details && (
                      <div className="p-3 bg-black/5 rounded-md">
                        <h4 className="text-xs font-medium mb-1">Details:</h4>
                        <p className="text-xs opacity-80">{error.details}</p>
                      </div>
                    )}

                    {error.suggestions && error.suggestions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium mb-2">Suggestions:</h4>
                        <ul className="space-y-1">
                          {error.suggestions.map((suggestion, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.1 }}
                              className="text-xs opacity-80 flex items-start space-x-2"
                            >
                              <span className="text-xs">•</span>
                              <span>{suggestion}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="flex items-center justify-between mt-4"
                >
                  <div className="flex space-x-2">
                    {error.retryable && error.onRetry && (
                      <Button
                        onClick={error.onRetry}
                        variant="outline"
                        size="sm"
                        icon={<RefreshCw className="w-3 h-3" />}
                      >
                        Try Again
                      </Button>
                    )}

                    {hasExpandableContent && !showDetails && (
                      <Button
                        onClick={() => setIsExpanded(!isExpanded)}
                        variant="ghost"
                        size="sm"
                        icon={isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      >
                        {isExpanded ? 'Less' : 'More'} Details
                      </Button>
                    )}
                  </div>

                  {error.onDismiss && (
                    <Button
                      onClick={error.onDismiss}
                      variant="ghost"
                      size="sm"
                    >
                      Dismiss
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper function to create error objects
export function createError(
  type: ErrorType,
  title?: string,
  message?: string,
  options?: Partial<ErrorInfo>
): ErrorInfo {
  const config = errorConfig[type];
  
  return {
    type,
    title: title || config.defaultTitle,
    message: message || config.defaultMessage,
    ...options,
  };
}