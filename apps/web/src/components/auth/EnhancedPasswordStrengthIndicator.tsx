'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';
import { PasswordStrength } from '@/types/auth';
import { FormValidator } from '@/lib/form-validation';

interface EnhancedPasswordStrengthIndicatorProps {
  password: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  className?: string;
}

export function EnhancedPasswordStrengthIndicator({ 
  password, 
  showPassword = false,
  onTogglePassword,
  className = '' 
}: EnhancedPasswordStrengthIndicatorProps) {
  if (!password) return null;

  const validation = FormValidator.validatePasswordEnhanced(password);
  const strength = password ? require('@/lib/auth-utils').authUtils.validatePassword(password) : null;

  const getPasswordStrengthColor = (level: string) => {
    switch (level) {
      case 'very-weak': return 'bg-red-500';
      case 'weak': return 'bg-orange-500';
      case 'fair': return 'bg-yellow-500';
      case 'good': return 'bg-blue-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthTextColor = (level: string) => {
    switch (level) {
      case 'very-weak': return 'text-red-600';
      case 'weak': return 'text-orange-600';
      case 'fair': return 'text-yellow-600';
      case 'good': return 'text-blue-600';
      case 'strong': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPasswordStrengthBgColor = (level: string) => {
    switch (level) {
      case 'very-weak': return 'bg-red-50 border-red-200';
      case 'weak': return 'bg-orange-50 border-orange-200';
      case 'fair': return 'bg-yellow-50 border-yellow-200';
      case 'good': return 'bg-blue-50 border-blue-200';
      case 'strong': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ');
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'very-weak':
      case 'weak':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'fair':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'good':
      case 'strong':
        return <Shield className="w-4 h-4 text-green-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!strength) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 ${className}`}
    >
      {/* Main Strength Indicator */}
      <div className={`p-4 rounded-lg border ${getPasswordStrengthBgColor(strength.level)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getSecurityIcon(strength.level)}
            <span className="text-sm font-medium text-secondary-700">Password Strength</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-semibold ${getPasswordStrengthTextColor(strength.level)}`}>
              {formatLevel(strength.level)}
            </span>
            {onTogglePassword && (
              <button
                type="button"
                onClick={onTogglePassword}
                className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary-200 rounded-full h-2 overflow-hidden mb-3">
          <motion.div 
            className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor(strength.level)}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength.score / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Score Display */}
        <div className="flex justify-between text-xs text-secondary-600">
          <span>Score: {strength.score}/4</span>
          <span>{Math.round((strength.score / 4) * 100)}% secure</span>
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-secondary-700 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-secondary-500" />
          Security Requirements
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {strength.requirements.map((req: any, index: number) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className={`flex items-center text-sm p-2 rounded-md transition-all duration-200 ${
                req.met 
                  ? 'bg-success-50 border border-success-200' 
                  : 'bg-secondary-50 border border-secondary-200'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 + 0.1 }}
                className="mr-3"
              >
                {req.met ? (
                  <CheckCircle className="w-4 h-4 text-success-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-secondary-400" />
                )}
              </motion.div>
              <span className={`transition-colors duration-200 ${
                req.met ? 'text-success-700 font-medium' : 'text-secondary-600'
              }`}>
                {req.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Validation Errors and Warnings */}
      <AnimatePresence>
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {/* Errors */}
            {validation.errors.map((error, index) => (
              <motion.div
                key={`error-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="flex items-start space-x-2 p-2 bg-error-50 border border-error-200 rounded-md"
              >
                <XCircle className="w-4 h-4 text-error-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-error-700">{error}</span>
              </motion.div>
            ))}

            {/* Warnings */}
            {validation.warnings.map((warning, index) => (
              <motion.div
                key={`warning-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: (validation.errors.length + index) * 0.1 }}
                className="flex items-start space-x-2 p-2 bg-warning-50 border border-warning-200 rounded-md"
              >
                <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-warning-700">{warning}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      <AnimatePresence>
        {validation.suggestions && validation.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3 bg-info-50 border border-info-200 rounded-md"
          >
            <h5 className="text-sm font-medium text-info-700 mb-2">Suggestions:</h5>
            <ul className="space-y-1">
              {validation.suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="text-sm text-info-600 flex items-start"
                >
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Messages */}
      {strength.feedback.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center"
        >
          <p className={`text-sm ${getPasswordStrengthTextColor(strength.level)}`}>
            {strength.feedback[0]}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}