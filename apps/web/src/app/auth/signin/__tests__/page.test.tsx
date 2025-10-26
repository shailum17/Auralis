import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import SignInPage from '../page';
import { useAuth } from '@/contexts/AuthContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock UI components
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, loading, disabled, onClick, type, ...props }: any) => (
    <button 
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      data-testid="button"
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

jest.mock('@/components/ui/Input', () => ({
  Input: ({ label, value, onChange, error, type, required, ...props }: any) => (
    <div>
      <label>{label}{required && ' *'}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        data-testid={`input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && <div role="alert">{error}</div>}
    </div>
  ),
}));

jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2 data-testid="card-title">{children}</h2>,
  CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
}));

describe('SignInPage', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });

    // Mock window.location.search
    delete (window as any).location;
    (window as any).location = {
      search: '',
    };
  });

  describe('Rendering', () => {
    it('should render signin form with all required fields', () => {
      render(<SignInPage />);
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<SignInPage />);
      
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
    });

    it('should render signup link', () => {
      render(<SignInPage />);
      
      const signupLink = screen.getByRole('link', { name: /sign up/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/auth/signup');
    });

    it('should show session duration options when remember me is checked', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);
      
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      await user.click(rememberMeCheckbox);
      
      await waitFor(() => {
        expect(screen.getByText(/keep me signed in for/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('should hide session duration options when remember me is unchecked', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);
      
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      
      // Check and then uncheck
      await user.click(rememberMeCheckbox);
      await waitFor(() => {
        expect(screen.getByText(/keep me signed in for/i)).toBeInTheDocument();
      });
      
      await user.click(rememberMeCheckbox);
      await waitFor(() => {
        expect(screen.queryByText(/keep me signed in for/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty identifier', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      await user.type(identifierInput, 'test@example.com');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);
      
      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
      });
      
      // Start typing to clear error
      const identifierInput = screen.getByTestId('input-email-or-username');
      await user.type(identifierInput, 'test');
      
      await waitFor(() => {
        expect(screen.queryByText(/email or username is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication Flow', () => {
    it('should call login with email credentials', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      const passwordInput = screen.getByTestId('input-password');
      
      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          identifier: 'test@example.com',
          password: 'password123',
          rememberMe: false,
          sessionDuration: 24,
        });
      });
    });

    it('should call login with username credentials', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      const passwordInput = screen.getByTestId('input-password');
      
      await user.type(identifierInput, 'testuser');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          identifier: 'testuser',
          password: 'password123',
          rememberMe: false,
          sessionDuration: 24,
        });
      });
    });

    it('should include remember me and session duration in login call', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      const passwordInput = screen.getByTestId('input-password');
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      
      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(rememberMeCheckbox);
      
      // Wait for session duration options to appear
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
      
      const sessionSelect = screen.getByRole('combobox');
      await user.selectOptions(sessionSelect, '168'); // 1 week
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          identifier: 'test@example.com',
          password: 'password123',
          rememberMe: true,
          sessionDuration: 168,
        });
      });
    });

    it('should redirect to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      const passwordInput = screen.getByTestId('input-password');
      
      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should redirect to email verification when required', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ 
        success: true, 
        requiresVerification: true 
      });
      
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      const passwordInput = screen.getByTestId('input-password');
      
      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/verify-email?email=test%40example.com');
      });
    });

    it('should redirect to intended page from URL params', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      // Mock URL search params
      delete (window as any).location;
      (window as any).location = {
        search: '?redirect=/profile',
      };
      
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      const passwordInput = screen.getByTestId('input-password');
      
      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display authentication error from context', () => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Invalid credentials',
        clearError: mockClearError,
      });
      
      render(<SignInPage />);
      
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Invalid credentials',
        clearError: mockClearError,
      });
      
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      await user.type(identifierInput, 'test');
      
      expect(mockClearError).toHaveBeenCalled();
    });

    it('should handle login failure', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ 
        success: false, 
        error: 'Invalid credentials' 
      });
      
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      const passwordInput = screen.getByTestId('input-password');
      
      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        // Error should be handled by the AuthContext
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during authentication', () => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
        clearError: mockClearError,
      });
      
      render(<SignInPage />);
      
      const submitButton = screen.getByRole('button', { name: /loading/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable form fields during loading', () => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
        clearError: mockClearError,
      });
      
      render(<SignInPage />);
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      const passwordInput = screen.getByTestId('input-password');
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      
      expect(identifierInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(rememberMeCheckbox).toBeDisabled();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);
      
      const passwordInput = screen.getByTestId('input-password');
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Find the toggle button (eye icon)
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
      await user.click(toggleButton);
      
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Session Duration Options', () => {
    it('should have all session duration options', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);
      
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      await user.click(rememberMeCheckbox);
      
      await waitFor(() => {
        const sessionSelect = screen.getByRole('combobox');
        expect(sessionSelect).toBeInTheDocument();
        
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(6);
        expect(options[0]).toHaveTextContent('1 hour');
        expect(options[1]).toHaveTextContent('4 hours');
        expect(options[2]).toHaveTextContent('8 hours');
        expect(options[3]).toHaveTextContent('1 day');
        expect(options[4]).toHaveTextContent('1 week');
        expect(options[5]).toHaveTextContent('30 days');
      });
    });

    it('should update session duration when option is selected', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      render(<SignInPage />);
      
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      await user.click(rememberMeCheckbox);
      
      await waitFor(() => {
        const sessionSelect = screen.getByRole('combobox');
        expect(sessionSelect).toBeInTheDocument();
      });
      
      const sessionSelect = screen.getByRole('combobox');
      await user.selectOptions(sessionSelect, '720'); // 30 days
      
      const identifierInput = screen.getByTestId('input-email-or-username');
      const passwordInput = screen.getByTestId('input-password');
      
      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          identifier: 'test@example.com',
          password: 'password123',
          rememberMe: true,
          sessionDuration: 720,
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      render(<SignInPage />);
      
      const identifierInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(identifierInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});