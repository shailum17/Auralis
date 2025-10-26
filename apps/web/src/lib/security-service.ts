/**
 * Security Service for client-side rate limiting, CSRF protection, and input sanitization
 */

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: Date;
  isBlocked: boolean;
}

export interface CSRFTokenData {
  token: string;
  timestamp: number;
  expiresAt: number;
}

export interface SecurityValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  violations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export class SecurityService {
  private static instance: SecurityService;
  private rateLimitStore = new Map<string, Array<{ timestamp: number; blocked?: boolean }>>();
  private csrfTokens = new Map<string, CSRFTokenData>();
  private readonly CSRF_TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes

  // Default rate limit configurations
  private readonly DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 }, // 5 attempts per 15 min, block for 30 min
    register: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }, // 3 attempts per hour, block for 1 hour
    emailVerification: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 attempts per hour
    passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 2 * 60 * 60 * 1000 }, // 3 attempts per hour, block for 2 hours
    otpRequest: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 OTP requests per hour
    formSubmission: { maxAttempts: 20, windowMs: 60 * 1000 }, // 20 form submissions per minute
  };

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Check rate limit for a specific action
   */
  checkRateLimit(key: string, action: string = 'default', customConfig?: RateLimitConfig): RateLimitResult {
    const config = customConfig || this.DEFAULT_RATE_LIMITS[action] || this.DEFAULT_RATE_LIMITS.formSubmission;
    const fullKey = `${action}:${key}`;
    const now = Date.now();
    
    // Get or create attempts array
    let attempts = this.rateLimitStore.get(fullKey) || [];
    
    // Remove old attempts outside the window
    attempts = attempts.filter(attempt => {
      // If blocked, check if block duration has passed
      if (attempt.blocked && config.blockDurationMs) {
        return now - attempt.timestamp < config.blockDurationMs;
      }
      return now - attempt.timestamp < config.windowMs;
    });

    // Check if currently blocked
    const isBlocked = attempts.some(attempt => attempt.blocked);
    if (isBlocked) {
      const blockAttempt = attempts.find(attempt => attempt.blocked);
      const resetTime = new Date(blockAttempt!.timestamp + (config.blockDurationMs || config.windowMs));
      
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
        isBlocked: true,
      };
    }

    // Count valid attempts (non-blocked)
    const validAttempts = attempts.filter(attempt => !attempt.blocked);
    const remainingAttempts = Math.max(0, config.maxAttempts - validAttempts.length);
    
    if (validAttempts.length >= config.maxAttempts) {
      // Add blocked entry if block duration is specified
      if (config.blockDurationMs) {
        attempts.push({ timestamp: now, blocked: true });
      }
      
      this.rateLimitStore.set(fullKey, attempts);
      
      const resetTime = new Date(now + (config.blockDurationMs || config.windowMs));
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
        isBlocked: !!config.blockDurationMs,
      };
    }

    // Add current attempt
    attempts.push({ timestamp: now });
    this.rateLimitStore.set(fullKey, attempts);
    
    const resetTime = new Date(now + config.windowMs);
    return {
      allowed: true,
      remainingAttempts: remainingAttempts - 1,
      resetTime,
      isBlocked: false,
    };
  }

  /**
   * Get remaining attempts for a rate limit key
   */
  getRemainingAttempts(key: string, action: string = 'default'): number {
    const result = this.checkRateLimit(key, action);
    return result.remainingAttempts;
  }

  /**
   * Reset rate limit for a specific key (useful after successful authentication)
   */
  resetRateLimit(key: string, action: string = 'default'): void {
    const fullKey = `${action}:${key}`;
    this.rateLimitStore.delete(fullKey);
  }

  /**
   * Generate CSRF token for form protection
   */
  generateCSRFToken(formId: string): string {
    const token = this.generateSecureToken();
    const now = Date.now();
    
    this.csrfTokens.set(formId, {
      token,
      timestamp: now,
      expiresAt: now + this.CSRF_TOKEN_LIFETIME,
    });

    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(formId: string, token: string): boolean {
    const tokenData = this.csrfTokens.get(formId);
    
    if (!tokenData) {
      return false;
    }

    const now = Date.now();
    
    // Check if token has expired
    if (now > tokenData.expiresAt) {
      this.csrfTokens.delete(formId);
      return false;
    }

    // Validate token
    const isValid = tokenData.token === token;
    
    // Remove token after validation (single use)
    if (isValid) {
      this.csrfTokens.delete(formId);
    }

    return isValid;
  }

  /**
   * Comprehensive input sanitization and validation
   */
  validateAndSanitizeInput(
    input: string, 
    options: {
      maxLength?: number;
      allowHTML?: boolean;
      allowScripts?: boolean;
      allowSQLPatterns?: boolean;
      fieldType?: 'email' | 'username' | 'password' | 'text' | 'url';
    } = {}
  ): SecurityValidationResult {
    const violations: string[] = [];
    let sanitizedValue = input;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Length validation
    if (options.maxLength && input.length > options.maxLength) {
      violations.push(`Input exceeds maximum length of ${options.maxLength} characters`);
      sanitizedValue = sanitizedValue.substring(0, options.maxLength);
      riskLevel = 'medium';
    }

    // XSS Protection
    if (!options.allowScripts) {
      const scriptPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /vbscript:/gi,
      ];

      for (const pattern of scriptPatterns) {
        if (pattern.test(sanitizedValue)) {
          violations.push('Potentially malicious script content detected');
          sanitizedValue = sanitizedValue.replace(pattern, '');
          riskLevel = 'high';
        }
      }
    }

    // HTML Tag Protection
    if (!options.allowHTML) {
      const htmlPattern = /<[^>]*>/g;
      if (htmlPattern.test(sanitizedValue)) {
        violations.push('HTML tags are not allowed');
        sanitizedValue = sanitizedValue.replace(htmlPattern, '');
        riskLevel = 'medium';
      }
    }

    // SQL Injection Protection
    if (!options.allowSQLPatterns) {
      const sqlPatterns = [
        /('|\\')|(;|\\;)|(--)|(\s*(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+)/gi,
        /(\s*(or|and)\s+\w+\s*=\s*\w+)/gi,
        /(\/\*|\*\/)/g,
      ];

      for (const pattern of sqlPatterns) {
        if (pattern.test(sanitizedValue)) {
          violations.push('Potentially malicious SQL patterns detected');
          sanitizedValue = sanitizedValue.replace(pattern, '');
          riskLevel = 'high';
        }
      }
    }

    // Field-specific validation
    if (options.fieldType) {
      const fieldValidation = this.validateFieldType(sanitizedValue, options.fieldType);
      violations.push(...fieldValidation.violations);
      sanitizedValue = fieldValidation.sanitizedValue;
      if (fieldValidation.riskLevel === 'high') riskLevel = 'high';
      else if (fieldValidation.riskLevel === 'medium' && riskLevel === 'low') riskLevel = 'medium';
    }

    // Null byte protection
    if (sanitizedValue.includes('\0')) {
      violations.push('Null bytes are not allowed');
      sanitizedValue = sanitizedValue.replace(/\0/g, '');
      riskLevel = 'high';
    }

    // Control character protection
    const controlCharPattern = /[\x00-\x1F\x7F]/g;
    if (controlCharPattern.test(sanitizedValue)) {
      violations.push('Control characters are not allowed');
      sanitizedValue = sanitizedValue.replace(controlCharPattern, '');
      riskLevel = 'medium';
    }

    return {
      isValid: violations.length === 0,
      sanitizedValue: sanitizedValue.trim(),
      violations,
      riskLevel,
    };
  }

  /**
   * Field-specific validation
   */
  private validateFieldType(value: string, fieldType: string): SecurityValidationResult {
    const violations: string[] = [];
    let sanitizedValue = value;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    switch (fieldType) {
      case 'email':
        // Allow only valid email characters
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (value && !emailPattern.test(value)) {
          const allowedChars = /[^a-zA-Z0-9._%+-@]/g;
          if (allowedChars.test(value)) {
            violations.push('Email contains invalid characters');
            sanitizedValue = value.replace(allowedChars, '');
            riskLevel = 'medium';
          }
        }
        break;

      case 'username':
        // Allow only alphanumeric, underscore, and hyphen
        const usernamePattern = /^[a-zA-Z0-9_-]+$/;
        if (value && !usernamePattern.test(value)) {
          violations.push('Username contains invalid characters');
          sanitizedValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
          riskLevel = 'medium';
        }
        break;

      case 'password':
        // Check for common password attacks
        if (value.length > 128) {
          violations.push('Password is too long');
          sanitizedValue = value.substring(0, 128);
          riskLevel = 'medium';
        }
        break;

      case 'url':
        // Basic URL validation
        try {
          const url = new URL(value);
          if (!['http:', 'https:'].includes(url.protocol)) {
            violations.push('Only HTTP and HTTPS URLs are allowed');
            riskLevel = 'high';
          }
        } catch {
          violations.push('Invalid URL format');
          riskLevel = 'medium';
        }
        break;

      case 'text':
      default:
        // General text validation - already handled above
        break;
    }

    return { isValid: violations.length === 0, sanitizedValue, violations, riskLevel };
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto API
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get security headers for API requests
   */
  getSecurityHeaders(formId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (formId) {
      const csrfToken = this.generateCSRFToken(formId);
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }

  /**
   * Clean up expired tokens and rate limit entries
   */
  cleanup(): void {
    const now = Date.now();

    // Clean up expired CSRF tokens
    for (const [formId, tokenData] of Array.from(this.csrfTokens.entries())) {
      if (now > tokenData.expiresAt) {
        this.csrfTokens.delete(formId);
      }
    }

    // Clean up old rate limit entries
    for (const [key, attempts] of Array.from(this.rateLimitStore.entries())) {
      const config = this.DEFAULT_RATE_LIMITS.formSubmission; // Use default config for cleanup
      const validAttempts = attempts.filter((attempt: { timestamp: number; blocked?: boolean }) => 
        now - attempt.timestamp < (config.blockDurationMs || config.windowMs)
      );
      
      if (validAttempts.length === 0) {
        this.rateLimitStore.delete(key);
      } else {
        this.rateLimitStore.set(key, validAttempts);
      }
    }
  }

  /**
   * Get rate limit status for display
   */
  getRateLimitStatus(key: string, action: string = 'default'): {
    isLimited: boolean;
    remainingAttempts: number;
    resetTime: Date;
    isBlocked: boolean;
  } {
    const result = this.checkRateLimit(key, action);
    return {
      isLimited: !result.allowed,
      remainingAttempts: result.remainingAttempts,
      resetTime: result.resetTime,
      isBlocked: result.isBlocked,
    };
  }

  /**
   * Check if user agent appears to be a bot
   */
  detectBot(userAgent?: string): boolean {
    if (!userAgent) return false;
    
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i,
      /headless/i, /phantom/i, /selenium/i
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Log security event (in production, this would send to a security service)
   */
  logSecurityEvent(event: {
    type: 'rate_limit_exceeded' | 'csrf_violation' | 'xss_attempt' | 'sql_injection_attempt' | 'bot_detected';
    severity: 'low' | 'medium' | 'high';
    details: Record<string, any>;
    userAgent?: string;
    ip?: string;
  }): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event);
    }
    
    // In production, send to security monitoring service
    // Example: securityMonitoring.logEvent(event);
  }
}

export const securityService = SecurityService.getInstance();

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    securityService.cleanup();
  }, 5 * 60 * 1000);
}