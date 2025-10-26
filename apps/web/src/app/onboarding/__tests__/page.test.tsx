import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OnboardingPage from '../page';
import { userAPI } from '@/lib/user-api';

// Mock the user API
jest.mock('@/lib/user-api', () => ({
  userAPI: {
    completeOnboarding: jest.fn(),
  },
}));

// Mock the auth context
const mockUpdateUser = jest.fn();
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  fullName: '',
  bio: '',
  interests: [],
  academicInfo: null,
  privacySettings: {
    allowDirectMessages: true,
    showOnlineStatus: true,
    allowProfileViewing: true,
    dataCollection: true,
  },
  wellnessSettings: {
    trackMood: false,
    trackStress: false,
    shareWellnessData: false,
    crisisAlertsEnabled: true,
    allowWellnessInsights: false,
  },
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Get the mocked function
const mockUseAuth = jest.mocked(require('@/contexts/AuthContext').useAuth);

describe('OnboardingPage', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set default mock return value
    mockUseAuth.mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
    });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the onboarding page with step indicator', () => {
    render(<OnboardingPage />);

    expect(screen.getByText('Welcome to Auralis!')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    expect(screen.getAllByText('Personal Info')[0]).toBeInTheDocument();
  });

  it('shows personal info step initially', () => {
    render(<OnboardingPage />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('navigates to next step when Next button is clicked', async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    // Fill required field
    const fullNameInput = screen.getByLabelText(/full name/i);
    await user.type(fullNameInput, 'John Doe');

    // Click next
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Should show academic info step
    expect(screen.getByText('Academic Background')).toBeInTheDocument();
  });

  it('prevents navigation without required fields', async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    // Try to click next without filling required field
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Should show validation error
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    // Should still be on personal info step
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('allows going back to previous step', async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    // Fill required field and go to next step
    const fullNameInput = screen.getByLabelText(/full name/i);
    await user.type(fullNameInput, 'John Doe');
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Now go back
    const prevButton = screen.getByText('Previous');
    await user.click(prevButton);

    // Should be back on personal info step
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('shows skip button for optional steps', async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    // Navigate to academic info step (optional)
    const fullNameInput = screen.getByLabelText(/full name/i);
    await user.type(fullNameInput, 'John Doe');
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Should show skip button
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('completes onboarding and calls API', async () => {
    const user = userEvent.setup();
    const mockApiResponse = {
      success: true,
      data: { user: { ...mockUser, fullName: 'John Doe' } },
    };
    (userAPI.completeOnboarding as jest.Mock).mockResolvedValue(mockApiResponse);

    render(<OnboardingPage />);

    // Navigate through all steps
    // Step 1: Personal Info
    const fullNameInput = screen.getByLabelText(/full name/i);
    await user.type(fullNameInput, 'John Doe');
    await user.click(screen.getByText('Next'));

    // Step 2: Academic Info (skip)
    await user.click(screen.getByText('Skip'));

    // Step 3: Interests (skip)
    await user.click(screen.getByText('Skip'));

    // Step 4: Privacy Settings (required)
    await user.click(screen.getByText('Next'));

    // Step 5: Wellness Settings
    const completeButton = screen.getByText('Complete Setup');
    await user.click(completeButton);

    // Should call API and redirect
    await waitFor(() => {
      expect(userAPI.completeOnboarding).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    const mockApiResponse = {
      success: false,
      error: 'Network error',
    };
    (userAPI.completeOnboarding as jest.Mock).mockResolvedValue(mockApiResponse);

    render(<OnboardingPage />);

    // Navigate to final step and complete
    const fullNameInput = screen.getByLabelText(/full name/i);
    await user.type(fullNameInput, 'John Doe');
    
    // Navigate through steps quickly
    for (let i = 0; i < 4; i++) {
      const nextOrSkipButton = screen.getAllByText(/Next|Skip/)[0];
      await user.click(nextOrSkipButton);
    }

    const completeButton = screen.getByText('Complete Setup');
    await user.click(completeButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('skips onboarding for users with comprehensive data', () => {
    const comprehensiveUser = {
      ...mockUser,
      fullName: 'John Doe',
      academicInfo: { institution: 'Test University' },
      interests: ['Academic Success'],
    };

    mockUseAuth.mockReturnValue({
      user: comprehensiveUser,
      updateUser: mockUpdateUser,
    });

    render(<OnboardingPage />);

    expect(screen.getByText('Welcome Back! 🎉')).toBeInTheDocument();
    expect(screen.getByText(/already completed your profile setup/)).toBeInTheDocument();
  });
});