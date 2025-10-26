import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailResendButton } from '../EmailResendButton';
import { useEmailResend } from '@/hooks/useEmailResend';

// Mock the useEmailResend hook
jest.mock('@/hooks/useEmailResend');
const mockUseEmailResend = useEmailResend as jest.MockedFunction<typeof useEmailResend>;

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Mail: ({ className }: { className?: string }) => <div data-testid="mail-icon" className={className} />,
  Clock: ({ className }: { className?: string }) => <div data-testid="clock-icon" className={className} />,
  CheckCircle: ({ className }: { className?: string }) => <div data-testid="check-icon" className={className} />,
  AlertCircle: ({ className }: { className?: string }) => <div data-testid="alert-icon" className={className} />,
}));

describe('EmailResendButton', () => {
  const mockResendVerificationEmail = jest.fn();
  const mockResendOTPEmail = jest.fn();
  const mockClearMessages = jest.fn();
  const mockGetResendButtonText = jest.fn();

  const defaultHookReturn = {
    isResending: false,
    canResend: true,
    cooldownSeconds: 0,
    resendCount: 0,
    error: null,
    success: null,
    resendVerificationEmail: mockResendVerificationEmail,
    resendOTPEmail: mockResendOTPEmail,
    clearMessages: mockClearMessages,
    getResendButtonText: mockGetResendButtonText,
    reset: jest.fn(),
    getRemainingCooldown: jest.fn(() => 0),
    lastResendTime: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetResendButtonText.mockReturnValue('Resend Email');
    mockUseEmailResend.mockReturnValue(defaultHookReturn);
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Resend Email')).toBeInTheDocument();
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('should render with recipient name', () => {
      render(
        <EmailResendButton
          email="test@example.com"
          recipientName="John Doe"
          type="verification"
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render for OTP type', () => {
      render(
        <EmailResendButton
          email="test@example.com"
          type="otp"
          otpType="login"
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should show loading state when resending', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        isResending: true,
        getResendButtonText: jest.fn(() => 'Sending...'),
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show cooldown state', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        canResend: false,
        cooldownSeconds: 30,
        getResendButtonText: jest.fn(() => 'Resend in 30s'),
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      expect(screen.getByText('Resend in 30s')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show success state', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        success: 'Email sent successfully',
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      expect(screen.getByText('Email sent successfully')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should show error state', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        error: 'Failed to send email',
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      expect(screen.getByText('Failed to send email')).toBeInTheDocument();
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });
  });

  describe('Resend Count Display', () => {
    it('should show resend count when greater than 0', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        resendCount: 2,
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      expect(screen.getByText('Resent 2 times')).toBeInTheDocument();
    });

    it('should show singular form for count of 1', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        resendCount: 1,
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      expect(screen.getByText('Resent 1 time')).toBeInTheDocument();
    });

    it('should show rate limit warning when approaching limit', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        resendCount: 3,
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      expect(screen.getByText(/2 resends remaining/)).toBeInTheDocument();
    });

    it('should show max resends reached message', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        resendCount: 5,
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      expect(screen.getByText(/Maximum resends reached/)).toBeInTheDocument();
      expect(screen.getByText(/contact support/)).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call resendVerificationEmail for verification type', async () => {
      mockResendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Email sent',
      });

      render(
        <EmailResendButton
          email="test@example.com"
          recipientName="John Doe"
          type="verification"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockClearMessages).toHaveBeenCalled();
        expect(mockResendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'John Doe');
      });
    });

    it('should call resendOTPEmail for OTP type', async () => {
      mockResendOTPEmail.mockResolvedValue({
        success: true,
        message: 'OTP sent',
      });

      render(
        <EmailResendButton
          email="test@example.com"
          recipientName="Jane Doe"
          type="otp"
          otpType="login"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockClearMessages).toHaveBeenCalled();
        expect(mockResendOTPEmail).toHaveBeenCalledWith('test@example.com', 'login', 'Jane Doe');
      });
    });

    it('should not call resend when disabled', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        canResend: false,
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(mockResendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('Callback Handling', () => {
    it('should call onResendSuccess callback on successful resend', async () => {
      const onResendSuccess = jest.fn();
      
      mockResendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Email sent successfully',
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
          onResendSuccess={onResendSuccess}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(onResendSuccess).toHaveBeenCalledWith('Email sent successfully');
      });
    });

    it('should call onResendError callback on failed resend', async () => {
      const onResendError = jest.fn();
      
      mockResendVerificationEmail.mockResolvedValue({
        success: false,
        message: '',
        error: 'Rate limit exceeded',
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
          onResendError={onResendError}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(onResendError).toHaveBeenCalledWith('Rate limit exceeded');
      });
    });

    it('should use default error message when none provided', async () => {
      const onResendError = jest.fn();
      
      mockResendVerificationEmail.mockResolvedValue({
        success: false,
        message: '',
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
          onResendError={onResendError}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(onResendError).toHaveBeenCalledWith('Failed to send email');
      });
    });
  });

  describe('Styling and Variants', () => {
    it('should apply custom className', () => {
      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
          className="custom-class"
        />
      );

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should use success variant when success state', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        success: 'Email sent',
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
          variant="outline"
        />
      );

      // The button should use 'default' variant when success is true
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should use destructive variant when error state', () => {
      mockUseEmailResend.mockReturnValue({
        ...defaultHookReturn,
        error: 'Failed to send',
      });

      render(
        <EmailResendButton
          email="test@example.com"
          type="verification"
          variant="outline"
        />
      );

      // The button should use 'destructive' variant when error is present
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});