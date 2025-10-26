'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

interface ValidationErrorDisplayProps {
  errors: ValidationError[];
  className?: string;
}

export function ValidationErrorDisplay({ errors, className = '' }: ValidationErrorDisplayProps) {
  if (errors.length === 0) return null;

  const getIcon = (type: string = 'error') => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning-500" />;
      case 'info':
        return <AlertCircle className="w-4 h-4 text-info-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      default:
        return <XCircle className="w-4 h-4 text-error-500" />;
    }
  };

  const getColorClasses = (type: string = 'error') => {
    switch (type) {
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-info-50 border-info-200 text-info-800';
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      default:
        return 'bg-error-50 border-error-200 text-error-800';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg border p-4 ${className}`}
      >
        <div className="space-y-2">
          {errors.map((error, index) => (
            <motion.div
              key={`${error.field}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className={`flex items-start space-x-2 p-2 rounded ${getColorClasses(error.type)}`}
            >
              {getIcon(error.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {error.field && (
                    <span className="capitalize">{error.field}: </span>
                  )}
                  {error.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}