import { renderHook, act } from '@testing-library/react';
import { useFeedback, useFormFeedback, useAsyncFeedback } from '../useFeedback';

// Mock the useToast hook
jest.mock('@/components/ui', () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: jest.fn(),
    showInfo: jest.fn(),
  }),
}));

describe('useFeedback', () => {
  describe('Basic Feedback State', () => {
    it('should initialize with no feedback', () => {
      const { result } = renderHook(() => useFeedback());
      
      expect(result.current.feedback).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lastError).toBeNull();
    });

    it('should show and clear feedback', () => {
      const { result } = renderHook(() => useFeedback());
      
      act(() => {
        result.current.showFeedback({
          type: 'success',
          title: 'Success',
          message: 'Operation completed',
        });
      });
      
      expect(result.current.feedback).toEqual({
        type: 'success',
        title: 'Success',
        message: 'Operation completed',
      });
      
      act(() => {
        result.current.clearFeedback();
      });
      
      expect(result.current.feedback).toBeNull();
    });
  });

  describe('Convenience Methods', () => {
    it('should show success feedback', () => {
      const { result } = renderHook(() => useFeedback());
      
      act(() => {
        result.current.showSuccess('Success Title', 'Success message');
      });
      
      expect(result.current.feedback).toEqual({
        type: 'success',
        title: 'Success Title',
        message: 'Success message',
      });
    });

    it('should show error feedback with persistent flag', () => {
      const { result } = renderHook(() => useFeedback());
      
      act(() => {
        result.current.showError('Error Title', 'Error message');
      });
      
      expect(result.current.feedback).toEqual({
        type: 'error',
        title: 'Error Title',
        message: 'Error message',
        persistent: true,
      });
    });

    it('should show warning feedback', () => {
      const { result } = renderHook(() => useFeedback());
      
      act(() => {
        result.current.showWarning('Warning Title', 'Warning message');
      });
      
      expect(result.current.feedback).toEqual({
        type: 'warning',
        title: 'Warning Title',
        message: 'Warning message',
      });
    });

    it('should show info feedback', () => {
      const { result } = renderHook(() => useFeedback());
      
      act(() => {
        result.current.showInfo('Info Title', 'Info message');
      });
      
      expect(result.current.feedback).toEqual({
        type: 'info',
        title: 'Info Title',
        message: 'Info message',
      });
    });
  });

  describe('Process Steps', () => {
    it('should manage process steps', () => {
      const { result } = renderHook(() => useFeedback());
      
      const steps = [
        { id: 'step1', title: 'Step 1', status: 'pending' as const },
        { id: 'step2', title: 'Step 2', status: 'pending' as const },
      ];
      
      act(() => {
        result.current.setProcessSteps(steps);
      });
      
      expect(result.current.processSteps).toEqual(steps);
    });

    it('should update step status', () => {
      const { result } = renderHook(() => useFeedback());
      
      const steps = [
        { id: 'step1', title: 'Step 1', status: 'pending' as const },
        { id: 'step2', title: 'Step 2', status: 'pending' as const },
      ];
      
      act(() => {
        result.current.setProcessSteps(steps);
      });
      
      act(() => {
        result.current.updateStepStatus('step1', 'completed');
      });
      
      expect(result.current.processSteps[0].status).toBe('completed');
      expect(result.current.processSteps[1].status).toBe('pending');
    });

    it('should update step status with error message', () => {
      const { result } = renderHook(() => useFeedback());
      
      const steps = [
        { id: 'step1', title: 'Step 1', status: 'pending' as const },
      ];
      
      act(() => {
        result.current.setProcessSteps(steps);
      });
      
      act(() => {
        result.current.updateStepStatus('step1', 'error', 'Something went wrong');
      });
      
      expect(result.current.processSteps[0].status).toBe('error');
      expect(result.current.processSteps[0].errorMessage).toBe('Something went wrong');
    });

    it('should reset process steps', () => {
      const { result } = renderHook(() => useFeedback());
      
      const steps = [
        { id: 'step1', title: 'Step 1', status: 'completed' as const, errorMessage: 'Error' },
      ];
      
      act(() => {
        result.current.setProcessSteps(steps);
      });
      
      act(() => {
        result.current.resetProcess();
      });
      
      expect(result.current.processSteps[0].status).toBe('pending');
      expect(result.current.processSteps[0].errorMessage).toBeUndefined();
    });
  });

  describe('Loading State', () => {
    it('should manage loading state', () => {
      const { result } = renderHook(() => useFeedback());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.feedback).toBeNull(); // Should clear feedback when loading
      
      act(() => {
        result.current.setLoading(false);
      });
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set and clear errors', () => {
      const { result } = renderHook(() => useFeedback());
      
      const error = new Error('Test error');
      
      act(() => {
        result.current.setError(error);
      });
      
      expect(result.current.lastError).toBe(error);
      expect(result.current.feedback?.type).toBe('error');
      
      act(() => {
        result.current.setError(null);
      });
      
      expect(result.current.lastError).toBeNull();
    });

    it('should set retry action and execute it', () => {
      const { result } = renderHook(() => useFeedback());
      
      const mockRetryAction = jest.fn();
      
      act(() => {
        result.current.setRetryAction(mockRetryAction);
      });
      
      act(() => {
        result.current.retryLastAction();
      });
      
      expect(mockRetryAction).toHaveBeenCalledTimes(1);
      expect(result.current.feedback).toBeNull(); // Should clear feedback on retry
      expect(result.current.lastError).toBeNull(); // Should clear error on retry
    });
  });
});

describe('useFormFeedback', () => {
  it('should handle form errors with field errors', () => {
    const { result } = renderHook(() => useFormFeedback());
    
    const fieldErrors = {
      email: 'Invalid email format',
      password: 'Password too short',
    };
    
    act(() => {
      result.current.handleFormError(null, fieldErrors);
    });
    
    expect(result.current.feedback?.type).toBe('error');
    expect(result.current.feedback?.title).toBe('Validation Error');
    expect(result.current.feedback?.message).toContain('email: Invalid email format');
  });

  it('should handle form errors with error message', () => {
    const { result } = renderHook(() => useFormFeedback());
    
    const error = { message: 'Server error occurred' };
    
    act(() => {
      result.current.handleFormError(error);
    });
    
    expect(result.current.feedback?.type).toBe('error');
    expect(result.current.feedback?.title).toBe('Submission Failed');
    expect(result.current.feedback?.message).toBe('Server error occurred');
  });

  it('should handle form success', () => {
    const { result } = renderHook(() => useFormFeedback());
    
    const mockNextAction = jest.fn();
    
    act(() => {
      result.current.handleFormSuccess('Form submitted successfully', {
        label: 'Continue',
        onClick: mockNextAction,
      });
    });
    
    expect(result.current.feedback?.type).toBe('success');
    expect(result.current.feedback?.title).toBe('Success!');
    expect(result.current.feedback?.message).toBe('Form submitted successfully');
    expect(result.current.feedback?.actions).toHaveLength(1);
  });
});

describe('useAsyncFeedback', () => {
  it('should execute async operation successfully', async () => {
    const { result } = renderHook(() => useAsyncFeedback());
    
    const mockOperation = jest.fn().mockResolvedValue('success result');
    const mockOnSuccess = jest.fn();
    
    let operationResult;
    
    await act(async () => {
      operationResult = await result.current.executeAsync(mockOperation, {
        loadingMessage: 'Processing...',
        successMessage: 'Operation completed',
        onSuccess: mockOnSuccess,
      });
    });
    
    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).toHaveBeenCalledWith('success result');
    expect(operationResult).toBe('success result');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle async operation failure', async () => {
    const { result } = renderHook(() => useAsyncFeedback());
    
    const error = new Error('Operation failed');
    const mockOperation = jest.fn().mockRejectedValue(error);
    const mockOnError = jest.fn();
    
    let operationResult;
    
    await act(async () => {
      operationResult = await result.current.executeAsync(mockOperation, {
        errorMessage: 'Operation failed',
        onError: mockOnError,
      });
    });
    
    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(error);
    expect(operationResult).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.lastError).toBe(error);
  });

  it('should set up retry action for failed operations', async () => {
    const { result } = renderHook(() => useAsyncFeedback());
    
    const error = new Error('Operation failed');
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success on retry');
    
    // First call fails
    await act(async () => {
      await result.current.executeAsync(mockOperation);
    });
    
    expect(result.current.lastError).toBe(error);
    
    // Retry should work
    await act(async () => {
      result.current.retryLastAction();
    });
    
    expect(mockOperation).toHaveBeenCalledTimes(2);
  });
});