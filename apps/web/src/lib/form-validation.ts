import { ValidationRule, ValidationResult } from '@/components/ui/types';
import { authUtils } from './auth-utils';

/**
 * Form validation utilities for authentication forms
 */

export interface FormField {
  name: string;
  value: string;
  rules: ValidationRule[];
}

export interface FormValidationState {
  [fieldName: string]: {
    value: string;
    error?: string;
    isValid: boolean;
    touched: boolean;
  };
}

export interface EnhancedValidationResult extends ValidationResult {
  warnings: string[];
  suggestions?: string[];
}

export interface DomainValidationResult {
  isValid: boolean;
  isTrusted: boolean;
  isDisposable: boolean;
  suggestions?: string[];
}

export interface SecurityValidationOptions {
  enableXSSProtection?: boolean;
  enableSQLInjectionProtection?: boolean;
  enableCSRFProtection?: boolean;
  maxLength?: number;
  allowedCharacters?: RegExp;
}

export class FormValidator {
  // Common disposable email domains to check against
  private static readonly DISPOSABLE_DOMAINS = new Set([
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
    'throwaway.email', 'yopmail.com', 'temp-mail.org', 'getnada.com',
    'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com'
  ]);

  // Trusted email domains that are commonly used
  private static readonly TRUSTED_DOMAINS = new Set([
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'protonmail.com', 'aol.com', 'live.com', 'msn.com', 'mail.com'
  ]);

  /**
   * Enhanced field validation with security features
   */
  static validateField(value: string, rules: ValidationRule[], options?: SecurityValidationOptions): EnhancedValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Apply security sanitization first
    const sanitizedValue = this.sanitizeInput(value, options);
    
    // Check for potential security issues
    const securityCheck = this.validateSecurity(sanitizedValue, options);
    if (!securityCheck.isValid) {
      errors.push(...securityCheck.errors);
    }
    warnings.push(...securityCheck.warnings);

    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!sanitizedValue.trim()) {
            errors.push(rule.message);
          }
          break;

        case 'email':
          const emailValidation = this.validateEmailEnhanced(sanitizedValue);
          if (!emailValidation.isValid) {
            errors.push(...emailValidation.errors);
          }
          warnings.push(...emailValidation.warnings);
          if (emailValidation.suggestions) {
            suggestions.push(...emailValidation.suggestions);
          }
          break;

        case 'minLength':
          if (sanitizedValue && sanitizedValue.length < rule.value) {
            errors.push(rule.message);
          }
          break;

        case 'maxLength':
          if (sanitizedValue && sanitizedValue.length > rule.value) {
            errors.push(rule.message);
          }
          break;

        case 'pattern':
          if (sanitizedValue && !new RegExp(rule.value).test(sanitizedValue)) {
            errors.push(rule.message);
          }
          break;

        case 'custom':
          if (rule.validator && sanitizedValue && !rule.validator(sanitizedValue)) {
            errors.push(rule.message);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Enhanced email validation with domain checking
   */
  static validateEmailEnhanced(email: string): EnhancedValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!email) {
      return { isValid: true, errors, warnings, suggestions };
    }

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Extract domain
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      errors.push('Invalid email domain');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Check for disposable email
    if (this.DISPOSABLE_DOMAINS.has(domain)) {
      errors.push('Disposable email addresses are not allowed');
      suggestions.push('Please use a permanent email address like Gmail, Yahoo, or Outlook');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Check domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      errors.push('Invalid email domain format');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Provide warnings for less common domains
    if (!this.TRUSTED_DOMAINS.has(domain)) {
      warnings.push('Consider using a more common email provider for better deliverability');
    }

    // Check for common typos in popular domains
    const typoSuggestions = this.suggestEmailCorrections(email);
    if (typoSuggestions.length > 0) {
      warnings.push('Did you mean one of these?');
      suggestions.push(...typoSuggestions);
    }

    return { isValid: true, errors, warnings, suggestions };
  }

  /**
   * Enhanced password validation with visual strength indicator
   */
  static validatePasswordEnhanced(password: string): EnhancedValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!password) {
      return { isValid: true, errors, warnings, suggestions };
    }

    const strength = authUtils.validatePassword(password);
    
    // Require at least 'fair' strength (score >= 3)
    if (strength.score < 3) {
      errors.push('Password does not meet security requirements');
    }

    // Add specific suggestions based on unmet requirements
    const unmetRequirements = strength.requirements.filter(req => !req.met);
    if (unmetRequirements.length > 0) {
      suggestions.push(...unmetRequirements.map(req => req.label));
    }

    // Check for common weak patterns
    if (/^(.)\1+$/.test(password)) {
      errors.push('Password cannot be all the same character');
    }

    if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
      warnings.push('Avoid sequential characters for better security');
    }

    // Check for common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123', 'admin', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password contains common words that are easily guessed');
      suggestions.push('Use a unique combination of words, numbers, and symbols');
    }

    // Check for keyboard patterns
    if (/qwerty|asdf|zxcv|1234|abcd/i.test(password)) {
      warnings.push('Avoid keyboard patterns for better security');
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Enhanced username validation with availability checking
   */
  static validateUsernameEnhanced(username: string): EnhancedValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!username) {
      return { isValid: true, errors, warnings, suggestions };
    }

    // Basic format validation
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Length validation
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
      return { isValid: false, errors, warnings, suggestions };
    }

    if (username.length > 30) {
      errors.push('Username must be less than 30 characters long');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Check for reserved words
    const reservedWords = ['admin', 'root', 'user', 'test', 'guest', 'null', 'undefined', 'api', 'www', 'mail', 'support'];
    if (reservedWords.includes(username.toLowerCase())) {
      errors.push('This username is reserved and cannot be used');
      suggestions.push(`Try ${username}123, ${username}_user, or my_${username}`);
      return { isValid: false, errors, warnings, suggestions };
    }

    // Provide warnings for potentially confusing usernames
    if (/^\d+$/.test(username)) {
      warnings.push('Consider adding letters to make your username more memorable');
      suggestions.push(`user${username}`, `${username}user`);
    }

    if (username.length < 5) {
      warnings.push('Shorter usernames might be harder to remember');
    }

    // Check for offensive content (basic check)
    const offensivePatterns = /^(fuck|shit|damn|hell|ass|bitch|crap)/i;
    if (offensivePatterns.test(username)) {
      errors.push('Username contains inappropriate content');
      return { isValid: false, errors, warnings, suggestions };
    }

    return { isValid: true, errors, warnings, suggestions };
  }

  /**
   * Sanitize input to prevent XSS and injection attacks
   */
  static sanitizeInput(value: string, options?: SecurityValidationOptions): string {
    if (!value) return value;

    let sanitized = value;

    if (options?.enableXSSProtection !== false) {
      // Remove potentially dangerous HTML/script content
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      sanitized = sanitized.replace(/<[^>]*>/g, ''); // Remove HTML tags
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/on\w+\s*=/gi, ''); // Remove event handlers
    }

    if (options?.enableSQLInjectionProtection !== false) {
      // Basic SQL injection prevention
      const sqlPatterns = /('|\\')|(;|\\;)|(--)|(\s*(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+)/gi;
      if (sqlPatterns.test(sanitized)) {
        sanitized = sanitized.replace(sqlPatterns, '');
      }
    }

    // Apply character restrictions if specified
    if (options?.allowedCharacters) {
      sanitized = sanitized.replace(new RegExp(`[^${options.allowedCharacters.source}]`, 'g'), '');
    }

    // Apply length restrictions
    if (options?.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized.trim();
  }

  /**
   * Validate input for security issues
   */
  private static validateSecurity(value: string, options?: SecurityValidationOptions): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!value) {
      return { isValid: true, errors, warnings };
    }

    // Check for potential XSS attempts
    if (options?.enableXSSProtection !== false) {
      if (/<script|javascript:|on\w+\s*=/i.test(value)) {
        errors.push('Input contains potentially dangerous content');
      }
    }

    // Check for potential SQL injection
    if (options?.enableSQLInjectionProtection !== false) {
      const sqlPatterns = /('|\\')|(;|\\;)|(--)|(\s*(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+)/gi;
      if (sqlPatterns.test(value)) {
        errors.push('Input contains potentially dangerous SQL patterns');
      }
    }

    // Check for excessive length
    if (value.length > 10000) {
      errors.push('Input is too long');
    }

    // Check for null bytes
    if (value.includes('\0')) {
      errors.push('Input contains invalid characters');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Suggest corrections for common email typos
   */
  private static suggestEmailCorrections(email: string): string[] {
    const suggestions: string[] = [];
    const [localPart, domain] = email.split('@');
    
    if (!domain) return suggestions;

    const commonDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'protonmail.com', 'aol.com'
    ];

    // Check for common typos
    const typoMap: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'outloo.com': 'outlook.com',
    };

    if (typoMap[domain.toLowerCase()]) {
      suggestions.push(`${localPart}@${typoMap[domain.toLowerCase()]}`);
    }

    // Suggest similar domains using Levenshtein distance
    for (const commonDomain of commonDomains) {
      if (this.levenshteinDistance(domain.toLowerCase(), commonDomain) <= 2 && domain !== commonDomain) {
        suggestions.push(`${localPart}@${commonDomain}`);
      }
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Validate multiple fields at once
   */
  static validateForm(fields: FormField[]): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};
    
    for (const field of fields) {
      results[field.name] = this.validateField(field.value, field.rules);
    }
    
    return results;
  }

  /**
   * Check if entire form is valid
   */
  static isFormValid(validationResults: Record<string, ValidationResult>): boolean {
    return Object.values(validationResults).every(result => result.isValid);
  }

  /**
   * Get first error message from validation results
   */
  static getFirstError(validationResults: Record<string, ValidationResult>): string | null {
    for (const result of Object.values(validationResults)) {
      if (!result.isValid && result.errors.length > 0) {
        return result.errors[0];
      }
    }
    return null;
  }
}

/**
 * Pre-configured validation rules for common authentication fields with enhanced security
 */
export const AuthValidationRules = {
  email: (): ValidationRule[] => [
    {
      type: 'required',
      message: 'Email is required',
    },
    {
      type: 'email',
      message: 'Please enter a valid email address',
    },
    {
      type: 'maxLength',
      value: 254,
      message: 'Email address is too long',
    },
    {
      type: 'custom',
      validator: (email: string) => {
        const result = FormValidator.validateEmailEnhanced(email);
        return result.isValid;
      },
      message: 'Please enter a valid email address',
    },
  ],

  username: (): ValidationRule[] => [
    {
      type: 'required',
      message: 'Username is required',
    },
    {
      type: 'minLength',
      value: 3,
      message: 'Username must be at least 3 characters',
    },
    {
      type: 'maxLength',
      value: 30,
      message: 'Username must be less than 30 characters',
    },
    {
      type: 'pattern',
      value: '^[a-zA-Z0-9_-]+$',
      message: 'Username can only contain letters, numbers, underscores, and hyphens',
    },
    {
      type: 'custom',
      validator: (username: string) => {
        const result = FormValidator.validateUsernameEnhanced(username);
        return result.isValid;
      },
      message: 'Username is not available or contains invalid content',
    },
  ],

  password: (): ValidationRule[] => [
    {
      type: 'required',
      message: 'Password is required',
    },
    {
      type: 'minLength',
      value: 8,
      message: 'Password must be at least 8 characters',
    },
    {
      type: 'custom',
      validator: (password: string) => {
        const result = FormValidator.validatePasswordEnhanced(password);
        return result.isValid;
      },
      message: 'Password must meet security requirements',
    },
  ],

  confirmPassword: (originalPassword: string): ValidationRule[] => [
    {
      type: 'required',
      message: 'Please confirm your password',
    },
    {
      type: 'custom',
      validator: (confirmPassword: string) => confirmPassword === originalPassword,
      message: 'Passwords do not match',
    },
  ],

  fullName: (): ValidationRule[] => [
    {
      type: 'required',
      message: 'Full name is required',
    },
    {
      type: 'minLength',
      value: 2,
      message: 'Full name must be at least 2 characters',
    },
    {
      type: 'maxLength',
      value: 100,
      message: 'Full name must be less than 100 characters',
    },
    {
      type: 'pattern',
      value: '^[a-zA-Z\\s\\-\\.\']+$',
      message: 'Full name can only contain letters, spaces, hyphens, periods, and apostrophes',
    },
    {
      type: 'custom',
      validator: (name: string) => {
        // Additional security validation
        const sanitized = FormValidator.sanitizeInput(name, {
          enableXSSProtection: true,
          maxLength: 100,
          allowedCharacters: /[a-zA-Z\s\-\.']/
        });
        return sanitized === name.trim();
      },
      message: 'Full name contains invalid characters',
    },
  ],

  otp: (): ValidationRule[] => [
    {
      type: 'required',
      message: 'Verification code is required',
    },
    {
      type: 'pattern',
      value: '^\\d{6}$',
      message: 'Verification code must be 6 digits',
    },
    {
      type: 'custom',
      validator: (otp: string) => {
        // Ensure OTP is exactly 6 digits and not all the same
        return /^\d{6}$/.test(otp) && !/^(.)\1{5}$/.test(otp);
      },
      message: 'Please enter a valid 6-digit verification code',
    },
  ],

  identifier: (): ValidationRule[] => [
    {
      type: 'required',
      message: 'Email or username is required',
    },
    {
      type: 'minLength',
      value: 3,
      message: 'Must be at least 3 characters',
    },
    {
      type: 'custom',
      validator: (identifier: string) => {
        // Basic security validation for identifier
        const sanitized = FormValidator.sanitizeInput(identifier, {
          enableXSSProtection: true,
          enableSQLInjectionProtection: true,
          maxLength: 254
        });
        return sanitized === identifier.trim();
      },
      message: 'Invalid characters in email or username',
    },
  ],
};

/**
 * Real-time validation hook for forms
 */
export function useFormValidation(initialState: Record<string, string> = {}) {
  const [state, setState] = React.useState<FormValidationState>(() => {
    const validationState: FormValidationState = {};
    
    for (const [fieldName, value] of Object.entries(initialState)) {
      validationState[fieldName] = {
        value,
        isValid: true,
        touched: false,
      };
    }
    
    return validationState;
  });

  const validateField = React.useCallback((fieldName: string, value: string, rules: ValidationRule[]) => {
    const result = FormValidator.validateField(value, rules);
    
    setState(prev => ({
      ...prev,
      [fieldName]: {
        value,
        error: result.errors[0],
        isValid: result.isValid,
        touched: true,
      },
    }));
    
    return result.isValid;
  }, []);

  const updateField = React.useCallback((fieldName: string, value: string, rules?: ValidationRule[]) => {
    setState(prev => {
      const field = prev[fieldName] || { value: '', isValid: true, touched: false };
      
      let updatedField = {
        ...field,
        value,
      };
      
      // Validate if rules are provided and field has been touched
      if (rules && field.touched) {
        const result = FormValidator.validateField(value, rules);
        updatedField = {
          ...updatedField,
          error: result.errors[0],
          isValid: result.isValid,
        };
      }
      
      return {
        ...prev,
        [fieldName]: updatedField,
      };
    });
  }, []);

  const touchField = React.useCallback((fieldName: string) => {
    setState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
      },
    }));
  }, []);

  const resetForm = React.useCallback((newState: Record<string, string> = {}) => {
    const validationState: FormValidationState = {};
    
    for (const [fieldName, value] of Object.entries(newState)) {
      validationState[fieldName] = {
        value,
        isValid: true,
        touched: false,
      };
    }
    
    setState(validationState);
  }, []);

  const isFormValid = React.useMemo(() => {
    return Object.values(state).every(field => field.isValid);
  }, [state]);

  const getFieldProps = React.useCallback((fieldName: string) => {
    const field = state[fieldName] || { value: '', isValid: true, touched: false };
    
    return {
      value: field.value,
      error: field.touched ? field.error : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        updateField(fieldName, e.target.value);
      },
      onBlur: () => {
        touchField(fieldName);
      },
    };
  }, [state, updateField, touchField]);

  return {
    state,
    validateField,
    updateField,
    touchField,
    resetForm,
    isFormValid,
    getFieldProps,
  };
}

// Import React for the hook
import React from 'react';