'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';
import { OTPVerification } from './OTPVerification';
import { SecurityNotifications, useSecurityNotifications } from './SecurityNotifications';
import { DevelopmentOtpNotice } from './DevelopmentOtpNotice';
import { ValidationRule } from '@/components/ui/types';

interface EnhancedRegistrationFormProps {
  onSuccess: (user: any, tokens: { accessToken: string; refreshToken: string }) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: string[];
}

interface RegistrationFormState {
  currentStep: number;
  formData: {
    // Step 1: Basic Info
    fullName: string;
    email: string;
    username: string;
    
    // Step 2: Security
    password: string;
    confirmPassword: string;
    
    // Step 3: Personal Details (Optional)
    dateOfBirth: string;
    gender: string;
    bio: string;
    
    // Step 4: Academic Info (Optional)
    institution: string;
    major: string;
    year: string;
    
    // Step 5: Interests (Optional)
    interests: string[];
    
    // Step 6: Agreements
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    acceptMarketing: boolean;
  };
  otp: string[];
  loading: boolean;
  errors: Record<string, string>;
  completedSteps: Set<number>;
  developmentOtp: string | null;
}

const registrationSteps: RegistrationStep[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Tell us about yourself',
    icon: '👤',
    fields: ['fullName', 'email', 'username']
  },
  {
    id: 'security',
    title: 'Account Security',
    description: 'Create a secure password',
    icon: '🔒',
    fields: ['password', 'confirmPassword']
  },
  {
    id: 'personal',
    title: 'Personal Details',
    description: 'Optional information about you',
    icon: '📝',
    fields: ['dateOfBirth', 'gender', 'bio']
  },
  {
    id: 'academic',
    title: 'Academic Background',
    description: 'Your educational information',
    icon: '🎓',
    fields: ['institution', 'major', 'year']
  },
  {
    id: 'interests',
    title: 'Your Interests',
    description: 'What are you passionate about?',
    icon: '❤️',
    fields: ['interests']
  },
  {
    id: 'agreements',
    title: 'Terms & Privacy',
    description: 'Review and accept our policies',
    icon: '📋',
    fields: ['acceptTerms', 'acceptPrivacy', 'acceptMarketing']
  }
];

const interestOptions = [
  'Mental Health', 'Academic Success', 'Social Connection', 'Career Development',
  'Physical Wellness', 'Creative Arts', 'Technology', 'Sports & Fitness',
  'Music', 'Reading', 'Travel', 'Volunteering', 'Leadership', 'Research',
  'Entrepreneurship', 'Gaming', 'Photography', 'Cooking', 'Fashion', 'Environment'
];

export function EnhancedRegistrationForm({ onSuccess, onError, loading: externalLoading = false }: EnhancedRegistrationFormProps) {
  const [state, setState] = useState<RegistrationFormState>({
    currentStep: 0,
    formData: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      bio: '',
      institution: '',
      major: '',
      year: '',
      interests: [],
      acceptTerms: false,
      acceptPrivacy: false,
      acceptMarketing: false,
    },
    otp: Array(6).fill(''),
    loading: false,
    errors: {},
    completedSteps: new Set(),
    developmentOtp: null
  });

  const {
    notifications,
    removeNotification,
    showLoginSuccess,
    showOtpSent,
    showLoginError
  } = useSecurityNotifications();

  const isLoading = state.loading || externalLoading;
  const currentStepData = registrationSteps[state.currentStep];
  const totalSteps = registrationSteps.length;
  const progress = ((state.currentStep + 1) / totalSteps) * 100;

  const updateState = useCallback((updates: Partial<RegistrationFormState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleInputChange = useCallback((field: keyof RegistrationFormState['formData'], value: string | boolean | string[]) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: { ...prev.errors, [field]: '' }
    }));
  }, []);

  const handleInterestToggle = useCallback((interest: string) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        interests: prev.formData.interests.includes(interest)
          ? prev.formData.interests.filter(i => i !== interest)
          : [...prev.formData.interests, interest]
      }
    }));
  }, []);

  const validateCurrentStep = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const { formData } = state;

    switch (state.currentStep) {
      case 0: // Basic Info
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.username.trim()) {
          newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
          newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
        }
        break;

      case 1: // Security
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 5: // Agreements
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = 'You must accept the Terms of Service';
        }
        if (!formData.acceptPrivacy) {
          newErrors.acceptPrivacy = 'You must accept the Privacy Policy';
        }
        break;

      // Steps 2, 3, 4 are optional, no validation needed
    }

    updateState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  }, [state.currentStep, state.formData, updateState]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(state.currentStep);
      
      updateState({
        currentStep: Math.min(state.currentStep + 1, totalSteps - 1),
        completedSteps: newCompletedSteps
      });
    }
  }, [validateCurrentStep, state.currentStep, state.completedSteps, totalSteps, updateState]);

  const handlePrevious = useCallback(() => {
    updateState({
      currentStep: Math.max(state.currentStep - 1, 0),
      errors: {}
    });
  }, [state.currentStep, updateState]);

  const handleSkipStep = useCallback(() => {
    // Only allow skipping optional steps (2, 3, 4)
    if ([2, 3, 4].includes(state.currentStep)) {
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(state.currentStep);
      
      updateState({
        currentStep: Math.min(state.currentStep + 1, totalSteps - 1),
        completedSteps: newCompletedSteps
      });
    }
  }, [state.currentStep, state.completedSteps, totalSteps, updateState]);

  const handleRegistration = useCallback(async () => {
    if (!validateCurrentStep()) return;

    updateState({ loading: true, errors: {} });
    
    try {
      // Create registration payload with only provided data
      const registrationData = {
        email: state.formData.email,
        password: state.formData.password,
        username: state.formData.username,
        fullName: state.formData.fullName,
        // Only include optional fields if they have values
        ...(state.formData.dateOfBirth && { dateOfBirth: state.formData.dateOfBirth }),
        ...(state.formData.gender && { gender: state.formData.gender }),
        ...(state.formData.bio && { bio: state.formData.bio }),
        ...(state.formData.institution && { 
          academicInfo: {
            institution: state.formData.institution,
            major: state.formData.major || undefined,
            year: state.formData.year ? parseInt(state.formData.year) : undefined,
          }
        }),
        ...(state.formData.interests.length > 0 && { interests: state.formData.interests }),
        acceptMarketing: state.formData.acceptMarketing,
      };

      // Register user with enhanced data
      console.log('Sending registration request:', registrationData);
      
      const registerResponse = await fetch('/api/auth/register-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const registerData = await registerResponse.json();
      console.log('Registration response:', registerData);

      if (registerData.success) {
        // Request email verification OTP
        console.log('Requesting OTP for email:', state.formData.email);
        
        const otpResponse = await fetch('/api/auth/request-email-verification-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.formData.email })
        });

        const otpData = await otpResponse.json();
        console.log('OTP response:', otpData);
        
        if (otpData.success) {
          updateState({ currentStep: totalSteps }); // Move to OTP verification
          
          // Show appropriate message based on email status
          if (otpData.data?.emailSent) {
            showOtpSent(state.formData.email);
            console.log('✅ Email sent successfully to:', state.formData.email);
          } else {
            showOtpSent(`${state.formData.email} (Email service unavailable - check console for OTP)`);
            console.log('⚠️ Email service unavailable, OTP available in console');
          }
          
          // Only show OTP in development mode when email wasn't sent
          if (process.env.NODE_ENV === 'development' && otpData.data?.otp && !otpData.data?.emailSent) {
            console.log('🔐 Development OTP (email service unavailable):', otpData.data.otp);
            updateState({ developmentOtp: otpData.data.otp });
          }
        } else {
          const errorMessage = otpData.error || 'Failed to send verification email';
          console.error('OTP request failed:', errorMessage);
          updateState({ errors: { general: errorMessage } });
          showLoginError(errorMessage);
        }
      } else {
        const errorMessage = registerData.error || 'Registration failed';
        console.error('Registration failed:', errorMessage);
        updateState({ errors: { general: errorMessage } });
        showLoginError(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      updateState({ errors: { general: errorMessage } });
      showLoginError(errorMessage);
    } finally {
      updateState({ loading: false });
    }
  }, [state.formData, validateCurrentStep, updateState, totalSteps, showOtpSent, showLoginError]);

  const handleOtpComplete = useCallback(async (otpCode: string) => {
    updateState({ loading: true, errors: {} });
    
    try {
      console.log('Verifying OTP:', otpCode, 'for email:', state.formData.email);
      
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.formData.email,
          otp: otpCode
        })
      });

      const data = await response.json();
      console.log('OTP verification response:', data);

      if (data.success && data.data) {
        const { user, accessToken, refreshToken } = data.data;
        showLoginSuccess(state.formData.email);
        onSuccess(user, { accessToken, refreshToken });
      } else {
        const errorMessage = data.error || 'Invalid or expired OTP';
        updateState({ 
          errors: { otp: errorMessage },
          otp: Array(6).fill('')
        });
        showLoginError(errorMessage);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = 'Network error. Please try again.';
      updateState({ 
        errors: { otp: errorMessage },
        otp: Array(6).fill('')
      });
      showLoginError(errorMessage);
    } finally {
      updateState({ loading: false });
    }
  }, [state.formData.email, updateState, showLoginSuccess, showLoginError, onSuccess]);

  const handleResendOtp = useCallback(async () => {
    updateState({ loading: true, errors: {} });
    
    try {
      console.log('Resending OTP for email:', state.formData.email);
      
      const response = await fetch('/api/auth/request-email-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.formData.email })
      });

      const data = await response.json();
      console.log('Resend OTP response:', data);
      
      if (data.success) {
        updateState({ otp: Array(6).fill('') });
        
        // Show appropriate message based on email status
        if (data.data?.emailSent) {
          showOtpSent(state.formData.email);
          console.log('✅ Email resent successfully to:', state.formData.email);
        } else {
          showOtpSent(`${state.formData.email} (Email service unavailable - check console for OTP)`);
          console.log('⚠️ Email service unavailable, OTP available in console');
        }
        
        // Only show OTP in development mode when email wasn't sent
        if (process.env.NODE_ENV === 'development' && data.data?.otp && !data.data?.emailSent) {
          console.log('🔐 Development OTP (resent, email service unavailable):', data.data.otp);
          updateState({ developmentOtp: data.data.otp });
        }
      } else {
        const errorMessage = data.error || 'Failed to resend OTP';
        updateState({ errors: { general: errorMessage } });
        showLoginError(errorMessage);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = 'Network error. Please try again.';
      updateState({ errors: { general: errorMessage } });
      showLoginError(errorMessage);
    } finally {
      updateState({ loading: false });
    }
  }, [state.formData.email, updateState, showOtpSent, showLoginError]);

  const renderStepContent = () => {
    const { formData, errors } = state;

    switch (state.currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              error={errors.fullName}
              disabled={isLoading}
              required
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              disabled={isLoading}
              required
              helperText="We'll send you a verification code"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              type="text"
              label="Username"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              error={errors.username}
              disabled={isLoading}
              required
              helperText="This will be your unique identifier"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            />
          </div>
        );

      case 1: // Security
        return (
          <div className="space-y-6">
            <Input
              type="password"
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              disabled={isLoading}
              required
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {formData.password && (
              <PasswordStrengthIndicator
                password={formData.password}
                showRequirements={true}
              />
            )}

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              disabled={isLoading}
              required
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        );

      case 2: // Personal Details
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Badge variant="secondary" size="sm">Optional</Badge>
              <p className="text-sm text-gray-600 mt-2">
                This information helps us personalize your experience
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={isLoading}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
                disabled={isLoading}
              />
            </div>
          </div>
        );

      case 3: // Academic Info
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Badge variant="secondary" size="sm">Optional</Badge>
              <p className="text-sm text-gray-600 mt-2">
                Help us connect you with relevant academic content
              </p>
            </div>

            <Input
              type="text"
              label="Institution"
              placeholder="Your university or college"
              value={formData.institution}
              onChange={(e) => handleInputChange('institution', e.target.value)}
              disabled={isLoading}
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="Major/Field of Study"
                placeholder="e.g., Computer Science"
                value={formData.major}
                onChange={(e) => handleInputChange('major', e.target.value)}
                disabled={isLoading}
              />

              <Input
                type="text"
                label="Academic Year"
                placeholder="e.g., 2024"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        );

      case 4: // Interests
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Badge variant="secondary" size="sm">Optional</Badge>
              <p className="text-sm text-gray-600 mt-2">
                Select topics you're interested in to personalize your feed
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-3 text-sm rounded-lg border-2 transition-all ${
                    formData.interests.includes(interest)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  {interest}
                </button>
              ))}
            </div>

            {formData.interests.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Selected {formData.interests.length} interest{formData.interests.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        );

      case 5: // Agreements
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  I agree to the{' '}
                  <a 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 underline"
                  >
                    Terms of Service
                  </a>
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600 ml-7">{errors.acceptTerms}</p>
              )}

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.acceptPrivacy}
                  onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  I agree to the{' '}
                  <a 
                    href="/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 underline"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              {errors.acceptPrivacy && (
                <p className="text-sm text-red-600 ml-7">{errors.acceptPrivacy}</p>
              )}

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.acceptMarketing}
                  onChange={(e) => handleInputChange('acceptMarketing', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  I'd like to receive updates and marketing communications
                  <span className="text-gray-500 text-xs block">Optional - you can unsubscribe anytime</span>
                </span>
              </label>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Ready to Create Your Account!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    You're all set to join our community. Click "Create Account" to finish registration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // OTP Verification Step
  if (state.currentStep >= totalSteps) {
    return (
      <div className="w-full max-w-md mx-auto">
        {/* Development OTP Notice */}
        {state.developmentOtp && (
          <DevelopmentOtpNotice
            otp={state.developmentOtp}
            email={state.formData.email}
            onDismiss={() => updateState({ developmentOtp: null })}
          />
        )}

        <SecurityNotifications
          notifications={notifications}
          onDismiss={removeNotification}
          className="mb-6"
        />
        
        <OTPVerification
          email={state.formData.email}
          method="otp"
          onComplete={handleOtpComplete}
          onResend={handleResendOtp}
          onBack={() => updateState({ currentStep: totalSteps - 1 })}
          loading={isLoading}
          error={state.errors.otp}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Development OTP Notice */}
      {state.developmentOtp && (
        <DevelopmentOtpNotice
          otp={state.developmentOtp}
          email={state.formData.email}
          onDismiss={() => updateState({ developmentOtp: null })}
        />
      )}

      {/* Security Notifications */}
      <SecurityNotifications
        notifications={notifications}
        onDismiss={removeNotification}
        className="mb-6"
      />

      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
            <p className="text-gray-600">Step {state.currentStep + 1} of {totalSteps}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{Math.round(progress)}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
        
        <Progress value={progress} size="sm" variant="gradient" />
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between mt-4 px-2">
          {registrationSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${index <= state.currentStep 
                  ? 'bg-blue-600 text-white' 
                  : state.completedSteps.has(index)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {state.completedSteps.has(index) ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <div className="text-xs text-center mt-1 max-w-16">
                <div className={`font-medium ${
                  index <= state.currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title.split(' ')[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{currentStepData.icon}</span>
          </div>
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
          <CardDescription className="text-base">{currentStepData.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Display */}
          <AnimatePresence>
            {state.errors.general && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <p className="text-sm text-red-600">{state.errors.general}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={state.currentStep === 0 || isLoading}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-3">
              {/* Skip button for optional steps */}
              {[2, 3, 4].includes(state.currentStep) && (
                <Button
                  variant="outline"
                  onClick={handleSkipStep}
                  disabled={isLoading}
                >
                  Skip
                </Button>
              )}

              {state.currentStep < totalSteps - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleRegistration}
                  loading={isLoading}
                  loadingText="Creating Account..."
                  disabled={!state.formData.acceptTerms || !state.formData.acceptPrivacy}
                >
                  Create Account
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}