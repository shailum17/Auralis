import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LoadingSpinner, LoadingOverlay, LoadingState } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Basic Rendering', () => {
    it('should render loading spinner', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('should render with custom label', () => {
      render(<LoadingSpinner label="Processing..." />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Processing...');
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should apply size variants correctly', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      let spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass('w-4', 'h-4');

      rerender(<LoadingSpinner size="lg" />);
      spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('should apply color variants correctly', () => {
      const { rerender } = render(<LoadingSpinner variant="primary" />);
      let spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass('border-primary-200', 'border-t-primary-600');

      rerender(<LoadingSpinner variant="success" />);
      spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass('border-success-200', 'border-t-success-600');
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      
      const spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass('custom-class');
    });
  });
});

describe('LoadingOverlay', () => {
  describe('Visibility', () => {
    it('should render when visible', () => {
      render(<LoadingOverlay isVisible={true} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render when not visible', () => {
      render(<LoadingOverlay isVisible={false} />);
      
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render with custom message', () => {
      render(<LoadingOverlay isVisible={true} message="Saving data..." />);
      
      expect(screen.getByText('Saving data...')).toBeInTheDocument();
    });
  });

  describe('Backdrop', () => {
    it('should render backdrop by default', () => {
      render(<LoadingOverlay isVisible={true} />);
      
      const overlay = screen.getByText('Loading...').closest('div')?.parentElement;
      expect(overlay).toHaveClass('bg-black/20', 'backdrop-blur-sm');
    });

    it('should not render backdrop when disabled', () => {
      render(<LoadingOverlay isVisible={true} backdrop={false} />);
      
      const overlay = screen.getByText('Loading...').closest('div')?.parentElement;
      expect(overlay).not.toHaveClass('bg-black/20', 'backdrop-blur-sm');
    });
  });

  describe('Spinner Configuration', () => {
    it('should pass size and variant to spinner', () => {
      render(<LoadingOverlay isVisible={true} size="lg" variant="success" />);
      
      const spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass('w-8', 'h-8');
      expect(spinner).toHaveClass('border-success-200', 'border-t-success-600');
    });
  });
});

describe('LoadingState', () => {
  const TestContent = () => <div>Test Content</div>;
  const CustomFallback = () => <div>Custom Loading...</div>;

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      render(
        <LoadingState isLoading={true}>
          <TestContent />
        </LoadingState>
      );
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('should show children when not loading', () => {
      render(
        <LoadingState isLoading={false}>
          <TestContent />
        </LoadingState>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should show custom fallback when loading', () => {
      render(
        <LoadingState isLoading={true} fallback={<CustomFallback />}>
          <TestContent />
        </LoadingState>
      );
      
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });
  });

  describe('Spinner Configuration', () => {
    it('should pass size and variant to default spinner', () => {
      render(
        <LoadingState isLoading={true} size="lg" variant="error">
          <TestContent />
        </LoadingState>
      );
      
      const spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass('w-8', 'h-8');
      expect(spinner).toHaveClass('border-error-200', 'border-t-error-600');
    });

    it('should apply custom className to container', () => {
      render(
        <LoadingState isLoading={true} className="custom-loading">
          <TestContent />
        </LoadingState>
      );
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('custom-loading');
    });
  });

  describe('Transitions', () => {
    it('should handle loading state transitions smoothly', async () => {
      const { rerender } = render(
        <LoadingState isLoading={true}>
          <TestContent />
        </LoadingState>
      );
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      rerender(
        <LoadingState isLoading={false}>
          <TestContent />
        </LoadingState>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <LoadingState isLoading={true}>
          <TestContent />
        </LoadingState>
      );
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('should announce loading state to screen readers', () => {
      render(
        <LoadingState isLoading={true}>
          <TestContent />
        </LoadingState>
      );
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });
  });
});