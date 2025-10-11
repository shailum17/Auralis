'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OTPInput } from '@/components/ui/OTPInput';
import { ValidationRule } from '@/components/ui/types';
import { SessionPreferences } from './SessionPreferences';
import { SecurityNotifications, useSecurityNotifications } from './SecurityNotifications';
import { OTPVerification } from './OTPVerification';
import { UsernameEmailInput, detectInputType } from './UsernameEmailInput';
import { authAPI, detectIdentifierType } from '@/lib/auth-api';
import { apiClient } from '@/lib/api';
import { DemoAuth, isDemoMode } from '@/lib/demo-auth';

interface LoginFormProps {
  onSuccess: (user: any, tokens: { accessToken: string; refreshToken: string }) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

interface LoginFormState {
  method: 'password' | 'otp';
  step: 'credentials' | 'otp-verification';
  formData: {
    identifier: string; // Can be email or username
    password: string;
    rememberMe: boolean;
    sessionDuration: number;
  };
  otp: string[];
  loading: boolean;
  errors: Record<string, string>;
  otpResendCooldown: number;
}

const passwordValidation: ValidationRule[] = [
  { type: 'required', message: 'Password is required' },
  { type: 'minLength', value: 6, message: 'Password must be at least 6 characters' }
];

export function LoginForm({ onSuccess, onError, loading: externalLoading = false }: LoginFormProps) {
  const [state, setState] = useState<LoginFormState>({
    method: 'password',
    step: 'credentials',
    formData: {
      identifier: '',
      password: '',
      rememberMe: false,
      sessionDuration: 24
    },
    otp: Array(6).fill(''),
    loading: false,
    errors: {},
    otpResendCooldown: 0
  });

  const {
    notifications,
    removeNotification,
    clearAll,
    showLoginSuccess,
    showSecurityAlert,
    showOtpSent,
    showLoginError
  } = useSecurityNotifications();

  const isLoading = state.loading || externalLoading;

  const updateState = useCallback((updates: Partial<LoginFormState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resolveEmailForDisplay = useCallback((identifier: string): string => {
    const identifierType = detectIdentifierType(identifier);
    if (identifierType === 'username') {
      const user = DemoAuth.resolveUser(identifier);
      return user?.email || identifier;
    }
    return identifier;
  }, []);

  const clearError = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: '' }
    }));
  }, []);

  const handleMethodToggle = useCallback((method: 'password' | 'otp') => {
    // Clear notifications when switching methods
    clearAll();
    updateState({
      method,
      step: 'credentials',
      errors: {},
      otp: Array(6).fill('')
    });
  }, [updateState, clearAll]);

  const handleInputChange = useCallback((field: keyof LoginFormState['formData'], value: string | boolean | number) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: { ...prev.errors, [field]: '' }
    }));
  }, []);

  const handlePasswordLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.formData.identifier || !state.formData.password) {
      updateState({
        errors: {
          identifier: !state.formData.identifier ? 'Email or username is required' : '',
          password: !state.formData.password ? 'Password is required' : ''
        }
      });
      return;
    }

    // Clear previous notifications and errors
    clearAll();
    updateState({ loading: true, errors: {} });
    
    try {
      // First verify password, then request OTP using new system
      const identifierType = detectIdentifierType(state.formData.identifier);
      
      // Verify password first
      const credentials = identifierType === 'email' 
        ? { email: state.formData.identifier, password: state.formData.password }
        : { username: state.formData.identifier, password: state.formData.password };

      const passwordResult = await authAPI.verifyPasswordAndRequestOtp(credentials);
      
      if (passwordResult.success) {
        // Password verified, now request OTP using new system
        const otpRequest = identifierType === 'email'
          ? { email: state.formData.identifier, type: 'PASSWORD_LOGIN' as const }
          : { username: state.formData.identifier, type: 'PASSWORD_LOGIN' as const };

        const otpResult = await authAPI.requestOtpNew(otpRequest);
        
        if (otpResult.success) {
          updateState({ step: 'otp-verification' });
          const emailForOtp = otpResult.email || resolveEmailForDisplay(state.formData.identifier);
          showOtpSent(emailForOtp);
        } else {
          const errorMessage = otpResult.error || 'Failed to send verification code';
          updateState({ errors: { general: errorMessage } });
          showLoginError(errorMessage);
        }
      } else {
        const errorMessage = passwordResult.error || `Invalid ${identifierType} or password`;
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
  }, [state.formData, updateState, showOtpSent, showLoginError, clearAll]);

  const handleOtpLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.formData.identifier) {
      updateState({ errors: { identifier: 'Email or username is required' } });
      return;
    }

    // Clear previous notifications and errors
    clearAll();
    updateState({ loading: true, errors: {} });
    
    try {
      // Use new OTP system for OTP-only login
      const identifierType = detectIdentifierType(state.formData.identifier);
      
      const otpRequest = identifierType === 'email'
        ? { email: state.formData.identifier, type: 'LOGIN' as const }
        : { username: state.formData.identifier, type: 'LOGIN' as const };

      const data = await authAPI.requestOtpNew(otpRequest);
      
      if (data.success) {
        updateState({ step: 'otp-verification' });
        const emailForOtp = data.email || resolveEmailForDisplay(state.formData.identifier);
        showOtpSent(emailForOtp);
      } else {
        const errorMessage = data.error || 'Failed to send login code';
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
  }, [state.formData.identifier, updateState, showOtpSent, showLoginError, clearAll]);

  const handleOtpChange = useCallback((otp: string[]) => {
    updateState({ otp, errors: { ...state.errors, otp: '' } });
  }, [state.errors, updateState]);

  const handleOtpComplete = useCallback(async (otpCode: string) => {
    // Prevent multiple submissions
    if (state.loading) return;
    
    // Clear previous notifications and errors
    clearAll();
    updateState({ loading: true, errors: {} });
    
    try {
      // Use new OTP verification system
      const identifierType = detectIdentifierType(state.formData.identifier);
      
      const verification = identifierType === 'email'
        ? {
            email: state.formData.identifier,
            otp: otpCode,
            type: state.method === 'password' ? 'PASSWORD_LOGIN' as const : 'LOGIN' as const,
            rememberMe: state.formData.rememberMe,
            sessionDuration: state.formData.sessionDuration
          }
        : {
            username: state.formData.identifier,
            otp: otpCode,
            type: state.method === 'password' ? 'PASSWORD_LOGIN' as const : 'LOGIN' as const,
            rememberMe: state.formData.rememberMe,
            sessionDuration: state.formData.sessionDuration
          };
      
      const data = await authAPI.verifyOtpNew(verification);

      console.log('OTP Verification Response:', data);

      if (data.success && data.data) {
        const { user, accessToken, refreshToken } = data.data;
        showLoginSuccess(user.email);
        // Add a small delay to show the success notification before redirecting
        setTimeout(() => {
          onSuccess(user, { accessToken, refreshToken });
        }, 1500);
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
  }, [state.method, state.formData.identifier, state.formData.rememberMe, state.formData.sessionDuration, state.loading, onSuccess, updateState, showLoginSuccess, showLoginError, clearAll]);

  const handleResendOtp = useCallback(async () => {
    // Clear previous notifications and errors
    clearAll();
    updateState({ loading: true, errors: {} });
    
    try {
      // Use new OTP system for resending
      const identifierType = detectIdentifierType(state.formData.identifier);
      
      let data;
      
      if (state.method === 'password') {
        // For password method, first verify password then request OTP
        const credentials = identifierType === 'email' 
          ? { email: state.formData.identifier, password: state.formData.password }
          : { username: state.formData.identifier, password: state.formData.password };
        
        const passwordResult = await authAPI.verifyPasswordAndRequestOtp(credentials);
        
        if (passwordResult.success) {
          // Password verified, now request OTP using new system
          const otpRequest = identifierType === 'email'
            ? { email: state.formData.identifier, type: 'PASSWORD_LOGIN' as const }
            : { username: state.formData.identifier, type: 'PASSWORD_LOGIN' as const };
          
          data = await authAPI.requestOtpNew(otpRequest);
        } else {
          data = passwordResult;
        }
      } else {
        // For OTP-only method, use new OTP system directly
        const otpRequest = identifierType === 'email'
          ? { email: state.formData.identifier, type: 'LOGIN' as const }
          : { username: state.formData.identifier, type: 'LOGIN' as const };
        
        data = await authAPI.requestOtpNew(otpRequest);
      }
      
      if (data.success) {
        updateState({ otp: Array(6).fill('') });
        const emailForOtp = data.email || resolveEmailForDisplay(state.formData.identifier);
        showOtpSent(emailForOtp);
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
  }, [state.method, state.formData.identifier, state.formData.password, updateState, showOtpSent, showLoginError, clearAll]);

  const handleBackToLogin = useCallback(() => {
    // Clear notifications when going back
    clearAll();
    updateState({
      step: 'credentials',
      otp: Array(6).fill(''),
      errors: {},
      otpResendCooldown: 0
    });
  }, [updateState, clearAll]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Security Notifications */}
      <SecurityNotifications
        notifications={notifications}
        onDismiss={removeNotification}
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {state.step === 'credentials' ? (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Method Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Login method">
              <button
                type="button"
                role="tab"
                aria-selected={state.method === 'password'}
                aria-controls="password-panel"
                onClick={() => handleMethodToggle('password')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  state.method === 'password'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={state.method === 'otp'}
                aria-controls="otp-panel"
                onClick={() => handleMethodToggle('otp')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  state.method === 'otp'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                OTP Login
              </button>
            </div>

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

            {/* Password Login Form */}
            {state.method === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4" id="password-panel" role="tabpanel">
                <UsernameEmailInput
                  value={state.formData.identifier}
                  onChange={(value) => handleInputChange('identifier', value)}
                  error={state.errors.identifier}
                  disabled={isLoading}
                  required
                />

                <Input
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={state.formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  validation={passwordValidation}
                  showValidation={!!state.formData.password}
                  error={state.errors.password}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <SessionPreferences
                  rememberMe={state.formData.rememberMe}
                  onRememberMeChange={(value) => handleInputChange('rememberMe', value)}
                  sessionDuration={state.formData.sessionDuration}
                  onSessionDurationChange={(duration) => handleInputChange('sessionDuration', duration)}
                  showAdvanced={true}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  loadingText="Signing In..."
                  disabled={!state.formData.identifier || !state.formData.password}
                  motionProps={{
                    whileHover: { scale: 1.02 },
                    whileTap: { scale: 0.98 }
                  }}
                >
                  Sign In with Password
                </Button>
              </form>
            )}

            {/* OTP Login Form */}
            {state.method === 'otp' && (
              <form onSubmit={handleOtpLogin} className="space-y-4" id="otp-panel" role="tabpanel">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm">
                    We'll send a 6-digit verification code to your email for secure login
                  </p>
                </div>

                <UsernameEmailInput
                  value={state.formData.identifier}
                  onChange={(value) => handleInputChange('identifier', value)}
                  error={state.errors.identifier}
                  disabled={isLoading}
                  required
                />

                <SessionPreferences
                  rememberMe={state.formData.rememberMe}
                  onRememberMeChange={(value) => handleInputChange('rememberMe', value)}
                  sessionDuration={state.formData.sessionDuration}
                  onSessionDurationChange={(duration) => handleInputChange('sessionDuration', duration)}
                  showAdvanced={false}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  loadingText="Sending Code..."
                  disabled={!state.formData.identifier}
                  motionProps={{
                    whileHover: { scale: 1.02 },
                    whileTap: { scale: 0.98 }
                  }}
                >
                  Send Login Code
                </Button>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="otp-verification"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <OTPVerification
              email={detectInputType(state.formData.identifier) === 'email' ? state.formData.identifier : 'your registered email'}
              method={state.method}
              onComplete={handleOtpComplete}
              onResend={handleResendOtp}
              onBack={handleBackToLogin}
              loading={isLoading}
              error={state.errors.otp}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}