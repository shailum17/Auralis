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
  const { login, isLoading, error, clearError } = useAuth();

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

  // Handle form submission with security checks
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if submission is allowed by security service
    if (!security.canSubmit) {
      return;
    }

    setIsSubmitting(true);
    
    // Use security service to attempt the login with rate limiting
    const result = await security.attemptAction(async () => {
      const headers = security.getSecurityHeaders();
      
      // Add CSRF token to form data if available
      const loginData = {
        ...formData,
        csrfToken: security.securityState.csrfToken
      };
      
      return await login(loginData);
    }, 'login');
    
    if (result.success && result.data?.success) {
      // Reset rate limit on successful login
      security.resetRateLimit();
      
      // Check if user needs email verification
      if (result.data.requiresVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.identifier)}`);
      } else {
        // Redirect to dashboard or intended page
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
        router.push(redirectTo);
      }
    } else if (!result.success) {
      // Handle rate limiting or other security errors
      console.error('Login security error:', result.error);
    }
    
    setIsSubmitting(false);
  }, [formData, validateForm, login, router, security]);

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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Security Status Display */}
                <SecurityStatusDisplay 
                  securityStatus={security.securityStatus}
                />

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
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-secondary-600">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/signup"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Sign up
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