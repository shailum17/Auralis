import { authValidationService } from '../auth-validation';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('AuthValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authValidationService.clearCache();
  });

  describe('validateEmail', () => {
    it('should validate a correct email format', async () => {
      // Mock successful availability check
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isAvailable: true, message: 'Email is available' }),
      });

      const result = await authValidationService.validateEmail('test@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email format', async () => {
      const result = await authValidationService.validateEmail('invalid-email');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please enter a valid email address');
    });

    it('should reject empty email', async () => {
      const result = await authValidationService.validateEmail('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email address is required');
    });

    it('should reject email that is too long', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = await authValidationService.validateEmail(longEmail);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email address is too long');
    });

    it('should handle duplicate email', async () => {
      // Mock duplicate email response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          isAvailable: false, 
          message: 'Email address is already registered' 
        }),
      });

      const result = await authValidationService.validateEmail('existing@example.com');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email address is already registered');
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await authValidationService.validateEmail('test@example.com');
      
      // Should fail open (assume available) but show warning
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Unable to verify email availability');
    });
  });

  describe('validateUsername', () => {
    it('should validate a correct username', async () => {
      // Mock successful availability check
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isAvailable: true, message: 'Username is available' }),
      });

      const result = await authValidationService.validateUsername('validuser123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject username that is too short', async () => {
      const result = await authValidationService.validateUsername('ab');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters long');
    });

    it('should reject username that is too long', async () => {
      const longUsername = 'a'.repeat(31);
      const result = await authValidationService.validateUsername(longUsername);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be less than 30 characters long');
    });

    it('should reject username with invalid characters', async () => {
      const result = await authValidationService.validateUsername('user@name');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username can only contain letters, numbers, underscores, and hyphens');
    });

    it('should warn about numeric-only usernames', async () => {
      // Mock successful availability check
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isAvailable: true, message: 'Username is available' }),
      });

      const result = await authValidationService.validateUsername('12345');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Consider adding letters to make your username more memorable');
    });

    it('should handle duplicate username with suggestions', async () => {
      // Mock duplicate username response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          isAvailable: false, 
          message: 'This username is already taken',
          suggestions: ['testuser1', 'testuser2', 'testuser123']
        }),
      });

      const result = await authValidationService.validateUsername('testuser');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This username is already taken');
      expect(result.fieldErrors.suggestions).toBeDefined();
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = authValidationService.validatePassword('StrongPass123!');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty password', () => {
      const result = authValidationService.validatePassword('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should reject password that is too short', () => {
      const result = authValidationService.validatePassword('short');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject weak password', () => {
      const result = authValidationService.validatePassword('password');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password does not meet security requirements');
    });

    it('should reject password with all same characters', () => {
      const result = authValidationService.validatePassword('aaaaaaaa');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot be all the same character');
    });

    it('should warn about sequential characters', () => {
      const result = authValidationService.validatePassword('Abc123456!');
      
      expect(result.warnings).toContain('Avoid sequential characters for better security');
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('should validate matching passwords', () => {
      const password = 'StrongPass123!';
      const result = authValidationService.validatePasswordConfirmation(password, password);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty confirmation', () => {
      const result = authValidationService.validatePasswordConfirmation('password', '');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please confirm your password');
    });

    it('should reject non-matching passwords', () => {
      const result = authValidationService.validatePasswordConfirmation('password1', 'password2');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Passwords do not match');
    });
  });

  describe('validateFullName', () => {
    it('should validate a correct full name', () => {
      const result = authValidationService.validateFullName('John Doe');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty full name', () => {
      const result = authValidationService.validateFullName('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Full name is required');
    });

    it('should reject full name that is too short', () => {
      const result = authValidationService.validateFullName('A');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Full name must be at least 2 characters long');
    });

    it('should reject full name that is too long', () => {
      const longName = 'A'.repeat(101);
      const result = authValidationService.validateFullName(longName);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Full name must be less than 100 characters long');
    });

    it('should reject full name with invalid characters', () => {
      const result = authValidationService.validateFullName('John@Doe');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Full name can only contain letters, spaces, hyphens, periods, and apostrophes');
    });

    it('should warn about single name', () => {
      const result = authValidationService.validateFullName('John');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Consider including both first and last name');
    });

    it('should warn about leading/trailing spaces', () => {
      const result = authValidationService.validateFullName(' John Doe ');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Remove leading or trailing spaces');
    });
  });

  describe('generateUsernameSuggestions', () => {
    it('should generate suggestions from full name', () => {
      const suggestions = authValidationService.generateUsernameSuggestions('John Doe');
      
      expect(suggestions).toHaveLength(5);
      expect(suggestions).toContain('johndoe');
      expect(suggestions).toContain('john_doe');
      expect(suggestions).toContain('john.doe');
    });

    it('should generate suggestions for single name', () => {
      const suggestions = authValidationService.generateUsernameSuggestions('John');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('john'))).toBe(true);
    });

    it('should filter out existing username', () => {
      const suggestions = authValidationService.generateUsernameSuggestions('John Doe', 'johndoe');
      
      expect(suggestions).not.toContain('johndoe');
    });

    it('should return empty array for empty name', () => {
      const suggestions = authValidationService.generateUsernameSuggestions('');
      
      expect(suggestions).toHaveLength(0);
    });
  });
});