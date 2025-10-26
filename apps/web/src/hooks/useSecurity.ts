'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { securityService, RateLimitResult, SecurityValidationResult } from '@/lib/security-service';

export interface SecurityHookOptions {
  rateLimitAction?: string;
  enableCSRF?: boolean;
  enableRateLimit?: boolean;
  enableInputValidation?: boolean;
  formId?: string;
}

export interface SecurityState {
  isRateLimited: boolean;
  remainingAttempts: number;
  resetTime: Date | null;
  isBlocked: boolean;
  csrfToken: string | null;
  violations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export function useSecurity(
  identifier: string, 
  options: SecurityHookOptions = {}
) {
  const {
    rateLimitAction = 'formSubmission',
    enableCSRF = true,
    enableRateLimit = true,
    enableInputValidation = true,
    formId = 'default-form'
  } = options;

  const [securityState, setSecurityState] = useState<SecurityState>({
    isRateLimited: false,
    remainingAttempts: 0,
    resetTime: null,
    isBlocked: false,
    csrfToken: null,
    violations: [],
    riskLevel: 'low'
  });

  const rateLimitCheckRef = useRef<NodeJS.Timeout>();

  // Initialize CSRF token
  useEffect(() => {
    if (enableCSRF) {
      const token = securityService.generateCSRFToken(formId);
      setSecurityState(prev => ({ ...prev, csrfToken: token }));
    }
  }, [enableCSRF, formId]);

  // Check rate limit status
  const checkRateLimit = useCallback(() => {
    if (!enableRateLimit || !identifier) return;

    const status = securityService.getRateLimitStatus(identifier, rateLimitAction);
    setSecurityState(prev => ({
      ...prev,
      isRateLimited: status.isLimited,
      remainingAttempts: status.remainingAttempts,
      resetTime: status.resetTime,
      isBlocked: status.isBlocked
    }));
  }, [identifier, rateLimitAction, enableRateLimit]);

  // Initial rate limit check
  useEffect(() => {
    checkRateLimit();
  }, [checkRateLimit]);

  // Periodic rate limit status updates
  useEffect(() => {
    if (enableRateLimit && securityState.isRateLimited) {
      rateLimitCheckRef.current = setInterval(checkRateLimit, 1000);
      return () => {
        if (rateLimitCheckRef.current) {
          clearInterval(rateLimitCheckRef.current);
        }
      };
    }
  }, [enableRateLimit, securityState.isRateLimited, checkRateLimit]);

  // Attempt an action with rate limiting
  const attemptAction = useCallback(async <T>(
    action: () => Promise<T>,
    actionType?: string
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    if (!identifier) {
      return { success: false, error: 'No identifier provided' };
    }

    const rateLimitResult = securityService.checkRateLimit(
      identifier, 
      actionType || rateLimitAction
    );

    if (!rateLimitResult.allowed) {
      setSecurityState(prev => ({
        ...prev,
        isRateLimited: true,
        remainingAttempts: rateLimitResult.remainingAttempts,
        resetTime: rateLimitResult.resetTime,
        isBlocked: rateLimitResult.isBlocked
      }));

      const timeUntilReset = Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000 / 60);
      return { 
        success: false, 
        error: rateLimitResult.isBlocked 
          ? `Account temporarily blocked. Try again in ${timeUntilReset} minutes.`
          : `Too many attempts. Try again in ${timeUntilReset} minutes.`
      };
    }

    try {
      const result = await action();
      
      // Update rate limit status after successful action
      checkRateLimit();
      
      return { success: true, data: result };
    } catch (error) {
      // Update rate limit status after failed action
      checkRateLimit();
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Action failed' 
      };
    }
  }, [identifier, rateLimitAction, checkRateLimit]);

  // Validate and sanitize input
  const validateInput = useCallback((
    input: string,
    fieldType?: 'email' | 'username' | 'password' | 'text' | 'url',
    maxLength?: number
  ): SecurityValidationResult => {
    if (!enableInputValidation) {
      return {
        isValid: true,
        sanitizedValue: input,
        violations: [],
        riskLevel: 'low'
      };
    }

    const result = securityService.validateAndSanitizeInput(input, {
      fieldType,
      maxLength,
      allowHTML: false,
      allowScripts: false,
      allowSQLPatterns: false
    });

    // Update security state with violations
    setSecurityState(prev => ({
      ...prev,
      violations: result.violations,
      riskLevel: result.riskLevel
    }));

    // Log security events for high-risk violations
    if (result.riskLevel === 'high' && result.violations.length > 0) {
      securityService.logSecurityEvent({
        type: result.violations.some(v => v.includes('script')) ? 'xss_attempt' : 'sql_injection_attempt',
        severity: 'high',
        details: {
          input: input.substring(0, 100), // Log first 100 chars only
          violations: result.violations,
          fieldType
        },
        userAgent: navigator.userAgent
      });
    }

    return result;
  }, [enableInputValidation]);

  // Validate CSRF token
  const validateCSRF = useCallback((token: string): boolean => {
    if (!enableCSRF) return true;
    
    const isValid = securityService.validateCSRFToken(formId, token);
    
    if (!isValid) {
      securityService.logSecurityEvent({
        type: 'csrf_violation',
        severity: 'high',
        details: { formId, providedToken: token },
        userAgent: navigator.userAgent
      });
    }
    
    return isValid;
  }, [enableCSRF, formId]);

  // Get security headers for API requests
  const getSecurityHeaders = useCallback((): Record<string, string> => {
    return securityService.getSecurityHeaders(enableCSRF ? formId : undefined);
  }, [enableCSRF, formId]);

  // Reset rate limit (useful after successful authentication)
  const resetRateLimit = useCallback(() => {
    if (identifier) {
      securityService.resetRateLimit(identifier, rateLimitAction);
      setSecurityState(prev => ({
        ...prev,
        isRateLimited: false,
        remainingAttempts: 0,
        resetTime: null,
        isBlocked: false
      }));
    }
  }, [identifier, rateLimitAction]);

  // Get formatted time until reset
  const getTimeUntilReset = useCallback((): string => {
    if (!securityState.resetTime) return '';
    
    const now = Date.now();
    const resetTime = securityState.resetTime.getTime();
    const diff = Math.max(0, resetTime - now);
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [securityState.resetTime]);

  // Check if current user agent is a bot
  const isBotDetected = useCallback((): boolean => {
    const isBot = securityService.detectBot(navigator.userAgent);
    
    if (isBot) {
      securityService.logSecurityEvent({
        type: 'bot_detected',
        severity: 'medium',
        details: { userAgent: navigator.userAgent },
        userAgent: navigator.userAgent
      });
    }
    
    return isBot;
  }, []);

  return {
    // Security state
    securityState,
    
    // Rate limiting
    attemptAction,
    resetRateLimit,
    getTimeUntilReset,
    
    // Input validation
    validateInput,
    
    // CSRF protection
    validateCSRF,
    
    // Security headers
    getSecurityHeaders,
    
    // Bot detection
    isBotDetected,
    
    // Utility functions
    isSecure: securityState.riskLevel === 'low' && !securityState.isRateLimited,
    canSubmit: !securityState.isRateLimited && !securityState.isBlocked,
    
    // Security status for UI
    securityStatus: {
      level: securityState.riskLevel,
      isRateLimited: securityState.isRateLimited,
      isBlocked: securityState.isBlocked,
      remainingAttempts: securityState.remainingAttempts,
      violations: securityState.violations,
      timeUntilReset: getTimeUntilReset()
    }
  };
}