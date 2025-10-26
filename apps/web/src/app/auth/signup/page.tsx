'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthValidationRules, FormValidator } from '@/lib/form-validation';
import { authUtils } from '@/lib/auth-utils';
import { authValidationService } from '@/lib/auth-validation';
import { ValidationErrorDisplay } from '@/components/auth/ValidationErrorDisplay';
import { LoadingOverlay } from '@/components/auth/LoadingOverlay';
import { useRouter } from 'next/navigation';
import { RegisterData, PasswordStrength } from '@/types/auth';
import { FormStepIndicator } from '@/components/auth/FormStepIndicator';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';

interface FormStep {
  id: string;
  title: string;
  description: string;
}

const FORM_STEPS: FormStep[] = [
  {
    id: 'account',
    title: 'Create Account',
    description: 'Enter your email and choose a username'
  },
  {
    id: 'password',
    title: 'Secure Password',
    description: 'Create a strong password for your account'
  },
  {
    id: 'personal',
    title: 'Personal Info',
    description: 'Tell us a bit about yourself'
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    description: 'Review and accept our terms'
  }
];

export default function SignUpPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    bio: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [validatingFields, setValidatingFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Array<{field: string; message: string; type?: 'error' | 'warning'}>>([]);

  const validateField = async (fieldName: keyof RegisterData, value: string | boolean) => {
    if (typeof value !== 'string') return true;

    setValidatingFields(prev => new Set(prev).add(fieldName));

    try {
      let result;
      
      switch (fieldName) {
        case 'email':
          result = await authValidationService.validateEmail(value);
          break;
        case 'username':
          result = await authValidationService.validateUsername(value);
          break;
        case 'password':
          result = authValidationService.validatePassword(value);
          break;
        case 'confirmPassword':
          result = authValidationService.validatePasswordConfirmation(formData.password, value);
          break;
        case 'fullName':
          result = authValidationService.validateFullName(value);
          break;
        default:
          return true;
      }

      // Update errors
      if (!result.isValid) {
        setErrors(prev => ({ ...prev, [fieldName]: result.errors[0] }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      // Update warnings
      if (result.warnings.length > 0) {
        setWarnings(prev => ({ ...prev, [fieldName]: result.warnings[0] }));
      } else {
        setWarnings(prev => {
          const newWarnings = { ...prev };
          delete newWarnings[fieldName];
          return newWarnings;
        });
      }

      // Update validation errors for display
      const newValidationErrors: Array<{field: string; message: string; type: 'error' | 'warning'}> = [];
      if (!result.isValid) {
        newValidationErrors.push({
          field: fieldName,
          message: result.errors[0],
          type: 'error' as const
        });
      }
      if (result.warnings.length > 0) {
        newValidationErrors.push({
          field: fieldName,
          message: result.warnings[0],
          type: 'warning' as const
        });
      }

      setValidationErrors(prev => {
        const filtered = prev.filter(err => err.field !== fieldName);
        return [...filtered, ...newValidationErrors];
      });

      return result.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return true; // Fail open
    } finally {
      setValidatingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  const handleInputChange = (fieldName: keyof RegisterData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (touchedFields.has(fieldName) && typeof value === 'string') {
      validateField(fieldName, value);
    }

    // Update password strength for password field
    if (fieldName === 'password' && typeof value === 'string') {
      const strength = authUtils.validatePassword(value);
      setPasswordStrength(strength);
    }

    // Revalidate confirm password when password changes
    if (fieldName === 'password' && formData.confirmPassword && touchedFields.has('confirmPassword')) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  const handleFieldBlur = async (fieldName: keyof RegisterData) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    const value = formData[fieldName];
    if (typeof value === 'string') {
      await validateField(fieldName, value);
    }
  };

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Account step
        return Boolean(
          formData.email && 
          formData.username && 
          !errors.email && 
          !errors.username &&
          touchedFields.has('email') &&
          touchedFields.has('username')
        );
      case 1: // Password step
        return Boolean(
          formData.password && 
          formData.confirmPassword && 
          !errors.password && 
          !errors.confirmPassword &&
          touchedFields.has('password') &&
          touchedFields.has('confirmPassword')
        );
      case 2: // Personal info step
        return Boolean(
          formData.fullName && 
          !errors.fullName &&
          touchedFields.has('fullName')
        );
      case 3: // Terms step
        return Boolean(formData.acceptTerms);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < FORM_STEPS.length - 1 && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid(3)) return;

    setIsLoading(true);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          // Handle validation errors
          const newErrors = result.details.map((detail: any) => ({
            field: detail.field,
            message: detail.message,
            type: 'error' as const
          }));
          setValidationErrors(newErrors);
        } else {
          // Handle general errors
          setValidationErrors([{
            field: 'general',
            message: result.message || 'Registration failed. Please try again.',
            type: 'error' as const
          }]);
        }
        return;
      }

      if (result.success) {
        // Store email for verification page
        sessionStorage.setItem('verificationEmail', result.verificationEmail);
        


        // Redirect to email verification
        router.push('/auth/verify-email');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setValidationErrors([{
        field: 'network',
        message: 'Network error. Please check your connection and try again.',
        type: 'error' as const
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                error={touchedFields.has('email') ? errors.email : undefined}
                helperText={touchedFields.has('email') && warnings.email ? warnings.email : undefined}
                required
                autoComplete="email"
                disabled={validatingFields.has('email')}
              />
              {validatingFields.has('email') && (
                <div className="absolute right-3 top-8">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <Input
                type="text"
                label="Username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleFieldBlur('username')}
                error={touchedFields.has('username') ? errors.username : undefined}
                helperText={touchedFields.has('username') && warnings.username ? warnings.username : undefined}
                required
                autoComplete="username"
                disabled={validatingFields.has('username')}
              />
              {validatingFields.has('username') && (
                <div className="absolute right-3 top-8">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleFieldBlur('password')}
                error={touchedFields.has('password') ? errors.password : undefined}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {passwordStrength && formData.password && (
              <PasswordStrengthIndicator 
                strength={passwordStrength} 
                password={formData.password} 
              />
            )}

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleFieldBlur('confirmPassword')}
                error={touchedFields.has('confirmPassword') ? errors.confirmPassword : undefined}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleFieldBlur('fullName')}
                error={touchedFields.has('fullName') ? errors.fullName : undefined}
                helperText={touchedFields.has('fullName') && warnings.fullName ? warnings.fullName : undefined}
                required
                autoComplete="name"
                disabled={validatingFields.has('fullName')}
              />
              {validatingFields.has('fullName') && (
                <div className="absolute right-3 top-8">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={3}
                placeholder="Tell us a bit about yourself..."
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.bio || '').length}/500 characters
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Terms and Conditions</h4>
              <p className="text-sm text-gray-600 mb-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy. 
                We are committed to protecting your privacy and ensuring a safe learning environment.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Your data will be used to personalize your learning experience</p>
                <p>• We will never share your personal information without consent</p>
                <p>• You can delete your account and data at any time</p>
                <p>• You must be at least 13 years old to use this service</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={isLoading} 
        message="Please wait while we create your account and send verification email..."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Progress Indicator */}
          <FormStepIndicator 
            steps={FORM_STEPS} 
            currentStep={currentStep} 
            className="mb-8"
          />

          <Card asMotion>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-primary-600" />
              </div>
            </CardHeader>

            <CardContent>
              {/* Validation Errors Display */}
              {validationErrors.length > 0 && (
                <ValidationErrorDisplay 
                  errors={validationErrors} 
                  className="mb-6"
                />
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  icon={<ArrowLeft size={16} />}
                  iconPosition="left"
                >
                  Previous
                </Button>

                {currentStep < FORM_STEPS.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                    icon={<ArrowRight size={16} />}
                    iconPosition="right"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepValid(currentStep)}
                    loading={isLoading}
                    loadingText="Creating Account..."
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}