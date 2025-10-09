'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';
import { OTPVerification } from './OTPVerification';
import { SecurityNotifications, useSecurityNotifications } from './SecurityNotifications';
import { ValidationRule } from '@/components/ui/types';

interface RegistrationFormProps {
  onSuccess: (user: any, tokens: { accessToken: string; refreshToken: string }) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

interface RegistrationFormState {
  step: 'registration' | 'email-verification' | 'onboarding';
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    fullName: string;
    acceptTerms: boolean;
    acceptPrivacy: boolean;
  };
  otp: string[];
  loading: boolean;
  errors: Record<string, string>;
}

const emailValidation: ValidationRule[] = [
  { type: 'required', message: 'Email is required' },
  { type: 'email', message: 'Please enter a valid email address' }
];

const usernameValidation: ValidationRule[] = [
  { type: 'required', message: 'Username is required' },
  { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
  { type: 'maxLength', value: 20, message: 'Username must be less than 20 characters' },
  { type: 'pattern', value: '^[a-zA-Z0-9_-]+$', message: 'Username can only contain letters, numbers, hyphens, and underscores' }
];

const fullNameValidation: ValidationRule[] = [
  { type: 'required', message: 'Full name is required' },
  { type: 'minLength', value: 2, message: 'Full name must be at least 2 characters' }
];

const passwordValidation: ValidationRule[] = [
  { type: 'required', message: 'Password is required' },
  { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
];

export function RegistrationForm({ onSuccess, onError, loading: externalLoading = false }: RegistrationFormProps) {
  const [state, setState] = useState<RegistrationFormState>({
    step: 'registration',
    formData: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      fullName: '',
      acceptTerms: false,
      acceptPrivacy: false
    },
    otp: Array(6).fill(''),
    loading: false,
    errors: {}
  });

  const {
    notifications,
    removeNotification,
    showLoginSuccess,
    showOtpSent,
    showLoginError
  } = useSecurityNotifications();

  const isLoading = state.loading || externalLoading;

  const updateState = useCallback((updates: Partial<RegistrationFormState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleInputChange = useCallback((field: keyof RegistrationFormState['formData'], value: string | boolean) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: { ...prev.errors, [field]: '' }
    }));
  }, []);

  const validateRegistrationForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!state.formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Username validation
    if (!state.formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (state.formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(state.formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    // Email validation
    if (!state.formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(state.formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!state.formData.password) {
      newErrors.password = 'Password is required';
    } else if (state.formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (state.formData.password !== state.formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms and privacy validation
    if (!state.formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service';
    }

    if (!state.formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'You must accept the Privacy Policy';
    }

    updateState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  }, [state.formData, updateState]);

  const handleRegistration = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegistrationForm()) return;

    updateState({ loading: true, errors: {} });
    
    try {
      // Register user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.formData.email,
          password: state.formData.password,
          username: state.formData.username,
          fullName: state.formData.fullName
        })
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        // Request email verification OTP
        const otpResponse = await fetch('/api/auth/request-email-verification-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.formData.email })
        });

        const otpData = await otpResponse.json();
        
        if (otpData.success) {
          updateState({ step: 'email-verification' });
          showOtpSent(state.formData.email);
        } else {
          const errorMessage = otpData.error || 'Failed to send verification email';
          updateState({ errors: { general: errorMessage } });
          showLoginError(errorMessage);
        }
      } else {
        const errorMessage = registerData.error || 'Registration failed';
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
  }, [state.formData, validateRegistrationForm, updateState, showOtpSent, showLoginError]);

  const handleOtpComplete = useCallback(async (otpCode: string) => {
    updateState({ loading: true, errors: {} });
    
    try {
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.formData.email,
          otp: otpCode
        })
      });

      const data = await response.json();

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
      const response = await fetch('/api/auth/request-email-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.formData.email })
      });

      const data = await response.json();
      
      if (data.success) {
        updateState({ otp: Array(6).fill('') });
        showOtpSent(state.formData.email);
      } else {
        const errorMessage = data.error || 'Failed to resend OTP';
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
  }, [state.formData.email, updateState, showOtpSent, showLoginError]);

  const handleBackToRegistration = useCallback(() => {
    updateState({
      step: 'registration',
      otp: Array(6).fill(''),
      errors: {}
    });
  }, [updateState]);

  const getStepIndicator = () => {
    const steps = [
      { id: 'registration', label: 'Account', icon: '👤' },
      { id: 'email-verification', label: 'Verify', icon: '📧' },
      { id: 'onboarding', label: 'Welcome', icon: '🎉' }
    ];

    const currentStepIndex = steps.findIndex(step => step.id === state.step);

    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                ${index <= currentStepIndex 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                <span className="text-lg">{step.icon}</span>
              </div>
              <div className="ml-2 text-center">
                <p className={`text-xs font-medium ${
                  index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-16 h-1 mx-4 transition-all duration-200
                  ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Security Notifications */}
      <SecurityNotifications
        notifications={notifications}
        onDismiss={removeNotification}
        className="mb-6"
      />

      {/* Step Indicator */}
      {getStepIndicator()}

      <AnimatePresence mode="wait">
        {state.step === 'registration' ? (
          <motion.div
            key="registration"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Error Display */}
            <AnimatePresence>
              {state.errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                  role="alert"
                >
                  <p className="text-sm text-red-600">{state.errors.general}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRegistration} className="space-y-4">
              {/* Full Name */}
              <Input
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={state.formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                validation={fullNameValidation}
                showValidation={!!state.formData.fullName}
                error={state.errors.fullName}
                disabled={isLoading}
                required
                autoComplete="name"
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              {/* Username */}
              <Input
                type="text"
                label="Username"
                placeholder="Choose a unique username"
                value={state.formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                validation={usernameValidation}
                showValidation={!!state.formData.username}
                error={state.errors.username}
                disabled={isLoading}
                required
                autoComplete="username"
                helperText="This will be your unique identifier in the community"
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              />

              {/* Email */}
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                value={state.formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                validation={emailValidation}
                showValidation={!!state.formData.email}
                error={state.errors.email}
                disabled={isLoading}
                required
                autoComplete="email"
                helperText="We'll send you a verification code"
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              {/* Password */}
              <Input
                type="password"
                label="Password"
                placeholder="Create a strong password"
                value={state.formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                validation={passwordValidation}
                showValidation={!!state.formData.password}
                error={state.errors.password}
                disabled={isLoading}
                required
                autoComplete="new-password"
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              {/* Password Strength Indicator */}
              {state.formData.password && (
                <PasswordStrengthIndicator
                  password={state.formData.password}
                  showRequirements={true}
                />
              )}

              {/* Confirm Password */}
              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={state.formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={state.errors.confirmPassword}
                disabled={isLoading}
                required
                autoComplete="new-password"
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              {/* Terms and Privacy */}
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={state.formData.acceptTerms}
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
                      className="text-blue-600 hover:text-blue-500 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                    >
                      Terms of Service
                    </a>
                  </span>
                </label>
                {state.errors.acceptTerms && (
                  <p className="text-sm text-red-600 ml-7">{state.errors.acceptTerms}</p>
                )}

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={state.formData.acceptPrivacy}
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
                      className="text-blue-600 hover:text-blue-500 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {state.errors.acceptPrivacy && (
                  <p className="text-sm text-red-600 ml-7">{state.errors.acceptPrivacy}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                loadingText="Creating Account..."
                disabled={!state.formData.acceptTerms || !state.formData.acceptPrivacy}
                motionProps={{
                  whileHover: { scale: 1.02 },
                  whileTap: { scale: 0.98 }
                }}
              >
                Create Account
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="email-verification"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <OTPVerification
              email={state.formData.email}
              method="otp"
              onComplete={handleOtpComplete}
              onResend={handleResendOtp}
              onBack={handleBackToRegistration}
              loading={isLoading}
              error={state.errors.otp}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}