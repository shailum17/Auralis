import { ValidationRule, ValidationResult } from '@/components/ui/types';
import { authUtils } from './auth-utils';

export interface ValidationError {
  field: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export interface EnhancedValidationResult extends ValidationResult {
  warnings: string[];
  fieldErrors: Record<string, string>;
}

export interface DuplicateCheckResult {
  isAvailable: boolean;
  message?: string;
  suggestions?: string[];
}

/**
 * Enhanced validation service for authentication forms
 */
export class AuthValidationService {
  private static instance: AuthValidationService;
  private duplicateCheckCache = new Map<string, { result: DuplicateCheckResult; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): AuthValidationService {
    if (!AuthValidationService.instance) {
      AuthValidationService.instance = new AuthValidationService();
    }
    return AuthValidationService.instance;
  }

  /**
   * Validate email format and availability
   */
  async validateEmail(email: string): Promise<EnhancedValidationResult> {
    const basicRules: ValidationRule[] = [
      {
        type: 'required',
        message: 'Email address is required'
      },
      {
        type: 'email',
        message: 'Please enter a valid email address'
      },
      {
        type: 'maxLength',
        value: 254,
        message: 'Email address is too long'
      }
    ];

    const basicResult = this.validateField(email, basicRules);
    
    if (!basicResult.isValid) {
      return {
        ...basicResult,
        warnings: [],
        fieldErrors: { email: basicResult.errors[0] }
      };
    }

    // Check for duplicate email
    try {
      const duplicateCheck = await this.checkEmailAvailability(email);
      
      if (!duplicateCheck.isAvailable) {
        return {
          isValid: false,
          errors: [duplicateCheck.message || 'Email address is already registered'],
          warnings: [],
          fieldErrors: { email: duplicateCheck.message || 'Email address is already registered' }
        };
      }

      return {
        isValid: true,
        errors: [],
        warnings: [],
        fieldErrors: {}
      };
    } catch (error) {
      console.error('Email validation error:', error);
      return {
        isValid: true,
        errors: [],
        warnings: ['Unable to verify email availability'],
        fieldErrors: {}
      };
    }
  }

  /**
   * Validate username format and availability
   */
  async validateUsername(username: string): Promise<EnhancedValidationResult> {
    const basicRules: ValidationRule[] = [
      {
        type: 'required',
        message: 'Username is required'
      },
      {
        type: 'minLength',
        value: 3,
        message: 'Username must be at least 3 characters long'
      },
      {
        type: 'maxLength',
        value: 30,
        message: 'Username must be less than 30 characters long'
      },
      {
        type: 'pattern',
        value: '^[a-zA-Z0-9_-]+$',
        message: 'Username can only contain letters, numbers, underscores, and hyphens'
      }
    ];

    const basicResult = this.validateField(username, basicRules);
    
    if (!basicResult.isValid) {
      return {
        ...basicResult,
        warnings: [],
        fieldErrors: { username: basicResult.errors[0] }
      };
    }

    // Additional username checks
    const warnings: string[] = [];
    
    // Check for common patterns that might be confusing
    if (/^\d+$/.test(username)) {
      warnings.push('Consider adding letters to make your username more memorable');
    }
    
    if (username.length < 5) {
      warnings.push('Shorter usernames might be harder to remember');
    }

    // Check for duplicate username
    try {
      const duplicateCheck = await this.checkUsernameAvailability(username);
      
      if (!duplicateCheck.isAvailable) {
        return {
          isValid: false,
          errors: [duplicateCheck.message || 'Username is already taken'],
          warnings,
          fieldErrors: { 
            username: duplicateCheck.message || 'Username is already taken',
            suggestions: duplicateCheck.suggestions?.join(', ') || ''
          }
        };
      }

      return {
        isValid: true,
        errors: [],
        warnings,
        fieldErrors: {}
      };
    } catch (error) {
      console.error('Username validation error:', error);
      return {
        isValid: true,
        errors: [],
        warnings: [...warnings, 'Unable to verify username availability'],
        fieldErrors: {}
      };
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): EnhancedValidationResult {
    const basicRules: ValidationRule[] = [
      {
        type: 'required',
        message: 'Password is required'
      },
      {
        type: 'minLength',
        value: 8,
        message: 'Password must be at least 8 characters long'
      }
    ];

    const basicResult = this.validateField(password, basicRules);
    
    if (!basicResult.isValid) {
      return {
        ...basicResult,
        warnings: [],
        fieldErrors: { password: basicResult.errors[0] }
      };
    }

    const strength = authUtils.validatePassword(password);
    const warnings: string[] = [];
    const errors: string[] = [];

    // Require at least 'fair' strength
    if (strength.score < 3) {
      errors.push('Password does not meet security requirements');
    }

    // Add specific warnings based on missing requirements
    const unmetRequirements = strength.requirements.filter(req => !req.met);
    if (unmetRequirements.length > 0) {
      warnings.push(`Missing: ${unmetRequirements.map(req => req.label.toLowerCase()).join(', ')}`);
    }

    // Check for common weak patterns
    if (/^(.)\1+$/.test(password)) {
      errors.push('Password cannot be all the same character');
    }

    if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
      warnings.push('Avoid sequential characters for better security');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldErrors: errors.length > 0 ? { password: errors[0] } : {}
    };
  }

  /**
   * Validate password confirmation
   */
  validatePasswordConfirmation(password: string, confirmPassword: string): EnhancedValidationResult {
    const errors: string[] = [];

    if (!confirmPassword) {
      errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      fieldErrors: errors.length > 0 ? { confirmPassword: errors[0] } : {}
    };
  }

  /**
   * Validate full name
   */
  validateFullName(fullName: string): EnhancedValidationResult {
    const basicRules: ValidationRule[] = [
      {
        type: 'required',
        message: 'Full name is required'
      },
      {
        type: 'minLength',
        value: 2,
        message: 'Full name must be at least 2 characters long'
      },
      {
        type: 'maxLength',
        value: 100,
        message: 'Full name must be less than 100 characters long'
      },
      {
        type: 'pattern',
        value: '^[a-zA-Z\\s\\-\\.\']+$',
        message: 'Full name can only contain letters, spaces, hyphens, periods, and apostrophes'
      }
    ];

    const basicResult = this.validateField(fullName, basicRules);
    const warnings: string[] = [];

    // Check for potential issues
    if (fullName && fullName.trim().split(' ').length < 2) {
      warnings.push('Consider including both first and last name');
    }

    if (fullName && /^\s|\s$/.test(fullName)) {
      warnings.push('Remove leading or trailing spaces');
    }

    return {
      ...basicResult,
      warnings,
      fieldErrors: basicResult.isValid ? {} : { fullName: basicResult.errors[0] }
    };
  }

  /**
   * Check email availability with caching
   */
  private async checkEmailAvailability(email: string): Promise<DuplicateCheckResult> {
    const cacheKey = `email:${email.toLowerCase()}`;
    const cached = this.duplicateCheckCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    try {
      const response = await fetch('/api/auth/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'email', value: email }),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const result = await response.json();
      
      this.duplicateCheckCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      // Return available if we can't check (fail open)
      return { isAvailable: true };
    }
  }

  /**
   * Check username availability with caching and suggestions
   */
  private async checkUsernameAvailability(username: string): Promise<DuplicateCheckResult> {
    const cacheKey = `username:${username.toLowerCase()}`;
    const cached = this.duplicateCheckCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    try {
      const response = await fetch('/api/auth/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'username', value: username }),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const result = await response.json();
      
      this.duplicateCheckCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      // Return available if we can't check (fail open)
      return { isAvailable: true };
    }
  }

  /**
   * Basic field validation using rules
   */
  private validateField(value: string, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!value || !value.trim()) {
            errors.push(rule.message);
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            errors.push(rule.message);
          }
          break;

        case 'minLength':
          if (value && value.length < rule.value) {
            errors.push(rule.message);
          }
          break;

        case 'maxLength':
          if (value && value.length > rule.value) {
            errors.push(rule.message);
          }
          break;

        case 'pattern':
          if (value && !new RegExp(rule.value).test(value)) {
            errors.push(rule.message);
          }
          break;

        case 'custom':
          if (rule.validator && value && !rule.validator(value)) {
            errors.push(rule.message);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.duplicateCheckCache.clear();
  }

  /**
   * Generate username suggestions based on full name
   */
  generateUsernameSuggestions(fullName: string, existingUsername?: string): string[] {
    if (!fullName) return [];

    const nameParts = fullName.toLowerCase().replace(/[^a-z\s]/g, '').split(' ').filter(Boolean);
    const suggestions: string[] = [];

    if (nameParts.length >= 2) {
      const [first, last] = nameParts;
      
      // Various combinations
      suggestions.push(
        `${first}${last}`,
        `${first}_${last}`,
        `${first}.${last}`,
        `${first}${last.charAt(0)}`,
        `${first.charAt(0)}${last}`,
        `${first}${last}${Math.floor(Math.random() * 100)}`,
        `${first}_${last}_${Math.floor(Math.random() * 100)}`
      );
    } else if (nameParts.length === 1) {
      const name = nameParts[0];
      suggestions.push(
        `${name}${Math.floor(Math.random() * 1000)}`,
        `${name}_${Math.floor(Math.random() * 100)}`,
        `the_${name}`,
        `${name}_user`
      );
    }

    // Filter out the existing username and ensure uniqueness
    return Array.from(new Set(suggestions))
      .filter(suggestion => suggestion !== existingUsername)
      .slice(0, 5);
  }
}

export const authValidationService = AuthValidationService.getInstance();