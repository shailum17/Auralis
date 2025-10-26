import { useState, useCallback, useEffect } from 'react';
import { authAPI } from '@/lib/auth-api';

interface EmailResendState {
  isResending: boolean;
  canResend: boolean;
  cooldownSeconds: number;
  lastResendTime: number | null;
  resendCount: number;
  error: string | null;
  success: string | null;
}

interface UseEmailResendOptions {
  cooldownDuration?: number; // seconds
  maxResends?: number;
  resetCooldownOnSuccess?: boolean;
}

export function useEmailResend(options: UseEmailResendOptions = {}) {
  const {
    cooldownDuration = 60, // 1 minute default
    maxResends = 5,
    resetCooldownOnSuccess = true
  } = options;

  const [state, setState] = useState<EmailResendState>({
    isResending: false,
    canResend: true,
    cooldownSeconds: 0,
    lastResendTime: null,
    resendCount: 0,
    error: null,
    success: null
  });

  // Update cooldown timer
  useEffect(() => {
    if (state.cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setState(prev => {
          const newCooldown = prev.cooldownSeconds - 1;
          return {
            ...prev,
            cooldownSeconds: newCooldown,
            canResend: newCooldown <= 0 && prev.resendCount < maxResends
          };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.cooldownSeconds, maxResends]);

  const startCooldown = useCallback(() => {
    setState(prev => ({
      ...prev,
      cooldownSeconds: cooldownDuration,
      canResend: false,
      lastResendTime: Date.now()
    }));
  }, [cooldownDuration]);

  const resendVerificationEmail = useCallback(async (email: string, recipientName?: string) => {
    if (!state.canResend || state.isResending) {
      return { success: false, error: 'Cannot resend at this time' };
    }

    setState(prev => ({
      ...prev,
      isResending: true,
      error: null,
      success: null
    }));

    try {
      const result = await authAPI.resendVerificationEmail(email, recipientName);
      
      setState(prev => ({
        ...prev,
        isResending: false,
        resendCount: prev.resendCount + 1,
        error: result.error || null,
        success: result.success ? result.message : null
      }));

      if (result.success) {
        startCooldown();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend email';
      setState(prev => ({
        ...prev,
        isResending: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  }, [state.canResend, state.isResending, startCooldown]);

  const resendOTPEmail = useCallback(async (email: string, type: string, recipientName?: string) => {
    if (!state.canResend || state.isResending) {
      return { success: false, error: 'Cannot resend at this time' };
    }

    setState(prev => ({
      ...prev,
      isResending: true,
      error: null,
      success: null
    }));

    try {
      const result = await authAPI.resendOTPEmail(email, type, recipientName);
      
      setState(prev => ({
        ...prev,
        isResending: false,
        resendCount: prev.resendCount + 1,
        error: result.error || null,
        success: result.success ? result.message : null
      }));

      if (result.success) {
        startCooldown();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
      setState(prev => ({
        ...prev,
        isResending: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  }, [state.canResend, state.isResending, startCooldown]);

  const reset = useCallback(() => {
    setState({
      isResending: false,
      canResend: true,
      cooldownSeconds: 0,
      lastResendTime: null,
      resendCount: 0,
      error: null,
      success: null
    });
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      success: null
    }));
  }, []);

  return {
    ...state,
    resendVerificationEmail,
    resendOTPEmail,
    reset,
    clearMessages,
    getRemainingCooldown: () => state.cooldownSeconds,
    getResendButtonText: () => {
      if (state.isResending) return 'Sending...';
      if (state.cooldownSeconds > 0) return `Resend in ${state.cooldownSeconds}s`;
      if (state.resendCount >= maxResends) return 'Max resends reached';
      return 'Resend Email';
    }
  };
}