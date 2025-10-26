'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ValidationErrorDisplay } from '@/components/auth/ValidationErrorDisplay';
import { LoadingOverlay } from '@/components/auth/LoadingOverlay';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Clock, RotateCcw } from 'lucide-react';

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ 
  length, 
  value, 
  onChange, 
  disabled = false, 
  error = false 
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const handleChange = (index: number, inputValue: string) => {
    // Only allow numeric input
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newValue = value.split('');
      newValue[index] = numericValue;
      const updatedValue = newValue.join('').slice(0, length);
      onChange(updatedValue);
      
      // Auto-focus next input
      if (numericValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    const newValue = pastedData.slice(0, length);
    onChange(newValue);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(newValue.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex justify-center space-x-3">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            transition-colors duration-200
            ${error 
              ? 'border-red-300 bg-red-50 text-red-900' 
              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          `}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<Array<{field: string; message: string; type: 'error' | 'warning'}>>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isVerified, setIsVerified] = useState(false);

  // Rate limiting state
  const [resendAttempts, setResendAttempts] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);

  useEffect(() => {
    // Get email from session storage (set during registration)
    const verificationEmail = sessionStorage.getItem('verificationEmail');
    
    if (!verificationEmail) {
      // Redirect to signup if no email found
      router.push('/auth/signup');
      return;
    }
    
    setEmail(verificationEmail);
  }, [router]);

  // Cooldown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setErrors([]); // Clear errors when user types
    
    // Auto-submit when OTP is complete
    if (value.length === 6) {
      handleVerifyOTP(value);
    }
  };

  const handleVerifyOTP = async (otpValue: string = otp) => {
    if (otpValue.length !== 6) {
      setErrors([{
        field: 'otp',
        message: 'Please enter the complete 6-digit verification code.',
        type: 'error'
      }]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpValue
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          setErrors(result.details.map((detail: any) => ({
            field: detail.field,
            message: detail.message,
            type: 'error' as const
          })));
        } else {
          setErrors([{
            field: 'otp',
            message: result.message || 'Verification failed. Please try again.',
            type: 'error'
          }]);
        }
        return;
      }

      if (result.success) {
        setIsVerified(true);
        
        // Store tokens if provided
        if (result.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
        }
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }

        // Clear session storage
        sessionStorage.removeItem('verificationEmail');

        // Redirect to onboarding after a brief success display
        setTimeout(() => {
          router.push('/onboarding');
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrors([{
        field: 'network',
        message: 'Network error. Please check your connection and try again.',
        type: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Check rate limiting
    const now = Date.now();
    const timeSinceLastResend = lastResendTime ? now - lastResendTime : Infinity;
    const minInterval = 60000; // 1 minute between resends
    const maxAttempts = 3; // Max 3 resends per 10 minutes

    if (timeSinceLastResend < minInterval) {
      const remainingTime = Math.ceil((minInterval - timeSinceLastResend) / 1000);
      setErrors([{
        field: 'resend',
        message: `Please wait ${remainingTime} seconds before requesting another code.`,
        type: 'warning'
      }]);
      return;
    }

    if (resendAttempts >= maxAttempts) {
      setErrors([{
        field: 'resend',
        message: 'Too many resend attempts. Please try again later.',
        type: 'error'
      }]);
      return;
    }

    setIsResending(true);
    setErrors([]);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors([{
          field: 'resend',
          message: result.message || 'Failed to resend verification code.',
          type: 'error'
        }]);
        return;
      }

      if (result.success) {
        // Update rate limiting state
        setResendAttempts(prev => prev + 1);
        setLastResendTime(now);
        setResendCooldown(60); // 60 second cooldown
        


        setErrors([{
          field: 'resend',
          message: 'Verification code sent successfully!',
          type: 'warning'
        }]);
      }
    } catch (error) {
      console.error('Resend error:', error);
      setErrors([{
        field: 'resend',
        message: 'Network error. Please try again.',
        type: 'error'
      }]);
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. Redirecting you to complete your profile...
            </p>
            
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay 
        isVisible={isLoading} 
        message="Verifying your email address..."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card asMotion>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h1>
              
              <p className="text-gray-600">
                We&apos;ve sent a 6-digit verification code to
              </p>
              <p className="font-medium text-gray-900 break-all">
                {email}
              </p>
            </CardHeader>

            <CardContent>
              {/* Validation Errors Display */}
              {errors.length > 0 && (
                <ValidationErrorDisplay 
                  errors={errors} 
                  className="mb-6"
                />
              )}



              {/* OTP Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter verification code
                </label>
                <OTPInput
                  length={6}
                  value={otp}
                  onChange={handleOTPChange}
                  disabled={isLoading}
                  error={errors.some(error => error.field === 'otp')}
                />
              </div>

              {/* Verify Button */}
              <Button
                onClick={() => handleVerifyOTP()}
                disabled={otp.length !== 6 || isLoading}
                loading={isLoading}
                loadingText="Verifying..."
                className="w-full mb-4"
              >
                Verify Email
              </Button>

              {/* Resend Section */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn&apos;t receive the code?
                </p>
                
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isResending || resendAttempts >= 3}
                  loading={isResending}
                  loadingText="Sending..."
                  icon={<RotateCcw size={16} />}
                  className="text-sm"
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : resendAttempts >= 3 
                      ? 'Too many attempts'
                      : 'Resend Code'
                  }
                </Button>
                
                {resendAttempts > 0 && resendAttempts < 3 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {resendAttempts}/3 attempts used
                  </p>
                )}
              </div>

              {/* Back to Signup */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to Sign Up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}