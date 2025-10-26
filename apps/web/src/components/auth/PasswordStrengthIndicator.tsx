'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { PasswordStrength } from '@/types/auth';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  password: string;
}

export function PasswordStrengthIndicator({ strength, password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

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

  const formatLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {/* Strength Level and Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-600 font-medium">Password Strength</span>
          <span className={`font-semibold ${getPasswordStrengthTextColor(strength.level)}`}>
            {formatLevel(strength.level)}
          </span>
        </div>
        
        <div className="w-full bg-secondary-200 rounded-full h-2 overflow-hidden">
          <motion.div 
            className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor(strength.level)}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength.score / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-secondary-700">Requirements:</h4>
        <div className="space-y-1">
          {strength.requirements.map((req, index) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="flex items-center text-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 + 0.1 }}
              >
                {req.met ? (
                  <CheckCircle className="w-4 h-4 text-success-500 mr-2 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-secondary-400 mr-2 flex-shrink-0" />
                )}
              </motion.div>
              <span className={`transition-colors duration-200 ${
                req.met ? 'text-success-600 font-medium' : 'text-secondary-500'
              }`}>
                {req.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feedback Messages */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((feedback, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={`text-xs ${getPasswordStrengthTextColor(strength.level)}`}
            >
              {feedback}
            </motion.p>
          ))}
        </div>
      )}
    </motion.div>
  );
}