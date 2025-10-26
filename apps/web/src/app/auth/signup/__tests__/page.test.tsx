import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the validation service
jest.mock('@/lib/auth-validation', () => ({
  authValidationService: {
    validateEmail: jest.fn(),
    validateUsername: jest.fn(),
    validatePassword: jest.fn(),
    validatePasswordConfirmation: jest.fn(),
    validateFullName: jest.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default validation mocks
    const { authValidationService } = require('@/lib/auth-validation');
    authValidationService.validateEmail.mockResolvedValue({ isValid: true, errors: [], warnings: [], fieldErrors: {} });
    authValidationService.validateUsername.mockResolvedValue({ isValid: true, errors: [], warnings: [], fieldErrors: {} });
    authValidationService.validatePassword.mockReturnValue({ isValid: true, errors: [], warnings: [], fieldErrors: {} });
    authValidationService.validatePasswordConfirmation.mockReturnValue({ isValid: true, errors: [], warnings: [], fieldErrors: {} });
    authValidationService.validateFullName.mockReturnValue({ isValid: true, errors: [], warnings: [], fieldErrors: {} });
  });

  it('should render the first step (account creation)', () => {
    render(<SignUpPage />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should show progress indicator', () => {
    render(<SignUpPage />);
    
    // Should show step numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should disable Next button when fields are empty', () => {
    render(<SignUpPage />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should enable Next button when step 1 fields are valid', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const usernameInput = screen.getByLabelText(/username/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.tab(); // Trigger blur event
    
    await user.type(usernameInput, 'testuser');
    await user.tab(); // Trigger blur event
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeEnabled();
    });
  });

  it('should navigate to step 2 when Next is clicked', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    
    // Fill step 1 fields
    const emailInput = screen.getByLabelText(/email address/i);
    const usernameInput = screen.getByLabelText(/username/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.tab();
    await user.type(usernameInput, 'testuser');
    await user.tab();
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeEnabled();
    });
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Secure Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });
  });

  it('should show password strength indicator', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    
    // Navigate to step 2
    await navigateToStep2(user);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, 'StrongPass123!');
    
    await waitFor(() => {
      expect(screen.getByText(/password strength/i)).toBeInTheDocument();
    });
  });

  it('should show password visibility toggle', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    
    // Navigate to step 2
    await navigateToStep2(user);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg') // Looking for the eye icon
    );
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    if (toggleButton) {
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  it('should navigate to step 3 (personal info)', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    
    // Navigate through steps
    await navigateToStep2(user);
    await fillPasswordFields(user);
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByText(/bio.*optional/i)).toBeInTheDocument();
    });
  });

  it('should navigate to step 4 (terms)', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    
    // Navigate through steps
    await navigateToStep2(user);
    await fillPasswordFields(user);
    await navigateToStep3(user);
    await fillPersonalInfo(user);
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
      expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
      expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();
    
    // Mock successful registration
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        verificationEmail: 'test@example.com',
        developmentOTP: '123456',
      }),
    });
    
    render(<SignUpPage />);
    
    // Fill all steps
    await navigateToStep2(user);
    await fillPasswordFields(user);
    await navigateToStep3(user);
    await fillPersonalInfo(user);
    await navigateToStep4(user);
    
    // Accept terms
    const termsCheckbox = screen.getByRole('checkbox');
    await user.click(termsCheckbox);
    
    // Submit form
    const submitButton = screen.getByText('Create Account');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('test@example.com'),
      });
    });
  });

  it('should handle registration errors', async () => {
    const user = userEvent.setup();
    
    // Mock registration error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists',
      }),
    });
    
    render(<SignUpPage />);
    
    // Fill all steps and submit
    await navigateToStep2(user);
    await fillPasswordFields(user);
    await navigateToStep3(user);
    await fillPersonalInfo(user);
    await navigateToStep4(user);
    
    const termsCheckbox = screen.getByRole('checkbox');
    await user.click(termsCheckbox);
    
    const submitButton = screen.getByText('Create Account');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/an account with this email address already exists/i)).toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();
    
    // Mock network error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<SignUpPage />);
    
    // Fill all steps and submit
    await navigateToStep2(user);
    await fillPasswordFields(user);
    await navigateToStep3(user);
    await fillPersonalInfo(user);
    await navigateToStep4(user);
    
    const termsCheckbox = screen.getByRole('checkbox');
    await user.click(termsCheckbox);
    
    const submitButton = screen.getByText('Create Account');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();
    
    // Mock validation error
    const { authValidationService } = require('@/lib/auth-validation');
    authValidationService.validateEmail.mockResolvedValue({
      isValid: false,
      errors: ['Please enter a valid email address'],
      warnings: [],
      fieldErrors: { email: 'Please enter a valid email address' },
    });
    
    render(<SignUpPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should allow navigation back to previous steps', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    
    // Navigate to step 2
    await navigateToStep2(user);
    
    // Go back to step 1
    const previousButton = screen.getByText('Previous');
    await user.click(previousButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });
  });

  // Helper functions
  async function navigateToStep2(user: any) {
    const emailInput = screen.getByLabelText(/email address/i);
    const usernameInput = screen.getByLabelText(/username/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.tab();
    await user.type(usernameInput, 'testuser');
    await user.tab();
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeEnabled();
    });
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Secure Password')).toBeInTheDocument();
    });
  }

  async function fillPasswordFields(user: any) {
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    await user.type(passwordInput, 'StrongPass123!');
    await user.tab();
    await user.type(confirmPasswordInput, 'StrongPass123!');
    await user.tab();
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeEnabled();
    });
  }

  async function navigateToStep3(user: any) {
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
    });
  }

  async function fillPersonalInfo(user: any) {
    const fullNameInput = screen.getByLabelText(/full name/i);
    
    await user.type(fullNameInput, 'John Doe');
    await user.tab();
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeEnabled();
    });
  }

  async function navigateToStep4(user: any) {
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    });
  }
});