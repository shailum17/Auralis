'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, User, Lock } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { LoginData } from '@/types/auth';
import { AuthValidationRules, FormValidator } from '@/lib/form-validation';
import { useSecurity } from '@/hooks/useSecurity';
import { SecurityStatusDisplay } from '@/components/auth/SecurityStatusDisplay';

export default function SignInPage() {
  const router = useRouter();
  const { login, verifyOTP, isLoading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState<LoginData>({
    identifier: '',
    password: '',
    rememberMe: false,
    sessionDuration: 24,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState<{
    required: boolean;
    email: string;
    message: string;
  } | null>(null);

  // OTP verification state
  const [otpStep, setOtpStep] = useState<{
    active: boolean;
    email: string;
    username?: string;
    otp: string;
    isVerifying: boolean;
  }>({
    active: false,
    email: '',
    username: '',
    otp: '',
    isVerifying: false,
  });

  // Security features
  const security = useSecurity(formData.identifier, {
    rateLimitAction: 'login',
    enableCSRF: true,
    enableRateLimit: true,
    enableInputValidation: true,
    formId: 'signin-form'
  });

  // Determine if identifier is email or username
  const isEmail = formData.identifier.includes('@');

  // Handle input changes with security validation
  const handleInputChange = useCallback((field: keyof LoginData, value: string | boolean | number) => {
    let processedValue = value;

    // Apply security validation for string inputs
    if (typeof value === 'string' && field !== 'password') {
      const validationResult = security.validateInput(
        value,
        field === 'identifier' ? 'email' : 'text',
        field === 'identifier' ? 254 : undefined
      );
      processedValue = validationResult.sanitizedValue;

      // Show security warnings if any
      if (validationResult.violations.length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: validationResult.violations[0]
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }
  }, [validationErrors, error, clearError, security]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const fields = [
      {
        name: 'identifier',
        value: formData.identifier,
        rules: AuthValidationRules.identifier(),
      },
      {
        name: 'password',
        value: formData.password,
        rules: [
          {
            type: 'required' as const,
            message: 'Password is required',
          },
        ],
      },
    ];

    const results = FormValidator.validateForm(fields);
    const errors: Record<string, string> = {};

    for (const [fieldName, result] of Object.entries(results)) {
      if (!result.isValid && result.errors.length > 0) {
        errors[fieldName] = result.errors[0];
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);



  // Handle credential validation and OTP request
  const handleCredentialValidation = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setValidationErrors({});

      // First validate credentials by attempting login
      const loginResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      const loginResult = await loginResponse.json();

      if (loginResult.success) {
        // Credentials are valid, now request OTP for additional verification
        const otpResponse = await fetch('/api/auth/request-login-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: isEmail ? formData.identifier : undefined,
            username: !isEmail ? formData.identifier : undefined,
          }),
        });

        const otpResult = await otpResponse.json();

        if (otpResult.success) {
          // Move to OTP verification step
          setOtpStep({
            active: true,
            email: otpResult.email || formData.identifier,
            username: !isEmail ? formData.identifier : undefined,
            otp: '',
            isVerifying: false,
          });
        } else {
          setValidationErrors({
            general: otpResult.error || 'Failed to send verification code'
          });
        }
      } else {
        // Handle login errors (invalid credentials, verification required, etc.)
        if (loginResult.requiresVerification) {
          setVerificationRequired({
            required: true,
            email: formData.identifier,
            message: loginResult.error || 'Please verify your email address before signing in'
          });
        } else {
          setValidationErrors({
            general: loginResult.error || 'Invalid credentials'
          });
        }
      }
    } catch (error) {
      console.error('Credential validation error:', error);
      setValidationErrors({
        general: 'An error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEmail]);

  // Handle OTP verification
  const handleOtpVerification = useCallback(async () => {
    try {
      setOtpStep(prev => ({ ...prev, isVerifying: true }));
      setValidationErrors({});

      // Use AuthContext's verifyOTP method to properly update authentication state
      const result = await verifyOTP({
        email: isEmail ? formData.identifier : undefined,
        username: !isEmail ? formData.identifier : undefined,
        otp: otpStep.otp,
        type: 'LOGIN',
        rememberMe: formData.rememberMe,
        sessionDuration: formData.sessionDuration,
      });

      if (result.success) {
        // Redirect to dashboard - AuthContext will handle state updates
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
        router.push(redirectTo);
      } else {
        setValidationErrors({
          otp: result.error || 'Invalid verification code'
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setValidationErrors({
        otp: 'An error occurred. Please try again.'
      });
    } finally {
      setOtpStep(prev => ({ ...prev, isVerifying: false }));
    }
  }, [formData, otpStep.otp, isEmail, router, verifyOTP]);

  // Handle OTP input change
  const handleOtpChange = useCallback((value: string) => {
    // Only allow digits and limit to 6 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setOtpStep(prev => ({ ...prev, otp: cleanValue }));

    // Clear OTP errors when user starts typing
    if (validationErrors.otp) {
      setValidationErrors(prev => ({ ...prev, otp: '' }));
    }
  }, [validationErrors.otp]);

  // Handle resend OTP
  const handleResendOtp = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/request-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: isEmail ? formData.identifier : undefined,
          username: !isEmail ? formData.identifier : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message (you could add a toast notification here)
        setValidationErrors({ general: 'New verification code sent to your email' });
      } else {
        setValidationErrors({
          general: result.error || 'Failed to resend verification code'
        });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setValidationErrors({
        general: 'Failed to resend verification code. Please try again.'
      });
    }
  }, [formData, isEmail]);

  // Handle back to credentials
  const handleBackToCredentials = useCallback(() => {
    setOtpStep({
      active: false,
      email: '',
      username: '',
      otp: '',
      isVerifying: false,
    });
    setValidationErrors({});
  }, []);

  // Handle form submission with security checks
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpStep.active) {
      // Handle OTP verification
      if (!otpStep.otp || otpStep.otp.length !== 6) {
        setValidationErrors({ otp: 'Please enter a valid 6-digit verification code' });
        return;
      }
      await handleOtpVerification();
    } else {
      // Handle initial credential validation
      if (!validateForm()) {
        return;
      }

      // Check if submission is allowed by security service
      if (!security.canSubmit) {
        return;
      }

      await handleCredentialValidation();
    }
  }, [otpStep, validateForm, security, handleOtpVerification, handleCredentialValidation]);

  // Handle resend verification email
  const handleResendVerification = useCallback(async () => {
    if (!verificationRequired?.email) return;

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: verificationRequired.email }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message and redirect to verification page
        router.push(`/auth/verify-email?email=${encodeURIComponent(verificationRequired.email)}&resent=true`);
      } else {
        // Show error message
        setValidationErrors({
          general: result.message || 'Failed to resend verification email'
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setValidationErrors({
        general: 'Failed to resend verification email. Please try again.'
      });
    }
  }, [verificationRequired, router]);

  // Handle proceed to verification
  const handleProceedToVerification = useCallback(() => {
    if (!verificationRequired?.email) return;
    router.push(`/auth/verify-email?email=${encodeURIComponent(verificationRequired.email)}`);
  }, [verificationRequired, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <span className="text-white font-bold text-xl">S</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-secondary-900 mb-2"
            >
              Welcome Back
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-secondary-600"
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          {/* Sign In Form */}
          <Card asMotion variant="elevated">
            <CardHeader>
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>
                Enter your email or username and password
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Email Verification Required */}
              <AnimatePresence>
                {verificationRequired && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-amber-800 mb-1">
                          Email Verification Required
                        </h3>
                        <p className="text-sm text-amber-700 mb-3">
                          {verificationRequired.message}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleProceedToVerification}
                            className="border-amber-300 text-amber-700 hover:bg-amber-100"
                          >
                            Enter Verification Code
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleResendVerification}
                            className="text-amber-600 hover:bg-amber-100"
                          >
                            Resend Code
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Security Status Display */}
                <SecurityStatusDisplay
                  securityStatus={security.securityStatus}
                />

                {/* OTP Verification Step */}
                {otpStep.active && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-8 w-8 text-primary-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Verify Your Identity
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        We've sent a 6-digit verification code to<br />
                        <span className="font-medium">{otpStep.email}</span>
                      </p>
                    </div>

                    {/* OTP Input */}
                    <div>
                      <Input
                        type="text"
                        label="Verification Code"
                        placeholder="Enter 6-digit code"
                        value={otpStep.otp}
                        onChange={(e) => handleOtpChange(e.target.value)}
                        error={validationErrors.otp}
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        disabled={otpStep.isVerifying}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />
                    </div>

                    {/* OTP Actions */}
                    <div className="flex flex-col space-y-3">
                      <Button
                        type="submit"
                        fullWidth
                        loading={otpStep.isVerifying}
                        loadingText="Verifying..."
                        disabled={otpStep.isVerifying || otpStep.otp.length !== 6}
                      >
                        Verify & Sign In
                      </Button>

                      <div className="flex justify-between items-center text-sm">
                        <button
                          type="button"
                          onClick={handleBackToCredentials}
                          className="text-gray-600 hover:text-gray-800 font-medium"
                          disabled={otpStep.isVerifying}
                        >
                          ← Back to login
                        </button>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                          disabled={otpStep.isVerifying}
                        >
                          Resend code
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Credential Input Step */}
                {!otpStep.active && (
                  <div className="space-y-6">

                    {/* Global Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-3 bg-error-50 border border-error-200 rounded-lg"
                        >
                          <p className="text-sm text-error-700">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Email/Username Field */}
                    <div>
                      <Input
                        type="text"
                        label="Email or Username"
                        placeholder="Enter your email or username"
                        value={formData.identifier}
                        onChange={(e) => handleInputChange('identifier', e.target.value)}
                        error={validationErrors.identifier}
                        icon={isEmail ? <Mail /> : <User />}
                        iconPosition="left"
                        required
                        autoComplete="username"
                        disabled={isSubmitting || isLoading}
                      />
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        error={validationErrors.password}
                        icon={<Lock />}
                        iconPosition="left"
                        required
                        autoComplete="current-password"
                        disabled={isSubmitting || isLoading}
                      />

                      {/* Password Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-10 text-secondary-400 hover:text-secondary-600 transition-colors z-10"
                        disabled={isSubmitting || isLoading}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Remember Me and Session Duration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                            className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
                            disabled={isSubmitting || isLoading}
                          />
                          <span className="text-sm text-secondary-700">Remember me</span>
                        </label>

                        <Link
                          href="/auth/forgot-password"
                          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      {/* Session Duration Options */}
                      <AnimatePresence>
                        {formData.rememberMe && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                              <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Keep me signed in for:
                              </label>
                              <select
                                value={formData.sessionDuration}
                                onChange={(e) => handleInputChange('sessionDuration', parseInt(e.target.value))}
                                className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                disabled={isSubmitting || isLoading}
                              >
                                <option value={1}>1 hour</option>
                                <option value={4}>4 hours</option>
                                <option value={8}>8 hours</option>
                                <option value={24}>1 day</option>
                                <option value={168}>1 week</option>
                                <option value={720}>30 days</option>
                              </select>
                              <p className="text-xs text-secondary-600 mt-1">
                                You&apos;ll stay signed in for the selected duration
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isSubmitting || isLoading}
                      loadingText="Signing in..."
                      disabled={isSubmitting || isLoading || !security.canSubmit}
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-secondary-600">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/signup"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
                
                {/* Admin Login Link */}
                <p className="text-xs text-gray-500">
                  Administrator?{' '}
                  <Link
                    href="/admin/login"
                    className="text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Admin Login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}