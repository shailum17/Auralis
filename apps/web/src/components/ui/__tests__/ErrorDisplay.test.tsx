import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorDisplay, createError, ErrorType, ErrorInfo } from '../ErrorDisplay';

describe('ErrorDisplay', () => {
  const mockError: ErrorInfo = {
    type: 'network' as ErrorType,
    title: 'Connection Error',
    message: 'Unable to connect to server',
    code: 'NET_001',
    details: 'The server is currently unavailable. Please try again later.',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Contact support if the problem persists',
    ],
    retryable: true,
  };

  describe('Basic Rendering', () => {
    it('should render error title and message', () => {
      render(<ErrorDisplay error={mockError} />);
      
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to server')).toBeInTheDocument();
    });

    it('should render error code when provided', () => {
      render(<ErrorDisplay error={mockError} />);
      
      expect(screen.getByText('Error Code: NET_001')).toBeInTheDocument();
    });

    it('should render appropriate icon for error type', () => {
      render(<ErrorDisplay error={mockError} />);
      
      // Check for network error icon (AlertTriangle)
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode', () => {
      render(<ErrorDisplay error={mockError} compact />);
      
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to server')).toBeInTheDocument();
    });

    it('should show dismiss button in compact mode when dismissible', () => {
      const mockDismiss = jest.fn();
      const errorWithDismiss = { ...mockError, onDismiss: mockDismiss };
      
      render(<ErrorDisplay error={errorWithDismiss} compact />);
      
      const dismissButton = screen.getByRole('button');
      fireEvent.click(dismissButton);
      
      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Expandable Details', () => {
    it('should show expandable details when available', () => {
      render(<ErrorDisplay error={mockError} />);
      
      const moreDetailsButton = screen.getByText('More Details');
      expect(moreDetailsButton).toBeInTheDocument();
    });

    it('should expand details when More Details is clicked', async () => {
      render(<ErrorDisplay error={mockError} />);
      
      const moreDetailsButton = screen.getByText('More Details');
      fireEvent.click(moreDetailsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Details:')).toBeInTheDocument();
        expect(screen.getByText(mockError.details!)).toBeInTheDocument();
      });
    });

    it('should show suggestions when expanded', async () => {
      render(<ErrorDisplay error={mockError} />);
      
      const moreDetailsButton = screen.getByText('More Details');
      fireEvent.click(moreDetailsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Suggestions:')).toBeInTheDocument();
        mockError.suggestions!.forEach(suggestion => {
          expect(screen.getByText(suggestion)).toBeInTheDocument();
        });
      });
    });

    it('should show details by default when showDetails is true', () => {
      render(<ErrorDisplay error={mockError} showDetails />);
      
      expect(screen.getByText('Details:')).toBeInTheDocument();
      expect(screen.getByText(mockError.details!)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should show retry button when error is retryable', () => {
      const mockRetry = jest.fn();
      const retryableError = { ...mockError, onRetry: mockRetry };
      
      render(<ErrorDisplay error={retryableError} />);
      
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const mockRetry = jest.fn();
      const retryableError = { ...mockError, onRetry: mockRetry };
      
      render(<ErrorDisplay error={retryableError} />);
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should show dismiss button when onDismiss is provided', () => {
      const mockDismiss = jest.fn();
      const dismissibleError = { ...mockError, onDismiss: mockDismiss };
      
      render(<ErrorDisplay error={dismissibleError} />);
      
      const dismissButton = screen.getByText('Dismiss');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const mockDismiss = jest.fn();
      const dismissibleError = { ...mockError, onDismiss: mockDismiss };
      
      render(<ErrorDisplay error={dismissibleError} />);
      
      const dismissButton = screen.getByText('Dismiss');
      fireEvent.click(dismissButton);
      
      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Types', () => {
    const errorTypes: ErrorType[] = ['network', 'validation', 'server', 'authentication', 'permission', 'generic'];

    errorTypes.forEach(type => {
      it(`should render ${type} error correctly`, () => {
        const error = createError(type, `${type} error`, `This is a ${type} error`);
        render(<ErrorDisplay error={error} />);
        
        expect(screen.getByText(`${type} error`)).toBeInTheDocument();
        expect(screen.getByText(`This is a ${type} error`)).toBeInTheDocument();
      });
    });
  });

  describe('createError Helper', () => {
    it('should create error with default title and message', () => {
      const error = createError('network');
      
      expect(error.type).toBe('network');
      expect(error.title).toBe('Connection Error');
      expect(error.message).toBe('Unable to connect to the server. Please check your internet connection.');
    });

    it('should create error with custom title and message', () => {
      const error = createError('validation', 'Custom Title', 'Custom message');
      
      expect(error.type).toBe('validation');
      expect(error.title).toBe('Custom Title');
      expect(error.message).toBe('Custom message');
    });

    it('should create error with additional options', () => {
      const mockRetry = jest.fn();
      const error = createError('server', 'Server Error', 'Server is down', {
        code: 'SRV_500',
        retryable: true,
        onRetry: mockRetry,
      });
      
      expect(error.code).toBe('SRV_500');
      expect(error.retryable).toBe(true);
      expect(error.onRetry).toBe(mockRetry);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ErrorDisplay error={mockError} />);
      
      // Check for proper role and accessibility
      const errorContainer = screen.getByRole('alert', { hidden: true });
      expect(errorContainer).toBeInTheDocument();
    });

    it('should support keyboard navigation for interactive elements', () => {
      const mockRetry = jest.fn();
      const retryableError = { ...mockError, onRetry: mockRetry };
      
      render(<ErrorDisplay error={retryableError} />);
      
      const retryButton = screen.getByText('Try Again');
      retryButton.focus();
      
      expect(document.activeElement).toBe(retryButton);
    });
  });
});