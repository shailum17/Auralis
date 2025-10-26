'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useEmailResend } from '@/hooks/useEmailResend';
import { Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailResendButtonProps {
  email: string;
  recipientName?: string;
  type: 'verification' | 'otp';
  otpType?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onResendSuccess?: (message: string) => void;
  onResendError?: (error: string) => void;
}

export function EmailResendButton({
  email,
  recipientName,
  type,
  otpType = 'login',
  variant = 'outline',
  size = 'md',
  className = '',
  onResendSuccess,
  onResendError
}: EmailResendButtonProps) {
  const {
    isResending,
    canResend,
    cooldownSeconds,
    resendCount,
    error,
    success,
    resendVerificationEmail,
    resendOTPEmail,
    clearMessages,
    getResendButtonText
  } = useEmailResend({
    cooldownDuration: 60, // 1 minute
    maxResends: 5
  });

  const handleResend = async () => {
    clearMessages();
    
    let result;
    if (type === 'verification') {
      result = await resendVerificationEmail(email, recipientName);
    } else {
      result = await resendOTPEmail(email, otpType, recipientName);
    }

    if (result.success && onResendSuccess) {
      onResendSuccess(('message' in result ? result.message : '') || 'Email sent successfully');
    } else if (!result.success && onResendError) {
      onResendError(result.error || 'Failed to send email');
    }
  };

  const getButtonIcon = () => {
    if (isResending) return <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />;
    if (cooldownSeconds > 0) return <Clock className="w-4 h-4" />;
    if (success) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (error) return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <Mail className="w-4 h-4" />;
  };

  const getButtonVariant = () => {
    if (success) return 'success';
    if (error) return 'danger';
    return variant;
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleResend}
        disabled={!canResend || isResending}
        variant={getButtonVariant()}
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        {getButtonIcon()}
        {getResendButtonText()}
      </Button>
      
      {/* Status messages */}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      {/* Resend count indicator */}
      {resendCount > 0 && (
        <div className="text-xs text-gray-500">
          Resent {resendCount} time{resendCount !== 1 ? 's' : ''}
        </div>
      )}
      
      {/* Rate limit warning */}
      {resendCount >= 3 && resendCount < 5 && (
        <div className="text-xs text-amber-600">
          ⚠️ {5 - resendCount} resend{5 - resendCount !== 1 ? 's' : ''} remaining
        </div>
      )}
      
      {resendCount >= 5 && (
        <div className="text-xs text-red-600">
          ❌ Maximum resends reached. Please contact support if you continue having issues.
        </div>
      )}
    </div>
  );
}