import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toast, ToastProvider, useToast } from '../ToastProvider';

// Test component to use the toast hook
function TestComponent() {
  const { showSuccess, showError, showWarning, showInfo, clearAll } = useToast();

  return (
    <div>
      <button onClick={() => showSuccess('Success', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => showError('Error', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => showWarning('Warning', 'Please be careful')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Info', 'Here is some information')}>
        Show Info
      </button>
      <button onClick={clearAll}>Clear All</button>
    </div>
  );
}

describe('Toast System', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <ToastProvider>
        {component}
      </ToastProvider>
    );
  };

  describe('ToastProvider', () => {
    it('should render children without errors', () => {
      renderWithProvider(<div>Test content</div>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should provide toast context to children', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByText('Show Success')).toBeInTheDocument();
    });
  });

  describe('Toast Display', () => {
    it('should display success toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Show Success'));
      
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Operation completed')).toBeInTheDocument();
      });
    });

    it('should display error toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });

    it('should display warning toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Show Warning'));
      
      await waitFor(() => {
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(screen.getByText('Please be careful')).toBeInTheDocument();
      });
    });

    it('should display info toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Show Info'));
      
      await waitFor(() => {
        expect(screen.getByText('Info')).toBeInTheDocument();
        expect(screen.getByText('Here is some information')).toBeInTheDocument();
      });
    });
  });

  describe('Toast Interactions', () => {
    it('should close toast when close button is clicked', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Show Success'));
      
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });

    it('should auto-close non-persistent toasts', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Show Success'));
      
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      // Wait for auto-close (default 5 seconds, but we'll use a shorter timeout for testing)
      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      }, { timeout: 6000 });
    });

    it('should not auto-close persistent toasts (errors)', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      // Wait a bit and ensure it's still there
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should clear all toasts when clearAll is called', async () => {
      renderWithProvider(<TestComponent />);
      
      // Show multiple toasts
      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Clear All'));

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
        expect(screen.queryByText('Error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toast Actions', () => {
    it('should execute action when action button is clicked', async () => {
      const mockAction = jest.fn();
      
      render(
        <ToastProvider>
          <button
            onClick={() => {
              const { showToast } = useToast();
              showToast({
                type: 'info',
                title: 'Action Toast',
                message: 'Click the action',
                action: {
                  label: 'Execute',
                  onClick: mockAction,
                },
              });
            }}
          >
            Show Action Toast
          </button>
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Action Toast'));
      
      await waitFor(() => {
        expect(screen.getByText('Action Toast')).toBeInTheDocument();
      });

      const actionButton = screen.getByText('Execute');
      fireEvent.click(actionButton);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Toast Limits', () => {
    it('should respect maxToasts limit', async () => {
      render(
        <ToastProvider maxToasts={2}>
          <TestComponent />
        </ToastProvider>
      );

      // Show 3 toasts
      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));
      fireEvent.click(screen.getByText('Show Warning'));

      await waitFor(() => {
        // Should only show 2 toasts (the latest ones)
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Warning')).toBeInTheDocument();
      });
    });
  });
});