'use client';

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackState {
  type: FeedbackType;
  title: string;
  message?: string;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  }>;
}

export interface ProcessStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface UseFeedbackReturn {
  // Basic feedback state
  feedback: FeedbackState | null;
  showFeedback: (feedback: FeedbackState) => void;
  clearFeedback: () => void;
  
  // Process tracking
  processSteps: ProcessStep[];
  setProcessSteps: (steps: ProcessStep[]) => void;
  updateStepStatus: (stepId: string, status: ProcessStep['status'], errorMessage?: string) => void;
  resetProcess: () => void;
  
  // Convenience methods
  showSuccess: (title: string, message?: string, options?: Partial<FeedbackState>) => void;
  showError: (title: string, message?: string, options?: Partial<FeedbackState>) => void;
  showWarning: (title: string, message?: string, options?: Partial<FeedbackState>) => void;
  showInfo: (title: string, message?: string, options?: Partial<FeedbackState>) => void;
  
  // Toast integration
  showToast: (type: FeedbackType, title: string, message?: string) => void;
  
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Error recovery
  lastError: Error | null;
  setError: (error: Error | null) => void;
  retryLastAction: () => void;
  setRetryAction: (action: () => void) => void;
}

export function useFeedback(): UseFeedbackReturn {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const retryActionRef = useRef<(() => void) | null>(null);
  
  const { showSuccess: toastSuccess, showError: toastError, showWarning: toastWarning, showInfo: toastInfo } = useToast();

  const showFeedback = useCallback((newFeedback: FeedbackState) => {
    setFeedback(newFeedback);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const updateStepStatus = useCallback((stepId: string, status: ProcessStep['status'], errorMessage?: string) => {
    setProcessSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, errorMessage }
        : step
    ));
  }, []);

  const resetProcess = useCallback(() => {
    setProcessSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const, errorMessage: undefined })));
  }, []);

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<FeedbackState>) => {
    showFeedback({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [showFeedback]);

  const showError = useCallback((title: string, message?: string, options?: Partial<FeedbackState>) => {
    showFeedback({
      type: 'error',
      title,
      message,
      persistent: true,
      ...options,
    });
  }, [showFeedback]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<FeedbackState>) => {
    showFeedback({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [showFeedback]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<FeedbackState>) => {
    showFeedback({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [showFeedback]);

  const showToast = useCallback((type: FeedbackType, title: string, message?: string) => {
    switch (type) {
      case 'success':
        toastSuccess(title, message);
        break;
      case 'error':
        toastError(title, message);
        break;
      case 'warning':
        toastWarning(title, message);
        break;
      case 'info':
        toastInfo(title, message);
        break;
    }
  }, [toastSuccess, toastError, toastWarning, toastInfo]);

  const setError = useCallback((error: Error | null) => {
    setLastError(error);
    if (error) {
      showError('An error occurred', error.message, {
        actions: retryActionRef.current ? [{
          label: 'Try Again',
          onClick: () => retryActionRef.current?.(),
          variant: 'primary' as const,
        }] : undefined,
      });
    }
  }, [showError]);

  const setRetryAction = useCallback((action: () => void) => {
    retryActionRef.current = action;
  }, []);

  const retryLastAction = useCallback(() => {
    if (retryActionRef.current) {
      clearFeedback();
      setLastError(null);
      retryActionRef.current();
    }
  }, [clearFeedback]);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      clearFeedback();
    }
  }, [clearFeedback]);

  return {
    feedback,
    showFeedback,
    clearFeedback,
    processSteps,
    setProcessSteps,
    updateStepStatus,
    resetProcess,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    isLoading,
    setLoading,
    lastError,
    setError,
    retryLastAction,
    setRetryAction,
  };
}

// Helper hook for form feedback
export function useFormFeedback() {
  const feedback = useFeedback();
  
  const handleFormError = useCallback((error: any, fieldErrors?: Record<string, string>) => {
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const firstError = Object.entries(fieldErrors)[0];
      feedback.showError(
        'Validation Error',
        `${firstError[0]}: ${firstError[1]}`,
        {
          actions: [{
            label: 'Fix Errors',
            onClick: () => {
              // Focus on first error field
              const field = document.querySelector(`[name="${firstError[0]}"]`) as HTMLElement;
              field?.focus();
            },
            variant: 'outline',
          }],
        }
      );
    } else if (error?.message) {
      feedback.showError('Submission Failed', error.message);
    } else {
      feedback.showError('Submission Failed', 'Please check your input and try again.');
    }
  }, [feedback]);

  const handleFormSuccess = useCallback((message: string, nextAction?: { label: string; onClick: () => void }) => {
    feedback.showSuccess(
      'Success!',
      message,
      {
        actions: nextAction ? [nextAction] : undefined,
      }
    );
  }, [feedback]);

  return {
    ...feedback,
    handleFormError,
    handleFormSuccess,
  };
}

// Helper hook for async operations
export function useAsyncFeedback() {
  const feedback = useFeedback();
  
  const executeAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<T | null> => {
    try {
      feedback.setLoading(true);
      if (options?.loadingMessage) {
        feedback.showInfo('Loading', options.loadingMessage);
      }
      
      const result = await operation();
      
      feedback.setLoading(false);
      feedback.clearFeedback();
      
      if (options?.successMessage) {
        feedback.showSuccess('Success', options.successMessage);
      }
      
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      feedback.setLoading(false);
      const errorObj = error instanceof Error ? error : new Error('An unexpected error occurred');
      
      feedback.setError(errorObj);
      feedback.setRetryAction(() => executeAsync(operation, options));
      
      if (options?.errorMessage) {
        feedback.showError('Error', options.errorMessage);
      }
      
      options?.onError?.(errorObj);
      return null;
    }
  }, [feedback]);

  return {
    ...feedback,
    executeAsync,
  };
}