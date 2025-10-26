import { FormValidator, AuthValidationRules } from '../form-validation';

describe('FormValidator', () => {
  describe('Enhanced Email Validation', () => {
    it('should validate correct email format', () => {
      const result = FormValidator.validateEmailEnhanced('test@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email format', () => {
      const result = FormValidator.validateEmailEnhanced('invalid-email');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please enter a valid email address');
    });

    it('should reject disposable email domains', () => {
      const result = FormValidator.validateEmailEnhanced('test@10minutemail.com');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Disposable email addresses are not allowed');
      expect(result.suggestions).toContain('Please use a permanent email address like Gmail, Yahoo, or Outlook');
    });

    it('should warn about uncommon domains', () => {
      const result = FormValidator.validateEmailEnhanced('test@uncommon-domain.xyz');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Consider using a more common email provider for better deliverability');
    });

    it('should suggest corrections for common typos', () => {
      const result = FormValidator.validateEmailEnhanced('test@gmial.com');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Did you mean one of these?');
      expect(result.suggestions).toContain('test@gmail.com');
    });

    it('should reject invalid domain format', () => {
      const result = FormValidator.validateEmailEnhanced('test@invalid..domain');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email domain format');
    });

    it('should handle empty email', () => {
      const result = FormValidator.validateEmailEnhanced('');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Enhanced Password Validation', () => {
    it('should validate strong password', () => {
      const result = FormValidator.validatePasswordEnhanced('StrongPass123!');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const result = FormValidator.validatePasswordEnhanced('weak');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password does not meet security requirements');
    });

    it('should reject password with all same characters', () => {
      const result = FormValidator.validatePasswordEnhanced('aaaaaaaa');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot be all the same character');
    });

    it('should warn about sequential characters', () => {
      const result = FormValidator.validatePasswordEnhanced('Abc123456!');
      
      expect(result.warnings).toContain('Avoid sequential characters for better security');
    });

    it('should reject common passwords', () => {
      const result = FormValidator.validatePasswordEnhanced('password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password contains common words that are easily guessed');
      expect(result.suggestions).toContain('Use a unique combination of words, numbers, and symbols');
    });

    it('should warn about keyboard patterns', () => {
      const result = FormValidator.validatePasswordEnhanced('Qwerty123!');
      
      expect(result.warnings).toContain('Avoid keyboard patterns for better security');
    });

    it('should provide suggestions for unmet requirements', () => {
      const result = FormValidator.validatePasswordEnhanced('password');
      
      expect(result.suggestions?.length).toBeGreaterThan(0);
      expect(result.suggestions).toContain('At least one uppercase letter');
    });

    it('should handle empty password', () => {
      const result = FormValidator.validatePasswordEnhanced('');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Enhanced Username Validation', () => {
    it('should validate correct username', () => {
      const result = FormValidator.validateUsernameEnhanced('validuser123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject username with invalid characters', () => {
      const result = FormValidator.validateUsernameEnhanced('user@name');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username can only contain letters, numbers, underscores, and hyphens');
    });

    it('should reject username that is too short', () => {
      const result = FormValidator.validateUsernameEnhanced('ab');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters long');
    });

    it('should reject username that is too long', () => {
      const longUsername = 'a'.repeat(31);
      const result = FormValidator.validateUsernameEnhanced(longUsername);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be less than 30 characters long');
    });

    it('should reject reserved usernames', () => {
      const result = FormValidator.validateUsernameEnhanced('admin');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This username is reserved and cannot be used');
      expect(result.suggestions?.[0]).toContain('admin123');
    });

    it('should warn about numeric-only usernames', () => {
      const result = FormValidator.validateUsernameEnhanced('12345');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Consider adding letters to make your username more memorable');
      expect(result.suggestions).toContain('user12345');
    });

    it('should warn about short usernames', () => {
      const result = FormValidator.validateUsernameEnhanced('abc');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Shorter usernames might be harder to remember');
    });

    it('should reject offensive content', () => {
      const result = FormValidator.validateUsernameEnhanced('fuckuser');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username contains inappropriate content');
    });

    it('should handle empty username', () => {
      const result = FormValidator.validateUsernameEnhanced('');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize XSS attempts', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      const sanitized = FormValidator.sanitizeInput(maliciousInput, {
        enableXSSProtection: true
      });
      
      expect(sanitized).toBe('Hello');
    });

    it('should sanitize SQL injection attempts', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = FormValidator.sanitizeInput(maliciousInput, {
        enableSQLInjectionProtection: true
      });
      
      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('--');
    });

    it('should remove HTML tags', () => {
      const input = '<div>Hello <b>World</b></div>';
      const sanitized = FormValidator.sanitizeInput(input, {
        enableXSSProtection: true
      });
      
      expect(sanitized).toBe('Hello World');
    });

    it('should enforce character restrictions', () => {
      const input = 'Hello@#$World123';
      const sanitized = FormValidator.sanitizeInput(input, {
        allowedCharacters: /[a-zA-Z]/,
        enableXSSProtection: false,
        enableSQLInjectionProtection: false
      });
      
      expect(sanitized).toBe('HelloWorld');
    });

    it('should enforce length restrictions', () => {
      const input = 'Hello World';
      const sanitized = FormValidator.sanitizeInput(input, {
        maxLength: 5
      });
      
      expect(sanitized).toBe('Hello');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = FormValidator.sanitizeInput(input);
      
      expect(sanitized).toBe('Hello World');
    });

    it('should allow disabling protections', () => {
      const input = '<script>alert("test")</script>';
      const sanitized = FormValidator.sanitizeInput(input, {
        enableXSSProtection: false
      });
      
      expect(sanitized).toBe(input);
    });
  });

  describe('Enhanced Field Validation with Security', () => {
    it('should validate field with security options', () => {
      const result = FormValidator.validateField('test@example.com', [
        { type: 'required', message: 'Required' },
        { type: 'email', message: 'Invalid email' }
      ], {
        enableXSSProtection: true,
        maxLength: 100
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect and sanitize security violations', () => {
      const result = FormValidator.validateField('<script>alert("xss")</script>test', [
        { type: 'required', message: 'Required' }
      ], {
        enableXSSProtection: true
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Potentially malicious script content detected');
    });

    it('should handle enhanced email validation in field validation', () => {
      const result = FormValidator.validateField('test@10minutemail.com', [
        { type: 'email', message: 'Invalid email' }
      ]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Disposable email addresses are not allowed');
    });
  });

  describe('Levenshtein Distance', () => {
    it('should calculate correct distance for similar strings', () => {
      // Access private method through any cast for testing
      const distance = (FormValidator as any).levenshteinDistance('gmail.com', 'gmial.com');
      expect(distance).toBe(2);
    });

    it('should calculate distance for identical strings', () => {
      const distance = (FormValidator as any).levenshteinDistance('test', 'test');
      expect(distance).toBe(0);
    });

    it('should calculate distance for completely different strings', () => {
      const distance = (FormValidator as any).levenshteinDistance('abc', 'xyz');
      expect(distance).toBe(3);
    });
  });

  describe('Email Typo Suggestions', () => {
    it('should suggest corrections for common typos', () => {
      const suggestions = (FormValidator as any).suggestEmailCorrections('test@gmial.com');
      expect(suggestions).toContain('test@gmail.com');
    });

    it('should suggest similar domains', () => {
      const suggestions = (FormValidator as any).suggestEmailCorrections('test@gmai.com');
      expect(suggestions).toContain('test@gmail.com');
    });

    it('should limit suggestions to 3', () => {
      const suggestions = (FormValidator as any).suggestEmailCorrections('test@invalid.com');
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should handle malformed email', () => {
      const suggestions = (FormValidator as any).suggestEmailCorrections('invalid-email');
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('AuthValidationRules with Enhanced Security', () => {
    it('should use enhanced email validation', () => {
      const rules = AuthValidationRules.email();
      const customRule = rules.find(rule => rule.type === 'custom');
      
      expect(customRule).toBeDefined();
      expect(customRule?.validator?.('test@example.com')).toBe(true);
      expect(customRule?.validator?.('test@10minutemail.com')).toBe(false);
    });

    it('should use enhanced username validation', () => {
      const rules = AuthValidationRules.username();
      const customRule = rules.find(rule => rule.type === 'custom');
      
      expect(customRule).toBeDefined();
      expect(customRule?.validator?.('validuser')).toBe(true);
      expect(customRule?.validator?.('admin')).toBe(false);
    });

    it('should use enhanced password validation', () => {
      const rules = AuthValidationRules.password();
      const customRule = rules.find(rule => rule.type === 'custom');
      
      expect(customRule).toBeDefined();
      expect(customRule?.validator?.('StrongPass123!')).toBe(true);
      expect(customRule?.validator?.('weak')).toBe(false);
    });

    it('should validate full name with security', () => {
      const rules = AuthValidationRules.fullName();
      const customRule = rules.find(rule => rule.type === 'custom');
      
      expect(customRule).toBeDefined();
      expect(customRule?.validator?.('John Doe')).toBe(true);
      expect(customRule?.validator?.('<script>alert("xss")</script>John')).toBe(false);
    });

    it('should validate OTP with enhanced security', () => {
      const rules = AuthValidationRules.otp();
      const customRule = rules.find(rule => rule.type === 'custom');
      
      expect(customRule).toBeDefined();
      expect(customRule?.validator?.('123456')).toBe(true);
      expect(customRule?.validator?.('111111')).toBe(false); // All same digits
      expect(customRule?.validator?.('12345')).toBe(false); // Wrong length
    });

    it('should validate identifier with security', () => {
      const rules = AuthValidationRules.identifier();
      const customRule = rules.find(rule => rule.type === 'custom');
      
      expect(customRule).toBeDefined();
      expect(customRule?.validator?.('test@example.com')).toBe(true);
      expect(customRule?.validator?.('<script>alert("xss")</script>')).toBe(false);
    });
  });
});