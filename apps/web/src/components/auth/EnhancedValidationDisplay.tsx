'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle, CheckCircle, AlertTriangle, Lightbulb, Mail } from 'lucide-react';
import { EnhancedValidationResult } from '@/lib/form-validation';

interface ValidationError {
  field: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}

interface EnhancedValidationDisplayProps {
  errors?: ValidationError[];
  validationResult?: EnhancedValidationResult;
  fieldName?: string;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export function EnhancedValidationDisplay({ 
  errors = [], 
  validationResult,
  fieldName,
  onSuggestionClick,
  className = '' 
}: EnhancedValidationDisplayProps) {
  const allErrors = [...errors];
  
  // Add validation result errors
  if (validationResult && !validationResult.isValid) {
    allErrors.push(...validationResult.errors.map(error => ({
      field: fieldName || 'field',
      message: error,
      type: 'error' as const
    })));
  }

  // Add validation result warnings
  if (validationResult?.warnings.length) {
    allErrors.push(...validationResult.warnings.map(warning => ({
      field: fieldName || 'field',
      message: warning,
      type: 'warning' as const
    })));
  }

  if (allErrors.length === 0 && (!validationResult?.suggestions?.length)) {
    return null;
  }

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
        className={`space-y-3 ${className}`}
      >
        {/* Errors and Warnings */}
        {allErrors.length > 0 && (
          <div className="space-y-2">
            {allErrors.map((error, index) => (
              <motion.div
                key={`${error.field}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${getColorClasses(error.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(error.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {error.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {validationResult?.suggestions && validationResult.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-4 bg-info-50 border border-info-200 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-info-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-info-800 mb-2">
                  {fieldName === 'email' ? 'Did you mean?' : 'Suggestions:'}
                </h4>
                <div className="space-y-2">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    >
                      {fieldName === 'email' && onSuggestionClick ? (
                        <button
                          type="button"
                          onClick={() => onSuggestionClick(suggestion)}
                          className="flex items-center space-x-2 text-sm text-info-700 hover:text-info-800 hover:bg-info-100 px-2 py-1 rounded transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="font-medium">{suggestion}</span>
                        </button>
                      ) : (
                        <div className="flex items-start space-x-2 text-sm text-info-700">
                          <span className="text-info-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {allErrors.length === 0 && validationResult?.isValid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2 p-2 bg-success-50 border border-success-200 rounded-lg"
          >
            <CheckCircle className="w-4 h-4 text-success-500" />
            <span className="text-sm text-success-700 font-medium">
              {fieldName ? `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} looks good!` : 'Validation passed'}
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}