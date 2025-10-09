'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { ValidationRule } from '@/components/ui/types';
import { motion, AnimatePresence } from 'framer-motion';
import { detectIdentifierType } from '@/lib/auth-api';

interface UsernameEmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

type InputType = 'email' | 'username' | 'unknown';

const detectInputType = (value: string): InputType => {
  if (!value.trim()) return 'unknown';
  
  const identifierType = detectIdentifierType(value);
  if (identifierType === 'email') return 'email';
  if (identifierType === 'username') return 'username';
  
  // Check if it looks like an email being typed (contains @ but not complete)
  if (value.includes('@')) {
    return 'email';
  }
  
  return 'unknown';
};

const getValidationRules = (inputType: InputType): ValidationRule[] => {
  switch (inputType) {
    case 'email':
      return [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email address' }
      ];
    case 'username':
      return [
        { type: 'required', message: 'Username is required' },
        { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
        { type: 'pattern', value: '^[a-zA-Z0-9_-]+$', message: 'Username can only contain letters, numbers, hyphens, and underscores' }
      ];
    default:
      return [
        { type: 'required', message: 'Email or username is required' }
      ];
  }
};

const getPlaceholder = (inputType: InputType): string => {
  switch (inputType) {
    case 'email':
      return 'Enter your email address';
    case 'username':
      return 'Enter your username';
    default:
      return 'Enter your email or username';
  }
};

const getIcon = (inputType: InputType) => {
  switch (inputType) {
    case 'email':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      );
    case 'username':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      );
  }
};

const getHelperText = (inputType: InputType): string => {
  switch (inputType) {
    case 'email':
      return 'We\'ll send verification codes to this email';
    case 'username':
      return 'Your unique username in the community';
    default:
      return 'You can use either your email address or username';
  }
};

export function UsernameEmailInput({
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = ''
}: UsernameEmailInputProps) {
  const [inputType, setInputType] = useState<InputType>('unknown');
  const [showTypeIndicator, setShowTypeIndicator] = useState(false);

  // Update input type when value changes
  useEffect(() => {
    const newType = detectInputType(value);
    setInputType(newType);
    setShowTypeIndicator(value.length > 0 && newType !== 'unknown');
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const validationRules = getValidationRules(inputType);
  const placeholder = getPlaceholder(inputType);
  const icon = getIcon(inputType);
  const helperText = getHelperText(inputType);

  return (
    <div className={`space-y-2 ${className}`}>
      <Input
        type={inputType === 'email' ? 'email' : 'text'}
        label="Email or Username"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        validation={validationRules}
        showValidation={!!value}
        error={error}
        disabled={disabled}
        required={required}
        autoComplete={inputType === 'email' ? 'email' : 'username'}
        helperText={helperText}
        icon={icon}
      />

      {/* Type Indicator */}
      <AnimatePresence>
        {showTypeIndicator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <div className={`
                w-2 h-2 rounded-full
                ${inputType === 'email' ? 'bg-green-500' : inputType === 'username' ? 'bg-blue-500' : 'bg-gray-400'}
              `} />
              <span className="text-sm text-gray-700">
                {inputType === 'email' && 'Detected as email address'}
                {inputType === 'username' && 'Detected as username'}
                {inputType === 'unknown' && 'Enter email or username'}
              </span>
            </div>
            
            {/* Quick Switch Hint */}
            {inputType !== 'unknown' && (
              <div className="text-xs text-gray-500 ml-auto">
                {inputType === 'email' ? 'Or use your username' : 'Or use your email'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Type Examples */}
      {!value && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500 space-y-1"
        >
          <p><strong>Examples:</strong></p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">john@example.com</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">john_doe</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">student123</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export { detectInputType };
export type { InputType };