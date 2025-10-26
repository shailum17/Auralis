import { renderHook, act } from '@testing-library/react';
import { useSecurity } from '../useSecurity';
import { securityService } from '../../lib/security-service';

// Mock the security service
jest.mock('../../lib/security-service', () => ({
  securityService: {
    generateCSRFToken: jest.fn(),
    checkRateLimit: jest.fn(),
    getRateLimitStatus: jest.fn(),
    resetRateLimit: jest.fn(),
    validateCSRFToken: jest.fn(),
    validateAndSanitizeInput: jest.fn(),
    getSecurityHeaders: jest.fn(),
    detectBot: jest.fn(),
    logSecurityEvent: jest.fn(),
  },
}));

const mockSecurityService = securityService as jest.Mocked<typeof securityService>;

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  writable: true
});

describe('useSecurity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default mock implementations
    mockSecurityService.generateCSRFToken.mockReturnValue('mock-csrf-token');
    mockSecurityService.getRateLimitStatus.mockReturnValue({
      isLimited: false,
      remainingAttempts: 5,
      resetTime: new Date(Date.now() + 60000),
      isBlocked: false,
    });
    mockSecurityService.validateAndSanitizeInput.mockReturnValue({
      isValid: true,
      sanitizedValue: 'test input',
      violations: [],
      riskLevel: 'low',
    });
    mockSecurityService.getSecurityHeaders.mockReturnValue({
      'Content-Type': 'application/json',
      'X-CSRF-Token': 'mock-csrf-token',
    });
    mockSecurityService.detectBot.mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default security state', () => {
      const { result } = renderHook(() => useSecurity('test-user'));
      
      expect(result.current.securityState.csrfToken).toBe('mock-csrf-token');
      expect(result.current.securityState.isRateLimited).toBe(false);
      expect(result.current.securityState.remainingAttempts).toBe(5);
      expect(result.current.canSubmit).toBe(true);
    });

    it('should generate CSRF token when enabled', () => {
      renderHook(() => useSecurity('test-user', { enableCSRF: true }));
      
      expect(mockSecurityService.generateCSRFToken).toHaveBeenCalledWith('default-form');
    });

    it('should not generate CSRF token when disabled', () => {
      renderHook(() => useSecurity('test-user', { enableCSRF: false }));
      
      expect(mockSecurityService.generateCSRFToken).not.toHaveBeenCalled();
    });

    it('should check rate limit status on initialization', () => {
      renderHook(() => useSecurity('test-user'));
      
      expect(mockSecurityService.getRateLimitStatus).toHaveBeenCalledWith('test-user', 'formSubmission');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limited state', () => {
      mockSecurityService.getRateLimitStatus.mockReturnValue({
        isLimited: true,
        remainingAttempts: 2,
        resetTime: new Date(Date.now() + 60000),
        isBlocked: false,
      });

      const { result } = renderHook(() => useSecurity('test-user'));
      
      expect(result.current.securityState.isRateLimited).toBe(true);
      expect(result.current.securityState.remainingAttempts).toBe(2);
      expect(result.current.canSubmit).toBe(false);
    });

    it('should handle blocked state', () => {
      mockSecurityService.getRateLimitStatus.mockReturnValue({
        isLimited: true,
        remainingAttempts: 0,
        resetTime: new Date(Date.now() + 300000),
        isBlocked: true,
      });

      const { result } = renderHook(() => useSecurity('test-user'));
      
      expect(result.current.securityState.isBlocked).toBe(true);
      expect(result.current.canSubmit).toBe(false);
    });

    it('should attempt action with rate limiting', async () => {
      mockSecurityService.checkRateLimit.mockReturnValue({
        allowed: true,
        remainingAttempts: 4,
        resetTime: new Date(Date.now() + 60000),
        isBlocked: false,
      });

      const { result } = renderHook(() => useSecurity('test-user'));
      
      const mockAction = jest.fn().mockResolvedValue('success');
      
      await act(async () => {
        const actionResult = await result.current.attemptAction(mockAction);
        expect(actionResult.success).toBe(true);
        expect(actionResult.data).toBe('success');
      });
      
      expect(mockAction).toHaveBeenCalled();
      expect(mockSecurityService.checkRateLimit).toHaveBeenCalledWith('test-user', 'formSubmission');
    });

    it('should block action when rate limited', async () => {
      mockSecurityService.checkRateLimit.mockReturnValue({
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(Date.now() + 60000),
        isBlocked: true,
      });

      const { result } = renderHook(() => useSecurity('test-user'));
      
      const mockAction = jest.fn();
      
      await act(async () => {
        const actionResult = await result.current.attemptAction(mockAction);
        expect(actionResult.success).toBe(false);
        expect(actionResult.error).toContain('Account temporarily blocked');
      });
      
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should reset rate limit', () => {
      const { result } = renderHook(() => useSecurity('test-user'));
      
      act(() => {
        result.current.resetRateLimit();
      });
      
      expect(mockSecurityService.resetRateLimit).toHaveBeenCalledWith('test-user', 'formSubmission');
    });

    it('should format time until reset', () => {
      mockSecurityService.getRateLimitStatus.mockReturnValue({
        isLimited: true,
        remainingAttempts: 0,
        resetTime: new Date(Date.now() + 125000), // 2 minutes 5 seconds
        isBlocked: true,
      });

      const { result } = renderHook(() => useSecurity('test-user'));
      
      const timeUntilReset = result.current.getTimeUntilReset();
      expect(timeUntilReset).toBe('2m 5s');
    });
  });

  describe('Input Validation', () => {
    it('should validate and sanitize input', () => {
      const { result } = renderHook(() => useSecurity('test-user'));
      
      const validationResult = result.current.validateInput('test input', 'text', 100);
      
      expect(mockSecurityService.validateAndSanitizeInput).toHaveBeenCalledWith('test input', {
        fieldType: 'text',
        maxLength: 100,
        allowHTML: false,
        allowScripts: false,
        allowSQLPatterns: false,
      });
      
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.sanitizedValue).toBe('test input');
    });

    it('should handle high-risk input violations', () => {
      mockSecurityService.validateAndSanitizeInput.mockReturnValue({
        isValid: false,
        sanitizedValue: 'sanitized input',
        violations: ['Potentially malicious script content detected'],
        riskLevel: 'high',
      });

      const { result } = renderHook(() => useSecurity('test-user'));
      
      act(() => {
        result.current.validateInput('<script>alert("xss")</script>', 'text');
      });
      
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'xss_attempt',
        severity: 'high',
        details: expect.objectContaining({
          input: '<script>alert("xss")</script>',
          violations: ['Potentially malicious script content detected'],
        }),
        userAgent: expect.any(String),
      });
    });

    it('should skip validation when disabled', () => {
      const { result } = renderHook(() => useSecurity('test-user', { enableInputValidation: false }));
      
      const validationResult = result.current.validateInput('test input');
      
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.sanitizedValue).toBe('test input');
      expect(mockSecurityService.validateAndSanitizeInput).not.toHaveBeenCalled();
    });
  });

  describe('CSRF Protection', () => {
    it('should validate CSRF token', () => {
      mockSecurityService.validateCSRFToken.mockReturnValue(true);
      
      const { result } = renderHook(() => useSecurity('test-user'));
      
      const isValid = result.current.validateCSRF('valid-token');
      
      expect(isValid).toBe(true);
      expect(mockSecurityService.validateCSRFToken).toHaveBeenCalledWith('default-form', 'valid-token');
    });

    it('should log CSRF violations', () => {
      mockSecurityService.validateCSRFToken.mockReturnValue(false);
      
      const { result } = renderHook(() => useSecurity('test-user'));
      
      const isValid = result.current.validateCSRF('invalid-token');
      
      expect(isValid).toBe(false);
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'csrf_violation',
        severity: 'high',
        details: { formId: 'default-form', providedToken: 'invalid-token' },
        userAgent: expect.any(String),
      });
    });

    it('should skip CSRF validation when disabled', () => {
      const { result } = renderHook(() => useSecurity('test-user', { enableCSRF: false }));
      
      const isValid = result.current.validateCSRF('any-token');
      
      expect(isValid).toBe(true);
      expect(mockSecurityService.validateCSRFToken).not.toHaveBeenCalled();
    });
  });

  describe('Security Headers', () => {
    it('should get security headers', () => {
      const { result } = renderHook(() => useSecurity('test-user'));
      
      const headers = result.current.getSecurityHeaders();
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'mock-csrf-token',
      });
      expect(mockSecurityService.getSecurityHeaders).toHaveBeenCalledWith('default-form');
    });

    it('should get headers without CSRF when disabled', () => {
      const { result } = renderHook(() => useSecurity('test-user', { enableCSRF: false }));
      
      result.current.getSecurityHeaders();
      
      expect(mockSecurityService.getSecurityHeaders).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Bot Detection', () => {
    it('should detect bots', () => {
      mockSecurityService.detectBot.mockReturnValue(true);
      
      const { result } = renderHook(() => useSecurity('test-user'));
      
      const isBot = result.current.isBotDetected();
      
      expect(isBot).toBe(true);
      expect(mockSecurityService.detectBot).toHaveBeenCalledWith(navigator.userAgent);
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'bot_detected',
        severity: 'medium',
        details: { userAgent: navigator.userAgent },
        userAgent: navigator.userAgent,
      });
    });

    it('should not log when bot is not detected', () => {
      mockSecurityService.detectBot.mockReturnValue(false);
      
      const { result } = renderHook(() => useSecurity('test-user'));
      
      const isBot = result.current.isBotDetected();
      
      expect(isBot).toBe(false);
      expect(mockSecurityService.logSecurityEvent).not.toHaveBeenCalled();
    });
  });

  describe('Security Status', () => {
    it('should provide correct security status', () => {
      const { result } = renderHook(() => useSecurity('test-user'));
      
      expect(result.current.isSecure).toBe(true);
      expect(result.current.canSubmit).toBe(true);
      expect(result.current.securityStatus).toEqual({
        level: 'low',
        isRateLimited: false,
        isBlocked: false,
        remainingAttempts: 5,
        violations: [],
        timeUntilReset: expect.any(String),
      });
    });

    it('should update security status when violations occur', () => {
      mockSecurityService.validateAndSanitizeInput.mockReturnValue({
        isValid: false,
        sanitizedValue: 'sanitized',
        violations: ['XSS attempt detected'],
        riskLevel: 'high',
      });

      const { result } = renderHook(() => useSecurity('test-user'));
      
      act(() => {
        result.current.validateInput('<script>alert("xss")</script>', 'text');
      });
      
      expect(result.current.securityStatus.level).toBe('high');
      expect(result.current.securityStatus.violations).toContain('XSS attempt detected');
      expect(result.current.isSecure).toBe(false);
    });
  });

  describe('Periodic Updates', () => {
    it('should update rate limit status periodically when limited', () => {
      mockSecurityService.getRateLimitStatus
        .mockReturnValueOnce({
          isLimited: true,
          remainingAttempts: 2,
          resetTime: new Date(Date.now() + 60000),
          isBlocked: false,
        })
        .mockReturnValueOnce({
          isLimited: false,
          remainingAttempts: 5,
          resetTime: new Date(Date.now() + 60000),
          isBlocked: false,
        });

      const { result } = renderHook(() => useSecurity('test-user'));
      
      // Initially rate limited
      expect(result.current.securityState.isRateLimited).toBe(true);
      
      // Advance timer to trigger periodic update
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Should update to not rate limited
      expect(result.current.securityState.isRateLimited).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle action errors gracefully', async () => {
      mockSecurityService.checkRateLimit.mockReturnValue({
        allowed: true,
        remainingAttempts: 4,
        resetTime: new Date(Date.now() + 60000),
        isBlocked: false,
      });

      const { result } = renderHook(() => useSecurity('test-user'));
      
      const mockAction = jest.fn().mockRejectedValue(new Error('Action failed'));
      
      await act(async () => {
        const actionResult = await result.current.attemptAction(mockAction);
        expect(actionResult.success).toBe(false);
        expect(actionResult.error).toBe('Action failed');
      });
    });

    it('should handle missing identifier', async () => {
      const { result } = renderHook(() => useSecurity(''));
      
      const mockAction = jest.fn();
      
      await act(async () => {
        const actionResult = await result.current.attemptAction(mockAction);
        expect(actionResult.success).toBe(false);
        expect(actionResult.error).toBe('No identifier provided');
      });
      
      expect(mockAction).not.toHaveBeenCalled();
    });
  });
});