import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerifyEmailPage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    
    // Setup default sessionStorage mock
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'verificationEmail') return 'test@example.com';
      if (key === 'developmentOTP') return '123456';
      return null;
    });
  });

  it('should render email verification form', () => {
    render(<VerifyEmailPage />);
    
    expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
    expect(screen.getByText(/we've sent a 6-digit verification code to/i)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Enter verification code')).toBeInTheDocument();
    expect(screen.getByText('Verify Email')).toBeInTheDocument();
  });

  it('should show development OTP in development mode', () => {
    // Mock development environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(<VerifyEmailPage />);
    
    expect(screen.getByText('Development Mode')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
    
    // Restore environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should redirect to signup if no email in session', () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    
    render(<VerifyEmailPage />);
    
    expect(mockPush).toHaveBeenCalledWith('/auth/signup');
  });

  it('should render OTP input with 6 digits', () => {
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    expect(otpInputs).toHaveLength(6);
    
    otpInputs.forEach(input => {
      expect(input).toHaveAttribute('maxLength', '1');
      expect(input).toHaveAttribute('inputMode', 'numeric');
    });
  });

  it('should handle OTP input and auto-focus next field', async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Type in first input
    await user.type(otpInputs[0], '1');
    
    // Should auto-focus next input
    expect(otpInputs[1]).toHaveFocus();
  });

  it('should handle backspace navigation', async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Type in first two inputs
    await user.type(otpInputs[0], '1');
    await user.type(otpInputs[1], '2');
    
    // Clear second input and press backspace
    await user.clear(otpInputs[1]);
    await user.keyboard('{Backspace}');
    
    // Should focus previous input
    expect(otpInputs[0]).toHaveFocus();
  });

  it('should handle paste functionality', async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Focus first input and paste
    otpInputs[0].focus();
    await user.paste('123456');
    
    // Should fill all inputs
    expect(otpInputs[0]).toHaveValue('1');
    expect(otpInputs[1]).toHaveValue('2');
    expect(otpInputs[2]).toHaveValue('3');
    expect(otpInputs[3]).toHaveValue('4');
    expect(otpInputs[4]).toHaveValue('5');
    expect(otpInputs[5]).toHaveValue('6');
  });

  it('should only allow numeric input', async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Try to type non-numeric characters
    await user.type(otpInputs[0], 'abc123!@#');
    
    // Should only contain numeric characters
    expect(otpInputs[0]).toHaveValue('1');
  });

  it('should auto-submit when OTP is complete', async () => {
    const user = userEvent.setup();
    
    // Mock successful verification
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'token123',
        refreshToken: 'refresh123',
      }),
    });
    
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Fill all OTP inputs
    await user.type(otpInputs[0], '1');
    await user.type(otpInputs[1], '2');
    await user.type(otpInputs[2], '3');
    await user.type(otpInputs[3], '4');
    await user.type(otpInputs[4], '5');
    await user.type(otpInputs[5], '6');
    
    // Should auto-submit
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          otp: '123456',
        }),
      });
    });
  });

  it('should handle manual verification', async () => {
    const user = userEvent.setup();
    
    // Mock successful verification
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'token123',
        refreshToken: 'refresh123',
      }),
    });
    
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Fill OTP inputs manually
    await user.type(otpInputs[0], '1');
    await user.type(otpInputs[1], '2');
    await user.type(otpInputs[2], '3');
    await user.type(otpInputs[3], '4');
    await user.type(otpInputs[4], '5');
    
    // Click verify button
    const verifyButton = screen.getByText('Verify Email');
    expect(verifyButton).toBeDisabled(); // Should be disabled with incomplete OTP
    
    await user.type(otpInputs[5], '6');
    
    await waitFor(() => {
      expect(verifyButton).toBeEnabled();
    });
    
    await user.click(verifyButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          otp: '123456',
        }),
      });
    });
  });

  it('should handle successful verification and redirect', async () => {
    const user = userEvent.setup();
    
    // Mock successful verification
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'token123',
        refreshToken: 'refresh123',
      }),
    });
    
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Fill complete OTP
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], (i + 1).toString());
    }
    
    // Wait for verification success
    await waitFor(() => {
      expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    });
    
    // Should store tokens
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', 'token123');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh123');
    
    // Should clear session storage
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('verificationEmail');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('developmentOTP');
    
    // Should redirect after delay
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    }, { timeout: 3000 });
  });

  it('should handle verification errors', async () => {
    const user = userEvent.setup();
    
    // Mock verification error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Invalid or expired verification code',
        details: [{ field: 'otp', message: 'Invalid or expired verification code' }],
      }),
    });
    
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Fill complete OTP
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], (i + 1).toString());
    }
    
    await waitFor(() => {
      expect(screen.getByText('Invalid or expired verification code')).toBeInTheDocument();
    });
  });

  it('should handle resend OTP functionality', async () => {
    const user = userEvent.setup();
    
    // Mock successful resend
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Verification code sent successfully!',
        developmentOTP: '654321',
      }),
    });
    
    render(<VerifyEmailPage />);
    
    const resendButton = screen.getByText('Resend Code');
    await user.click(resendButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Verification code sent successfully!')).toBeInTheDocument();
    });
  });

  it('should handle resend rate limiting', async () => {
    const user = userEvent.setup();
    
    // Mock rate limit error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Please wait before requesting another code',
        details: [{ field: 'resend', message: 'Please wait 60 seconds before requesting another code.' }],
      }),
    });
    
    render(<VerifyEmailPage />);
    
    const resendButton = screen.getByText('Resend Code');
    await user.click(resendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please wait.*seconds/i)).toBeInTheDocument();
    });
  });

  it('should show cooldown timer after resend', async () => {
    const user = userEvent.setup();
    
    // Mock successful resend
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Verification code sent successfully!',
      }),
    });
    
    render(<VerifyEmailPage />);
    
    const resendButton = screen.getByText('Resend Code');
    await user.click(resendButton);
    
    // Should show cooldown
    await waitFor(() => {
      expect(screen.getByText(/resend in \d+s/i)).toBeInTheDocument();
    });
    
    // Button should be disabled during cooldown
    const disabledButton = screen.getByText(/resend in \d+s/i);
    expect(disabledButton).toBeDisabled();
  });

  it('should track resend attempts', async () => {
    const user = userEvent.setup();
    
    // Mock successful resends
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Verification code sent successfully!',
      }),
    });
    
    render(<VerifyEmailPage />);
    
    // Make multiple resend attempts (need to wait for cooldown)
    const resendButton = screen.getByText('Resend Code');
    await user.click(resendButton);
    
    await waitFor(() => {
      expect(screen.getByText('1/3 attempts used')).toBeInTheDocument();
    });
  });

  it('should disable resend after max attempts', async () => {
    const user = userEvent.setup();
    
    render(<VerifyEmailPage />);
    
    // Simulate reaching max attempts by setting state
    // This would require exposing state or using a different approach
    // For now, we'll test the UI behavior when max attempts is reached
    
    // Mock the component with max attempts reached
    const resendButton = screen.getByText('Resend Code');
    
    // After 3 attempts, button should show "Too many attempts"
    // This test would need to be implemented with proper state management
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();
    
    // Mock network error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Fill complete OTP
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], (i + 1).toString());
    }
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('should validate OTP length', async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    const verifyButton = screen.getByText('Verify Email');
    
    // Fill incomplete OTP
    await user.type(otpInputs[0], '1');
    await user.type(otpInputs[1], '2');
    await user.type(otpInputs[2], '3');
    
    // Try to click verify button
    await user.click(verifyButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter the complete 6-digit verification code.')).toBeInTheDocument();
    });
  });

  it('should clear errors when user types', async () => {
    const user = userEvent.setup();
    
    // Mock verification error first
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Invalid verification code',
        details: [{ field: 'otp', message: 'Invalid verification code' }],
      }),
    });
    
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Fill complete OTP to trigger error
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], (i + 1).toString());
    }
    
    await waitFor(() => {
      expect(screen.getByText('Invalid verification code')).toBeInTheDocument();
    });
    
    // Clear and type new digit - should clear errors
    await user.clear(otpInputs[0]);
    await user.type(otpInputs[0], '9');
    
    await waitFor(() => {
      expect(screen.queryByText('Invalid verification code')).not.toBeInTheDocument();
    });
  });

  it('should show loading state during verification', async () => {
    const user = userEvent.setup();
    
    // Mock delayed response
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        }), 1000)
      )
    );
    
    render(<VerifyEmailPage />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Fill complete OTP
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], (i + 1).toString());
    }
    
    // Should show loading state
    expect(screen.getByText('Verifying your email address...')).toBeInTheDocument();
  });

  it('should navigate back to signup', async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);
    
    const backLink = screen.getByText('Back to Sign Up');
    await user.click(backLink);
    
    // Should navigate to signup page
    // Note: This would be handled by Next.js Link component
    expect(backLink).toHaveAttribute('href', '/auth/signup');
  });
});