import { renderHook, act } from '@testing-library/react';
import { useEmailResend } from '../useEmailResend';
import { authAPI } from '@/lib/auth-api';

// Mock the auth API
jest.mock('@/lib/auth-api');
const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

// Mock timers
jest.useFakeTimers();

describe('useEmailResend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useEmailResend());

      expect(result.current.isResending).toBe(false);
      expect(result.current.canResend).toBe(true);
      expect(result.current.cooldownSeconds).toBe(0);
      expect(result.current.lastResendTime).toBe(null);
      expect(result.current.resendCount).toBe(0);
      expect(result.current.error).toBe(null);
      expect(result.current.success).toBe(null);
    });

    it('should accept custom options', () => {
      const { result } = renderHook(() => 
        useEmailResend({ 
          cooldownDuration: 120, 
          maxResends: 3 
        })
      );

      expect(result.current.canResend).toBe(true);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should successfully resend verification email', async () => {
      mockAuthAPI.resendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Verification email sent successfully',
        otpId: 'otp-123'
      });

      const { result } = renderHook(() => useEmailResend());

      await act(async () => {
        const response = await result.current.resendVerificationEmail('test@example.com', 'John Doe');
        expect(response.success).toBe(true);
      });

      expect(mockAuthAPI.resendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'John Doe');
      expect(result.current.success).toBe('Verification email sent successfully');
      expect(result.current.resendCount).toBe(1);
      expect(result.current.canResend).toBe(false);
      expect(result.current.cooldownSeconds).toBe(60);
    });

    it('should handle resend failure', async () => {
      mockAuthAPI.resendVerificationEmail.mockResolvedValue({
        success: false,
        message: '',
        error: 'Rate limit exceeded'
      });

      const { result } = renderHook(() => useEmailResend());

      await act(async () => {
        const response = await result.current.resendVerificationEmail('test@example.com');
        expect(response.success).toBe(false);
      });

      expect(result.current.error).toBe('Rate limit exceeded');
      expect(result.current.success).toBe(null);
      expect(result.current.resendCount).toBe(1);
    });

    it('should prevent resend when already resending', async () => {
      mockAuthAPI.resendVerificationEmail.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Sent' }), 1000))
      );

      const { result } = renderHook(() => useEmailResend());

      // Start first resend
      act(() => {
        result.current.resendVerificationEmail('test@example.com');
      });

      expect(result.current.isResending).toBe(true);

      // Try to resend again while first is in progress
      await act(async () => {
        const response = await result.current.resendVerificationEmail('test@example.com');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Cannot resend at this time');
      });
    });

    it('should prevent resend when in cooldown', async () => {
      const { result } = renderHook(() => useEmailResend());

      // Simulate successful resend to trigger cooldown
      mockAuthAPI.resendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Sent',
      });

      await act(async () => {
        await result.current.resendVerificationEmail('test@example.com');
      });

      expect(result.current.canResend).toBe(false);

      // Try to resend during cooldown
      await act(async () => {
        const response = await result.current.resendVerificationEmail('test@example.com');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Cannot resend at this time');
      });
    });

    it('should handle network errors', async () => {
      mockAuthAPI.resendVerificationEmail.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEmailResend());

      await act(async () => {
        const response = await result.current.resendVerificationEmail('test@example.com');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Network error');
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isResending).toBe(false);
    });
  });

  describe('resendOTPEmail', () => {
    it('should successfully resend OTP email', async () => {
      mockAuthAPI.resendOTPEmail.mockResolvedValue({
        success: true,
        message: 'OTP email sent successfully',
        otpId: 'otp-456'
      });

      const { result } = renderHook(() => useEmailResend());

      await act(async () => {
        const response = await result.current.resendOTPEmail('test@example.com', 'login', 'Jane Doe');
        expect(response.success).toBe(true);
      });

      expect(mockAuthAPI.resendOTPEmail).toHaveBeenCalledWith('test@example.com', 'login', 'Jane Doe');
      expect(result.current.success).toBe('OTP email sent successfully');
      expect(result.current.resendCount).toBe(1);
    });

    it('should handle OTP resend failure', async () => {
      mockAuthAPI.resendOTPEmail.mockResolvedValue({
        success: false,
        message: '',
        error: 'User not found'
      });

      const { result } = renderHook(() => useEmailResend());

      await act(async () => {
        const response = await result.current.resendOTPEmail('test@example.com', 'login');
        expect(response.success).toBe(false);
      });

      expect(result.current.error).toBe('User not found');
    });
  });

  describe('Cooldown Timer', () => {
    it('should countdown and enable resend after cooldown', async () => {
      const { result } = renderHook(() => useEmailResend({ cooldownDuration: 3 }));

      mockAuthAPI.resendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Sent'
      });

      // Trigger cooldown
      await act(async () => {
        await result.current.resendVerificationEmail('test@example.com');
      });

      expect(result.current.cooldownSeconds).toBe(3);
      expect(result.current.canResend).toBe(false);

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.cooldownSeconds).toBe(2);
      expect(result.current.canResend).toBe(false);

      // Advance timer by 2 more seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.cooldownSeconds).toBe(0);
      expect(result.current.canResend).toBe(true);
    });

    it('should respect max resends limit', async () => {
      const { result } = renderHook(() => useEmailResend({ maxResends: 2, cooldownDuration: 1 }));

      mockAuthAPI.resendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Sent'
      });

      // First resend
      await act(async () => {
        await result.current.resendVerificationEmail('test@example.com');
      });

      // Wait for cooldown
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Second resend
      await act(async () => {
        await result.current.resendVerificationEmail('test@example.com');
      });

      expect(result.current.resendCount).toBe(2);

      // Wait for cooldown
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not be able to resend (max reached)
      expect(result.current.canResend).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should provide correct remaining cooldown', async () => {
      const { result } = renderHook(() => useEmailResend({ cooldownDuration: 5 }));

      mockAuthAPI.resendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Sent'
      });

      await act(async () => {
        await result.current.resendVerificationEmail('test@example.com');
      });

      expect(result.current.getRemainingCooldown()).toBe(5);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.getRemainingCooldown()).toBe(3);
    });

    it('should provide correct button text', async () => {
      const { result } = renderHook(() => useEmailResend({ cooldownDuration: 3, maxResends: 2 }));

      // Initial state
      expect(result.current.getResendButtonText()).toBe('Resend Email');

      mockAuthAPI.resendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Sent'
      });

      // During resend
      act(() => {
        result.current.resendVerificationEmail('test@example.com');
      });
      expect(result.current.getResendButtonText()).toBe('Sending...');

      // After resend (cooldown)
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.getResendButtonText()).toBe('Resend in 3s');

      // After cooldown
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(result.current.getResendButtonText()).toBe('Resend Email');

      // After max resends
      await act(async () => {
        await result.current.resendVerificationEmail('test@example.com');
      });
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      await act(async () => {
        await result.current.resendVerificationEmail('test@example.com');
      });

      expect(result.current.getResendButtonText()).toBe('Max resends reached');
    });

    it('should reset state correctly', () => {
      const { result } = renderHook(() => useEmailResend());

      // Modify state
      act(() => {
        result.current.resendVerificationEmail('test@example.com');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isResending).toBe(false);
      expect(result.current.canResend).toBe(true);
      expect(result.current.cooldownSeconds).toBe(0);
      expect(result.current.resendCount).toBe(0);
      expect(result.current.error).toBe(null);
      expect(result.current.success).toBe(null);
    });

    it('should clear messages correctly', async () => {
      const { result } = renderHook(() => useEmailResend());

      mockAuthAPI.resendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Success message'
      });

      await act(async () => {
        await result.current.resendVerificationEmail('test@example.com');
      });

      expect(result.current.success).toBe('Success message');

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.success).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });
});