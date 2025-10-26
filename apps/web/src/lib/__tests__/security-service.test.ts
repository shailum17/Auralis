import { securityService, SecurityService } from '../security-service';

// Mock window.crypto for testing
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(() => {
    service = SecurityService.getInstance();
    // Clear any existing rate limit data
    service.cleanup();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      const result = service.checkRateLimit('user1', 'login');
      
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4); // 5 max - 1 used
      expect(result.isBlocked).toBe(false);
    });

    it('should block requests after exceeding rate limit', () => {
      // Make 5 requests (the limit for login)
      for (let i = 0; i < 5; i++) {
        service.checkRateLimit('user1', 'login');
      }
      
      // 6th request should be blocked
      const result = service.checkRateLimit('user1', 'login');
      
      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.isBlocked).toBe(true);
    });

    it('should reset rate limit after window expires', () => {
      // Make 5 requests to hit the limit
      for (let i = 0; i < 5; i++) {
        service.checkRateLimit('user1', 'login');
      }
      
      // Advance time beyond the window (15 minutes for login)
      jest.advanceTimersByTime(16 * 60 * 1000);
      
      // Should be allowed again
      const result = service.checkRateLimit('user1', 'login');
      expect(result.allowed).toBe(true);
    });

    it('should handle different actions independently', () => {
      // Hit login limit
      for (let i = 0; i < 5; i++) {
        service.checkRateLimit('user1', 'login');
      }
      
      // Register should still be allowed
      const result = service.checkRateLimit('user1', 'register');
      expect(result.allowed).toBe(true);
    });

    it('should handle different users independently', () => {
      // Hit limit for user1
      for (let i = 0; i < 5; i++) {
        service.checkRateLimit('user1', 'login');
      }
      
      // user2 should still be allowed
      const result = service.checkRateLimit('user2', 'login');
      expect(result.allowed).toBe(true);
    });

    it('should reset rate limit manually', () => {
      // Hit the limit
      for (let i = 0; i < 5; i++) {
        service.checkRateLimit('user1', 'login');
      }
      
      // Reset manually
      service.resetRateLimit('user1', 'login');
      
      // Should be allowed again
      const result = service.checkRateLimit('user1', 'login');
      expect(result.allowed).toBe(true);
    });

    it('should return correct remaining attempts', () => {
      expect(service.getRemainingAttempts('user1', 'login')).toBe(5);
      
      service.checkRateLimit('user1', 'login');
      expect(service.getRemainingAttempts('user1', 'login')).toBe(4);
      
      service.checkRateLimit('user1', 'login');
      expect(service.getRemainingAttempts('user1', 'login')).toBe(3);
    });
  });

  describe('CSRF Protection', () => {
    it('should generate unique CSRF tokens', () => {
      const token1 = service.generateCSRFToken('form1');
      const token2 = service.generateCSRFToken('form2');
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(0);
    });

    it('should validate correct CSRF token', () => {
      const token = service.generateCSRFToken('form1');
      const isValid = service.validateCSRFToken('form1', token);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid CSRF token', () => {
      service.generateCSRFToken('form1');
      const isValid = service.validateCSRFToken('form1', 'invalid-token');
      
      expect(isValid).toBe(false);
    });

    it('should reject token for wrong form', () => {
      const token = service.generateCSRFToken('form1');
      const isValid = service.validateCSRFToken('form2', token);
      
      expect(isValid).toBe(false);
    });

    it('should reject expired token', () => {
      const token = service.generateCSRFToken('form1');
      
      // Advance time beyond token lifetime (30 minutes)
      jest.advanceTimersByTime(31 * 60 * 1000);
      
      const isValid = service.validateCSRFToken('form1', token);
      expect(isValid).toBe(false);
    });

    it('should be single-use token', () => {
      const token = service.generateCSRFToken('form1');
      
      // First validation should succeed
      expect(service.validateCSRFToken('form1', token)).toBe(true);
      
      // Second validation should fail
      expect(service.validateCSRFToken('form1', token)).toBe(false);
    });
  });

  describe('Input Sanitization and Validation', () => {
    it('should sanitize XSS attempts', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      const result = service.validateAndSanitizeInput(maliciousInput);
      
      expect(result.sanitizedValue).toBe('Hello');
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Potentially malicious script content detected');
      expect(result.riskLevel).toBe('high');
    });

    it('should sanitize SQL injection attempts', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const result = service.validateAndSanitizeInput(maliciousInput);
      
      expect(result.sanitizedValue).not.toContain('DROP TABLE');
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Potentially malicious SQL patterns detected');
      expect(result.riskLevel).toBe('high');
    });

    it('should remove HTML tags when not allowed', () => {
      const input = '<div>Hello <b>World</b></div>';
      const result = service.validateAndSanitizeInput(input, { allowHTML: false });
      
      expect(result.sanitizedValue).toBe('Hello World');
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('HTML tags are not allowed');
    });

    it('should allow HTML tags when explicitly allowed', () => {
      const input = '<div>Hello <b>World</b></div>';
      const result = service.validateAndSanitizeInput(input, { allowHTML: true });
      
      expect(result.sanitizedValue).toBe(input);
      expect(result.isValid).toBe(true);
    });

    it('should enforce maximum length', () => {
      const longInput = 'a'.repeat(100);
      const result = service.validateAndSanitizeInput(longInput, { maxLength: 50 });
      
      expect(result.sanitizedValue).toHaveLength(50);
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Input exceeds maximum length of 50 characters');
    });

    it('should remove null bytes', () => {
      const input = 'Hello\0World';
      const result = service.validateAndSanitizeInput(input);
      
      expect(result.sanitizedValue).toBe('HelloWorld');
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Null bytes are not allowed');
    });

    it('should remove control characters', () => {
      const input = 'Hello\x01\x02World';
      const result = service.validateAndSanitizeInput(input);
      
      expect(result.sanitizedValue).toBe('HelloWorld');
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Control characters are not allowed');
    });

    describe('Field-specific validation', () => {
      it('should validate email field type', () => {
        const validEmail = 'test@example.com';
        const result = service.validateAndSanitizeInput(validEmail, { fieldType: 'email' });
        
        expect(result.isValid).toBe(true);
        expect(result.sanitizedValue).toBe(validEmail);
      });

      it('should sanitize invalid email characters', () => {
        const invalidEmail = 'test<script>@example.com';
        const result = service.validateAndSanitizeInput(invalidEmail, { fieldType: 'email' });
        
        expect(result.sanitizedValue).not.toContain('<script>');
        expect(result.isValid).toBe(false);
      });

      it('should validate username field type', () => {
        const validUsername = 'user123_test';
        const result = service.validateAndSanitizeInput(validUsername, { fieldType: 'username' });
        
        expect(result.isValid).toBe(true);
        expect(result.sanitizedValue).toBe(validUsername);
      });

      it('should sanitize invalid username characters', () => {
        const invalidUsername = 'user@#$%';
        const result = service.validateAndSanitizeInput(invalidUsername, { fieldType: 'username' });
        
        expect(result.sanitizedValue).toBe('user');
        expect(result.isValid).toBe(false);
        expect(result.violations).toContain('Username contains invalid characters');
      });

      it('should validate password length', () => {
        const longPassword = 'a'.repeat(200);
        const result = service.validateAndSanitizeInput(longPassword, { fieldType: 'password' });
        
        expect(result.sanitizedValue).toHaveLength(128);
        expect(result.isValid).toBe(false);
        expect(result.violations).toContain('Password is too long');
      });

      it('should validate URL field type', () => {
        const validUrl = 'https://example.com';
        const result = service.validateAndSanitizeInput(validUrl, { fieldType: 'url' });
        
        expect(result.isValid).toBe(true);
      });

      it('should reject non-HTTP URLs', () => {
        const invalidUrl = 'javascript:alert("xss")';
        const result = service.validateAndSanitizeInput(invalidUrl, { fieldType: 'url' });
        
        expect(result.isValid).toBe(false);
        expect(result.violations).toContain('Only HTTP and HTTPS URLs are allowed');
      });
    });
  });

  describe('Security Headers', () => {
    it('should generate basic security headers', () => {
      const headers = service.getSecurityHeaders();
      
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Requested-With']).toBe('XMLHttpRequest');
    });

    it('should include CSRF token when form ID provided', () => {
      const headers = service.getSecurityHeaders('test-form');
      
      expect(headers['X-CSRF-Token']).toBeDefined();
      expect(headers['X-CSRF-Token'].length).toBeGreaterThan(0);
    });
  });

  describe('Bot Detection', () => {
    it('should detect common bot user agents', () => {
      const botUserAgents = [
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'curl/7.68.0',
        'python-requests/2.25.1',
        'HeadlessChrome/91.0.4472.114'
      ];

      botUserAgents.forEach(userAgent => {
        expect(service.detectBot(userAgent)).toBe(true);
      });
    });

    it('should not flag normal browser user agents', () => {
      const normalUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ];

      normalUserAgents.forEach(userAgent => {
        expect(service.detectBot(userAgent)).toBe(false);
      });
    });

    it('should handle undefined user agent', () => {
      expect(service.detectBot(undefined)).toBe(false);
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events in development', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      service.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'high',
        details: { input: '<script>alert("test")</script>' }
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Security Event:', expect.objectContaining({
        type: 'xss_attempt',
        severity: 'high'
      }));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should clean up expired tokens and rate limits', () => {
      // Generate some tokens and rate limits
      service.generateCSRFToken('form1');
      service.checkRateLimit('user1', 'login');
      
      // Advance time to expire them
      jest.advanceTimersByTime(2 * 60 * 60 * 1000); // 2 hours
      
      // Cleanup should remove expired entries
      service.cleanup();
      
      // Verify cleanup worked (this is more of an integration test)
      const rateLimitStatus = service.getRateLimitStatus('user1', 'login');
      expect(rateLimitStatus.remainingAttempts).toBe(5); // Should be reset
    });
  });

  describe('Rate Limit Status', () => {
    it('should return correct rate limit status', () => {
      const status = service.getRateLimitStatus('user1', 'login');
      
      expect(status.isLimited).toBe(false);
      expect(status.remainingAttempts).toBe(5);
      expect(status.isBlocked).toBe(false);
    });

    it('should return limited status after exceeding limit', () => {
      // Hit the limit
      for (let i = 0; i < 5; i++) {
        service.checkRateLimit('user1', 'login');
      }
      
      const status = service.getRateLimitStatus('user1', 'login');
      
      expect(status.isLimited).toBe(true);
      expect(status.remainingAttempts).toBe(0);
      expect(status.isBlocked).toBe(true);
    });
  });
});