import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailDeliveryStatus } from '../EmailDeliveryStatus';
import { authAPI } from '@/lib/auth-api';

// Mock the auth API
jest.mock('@/lib/auth-api');
const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  CheckCircle: ({ className }: { className?: string }) => <div data-testid="check-circle" className={className} />,
  Clock: ({ className }: { className?: string }) => <div data-testid="clock" className={className} />,
  AlertCircle: ({ className }: { className?: string }) => <div data-testid="alert-circle" className={className} />,
  XCircle: ({ className }: { className?: string }) => <div data-testid="x-circle" className={className} />,
  Mail: ({ className }: { className?: string }) => <div data-testid="mail" className={className} />,
}));

describe('EmailDeliveryStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering without emailId', () => {
    it('should render nothing when no emailId and showDetails is false', () => {
      const { container } = render(
        <EmailDeliveryStatus
          email="test@example.com"
          showDetails={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render unknown status when no emailId and showDetails is true', () => {
      render(
        <EmailDeliveryStatus
          email="test@example.com"
          showDetails={true}
        />
      );

      expect(screen.getByText('Email status unknown')).toBeInTheDocument();
      expect(screen.getByTestId('mail')).toBeInTheDocument();
    });
  });

  describe('Delivery Status Fetching', () => {
    it('should fetch and display delivered status', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: true,
        status: 'delivered',
        deliveredAt: '2023-12-01T10:00:00Z',
      });

      render(
        <EmailDeliveryStatus
          emailId="email-123"
          email="test@example.com"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Email delivered successfully')).toBeInTheDocument();
        expect(screen.getByTestId('check-circle')).toBeInTheDocument();
      });

      expect(mockAuthAPI.getEmailDeliveryStatus).toHaveBeenCalledWith('email-123');
    });

    it('should display pending status', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: true,
        status: 'pending',
      });

      render(
        <EmailDeliveryStatus
          emailId="email-456"
          email="test@example.com"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Email delivery in progress')).toBeInTheDocument();
        expect(screen.getByTestId('clock')).toBeInTheDocument();
      });
    });

    it('should display failed status with help text', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: true,
        status: 'failed',
      });

      render(
        <EmailDeliveryStatus
          emailId="email-789"
          email="test@example.com"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Email delivery failed')).toBeInTheDocument();
        expect(screen.getByTestId('x-circle')).toBeInTheDocument();
        expect(screen.getByText(/check your spam folder/)).toBeInTheDocument();
      });
    });

    it('should display bounced status with help text', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: true,
        status: 'bounced',
      });

      render(
        <EmailDeliveryStatus
          emailId="email-bounced"
          email="test@example.com"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Email bounced')).toBeInTheDocument();
        expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
        expect(screen.getByText(/verify your email address/)).toBeInTheDocument();
      });
    });

    it('should handle API errors', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: false,
        error: 'API Error',
      });

      render(
        <EmailDeliveryStatus
          emailId="email-error"
          email="test@example.com"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Email status unknown')).toBeInTheDocument();
        expect(screen.getByText('Error: API Error')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockRejectedValue(new Error('Network error'));

      render(
        <EmailDeliveryStatus
          emailId="email-network-error"
          email="test@example.com"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Email status unknown')).toBeInTheDocument();
        expect(screen.getByText('Error: Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, status: 'delivered' }), 100))
      );

      render(
        <EmailDeliveryStatus
          emailId="email-loading"
          email="test@example.com"
        />
      );

      // Should show loading spinner initially
      expect(screen.getByRole('generic')).toHaveClass('animate-spin');

      await waitFor(() => {
        expect(screen.getByText('Email delivered successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Details Display', () => {
    it('should show email details when showDetails is true', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: true,
        status: 'delivered',
        deliveredAt: '2023-12-01T10:00:00Z',
      });

      render(
        <EmailDeliveryStatus
          emailId="email-details"
          email="user@example.com"
          showDetails={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('To: user@example.com')).toBeInTheDocument();
        expect(screen.getByText(/Delivered:/)).toBeInTheDocument();
        expect(screen.getByText(/ID: email-de/)).toBeInTheDocument();
      });
    });

    it('should not show details when showDetails is false', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: true,
        status: 'delivered',
        deliveredAt: '2023-12-01T10:00:00Z',
      });

      render(
        <EmailDeliveryStatus
          emailId="email-no-details"
          email="user@example.com"
          showDetails={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Email delivered successfully')).toBeInTheDocument();
        expect(screen.queryByText('To: user@example.com')).not.toBeInTheDocument();
      });
    });

    it('should format delivery date correctly', async () => {
      const deliveryDate = '2023-12-01T15:30:00Z';
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: true,
        status: 'delivered',
        deliveredAt: deliveryDate,
      });

      render(
        <EmailDeliveryStatus
          emailId="email-date"
          email="test@example.com"
        />
      );

      await waitFor(() => {
        const formattedDate = new Date(deliveryDate).toLocaleString();
        expect(screen.getByText(`Delivered: ${formattedDate}`)).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should show refresh button when emailId is provided', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: true,
        status: 'delivered',
      });

      render(
        <EmailDeliveryStatus
          emailId="email-refresh"
          email="test@example.com"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });
    });

    it('should not show refresh button when no emailId', () => {
      render(
        <EmailDeliveryStatus
          email="test@example.com"
        />
      );

      expect(screen.queryByText('Refresh')).not.toBeInTheDocument();
    });

    it('should refetch status when refresh is clicked', async () => {
      mockAuthAPI.getEmailDeliveryStatus
        .mockResolvedValueOnce({
          success: true,
          status: 'pending',
        })
        .mockResolvedValueOnce({
          success: true,
          status: 'delivered',
        });

      render(
        <EmailDeliveryStatus
          emailId="email-refresh-test"
          email="test@example.com"
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Email delivery in progress')).toBeInTheDocument();
      });

      // Click refresh
      fireEvent.click(screen.getByText('Refresh'));

      // Wait for updated status
      await waitFor(() => {
        expect(screen.getByText('Email delivered successfully')).toBeInTheDocument();
      });

      expect(mockAuthAPI.getEmailDeliveryStatus).toHaveBeenCalledTimes(2);
    });

    it('should disable refresh button while loading', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, status: 'delivered' }), 100))
      );

      render(
        <EmailDeliveryStatus
          emailId="email-refresh-loading"
          email="test@example.com"
        />
      );

      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByText('Email delivered successfully')).toBeInTheDocument();
      });

      // Start another refresh
      fireEvent.click(screen.getByText('Refresh'));

      // Button should be disabled during loading
      expect(screen.getByText('Refresh')).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Refresh')).not.toBeDisabled();
      });
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply custom className', async () => {
      mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
        success: true,
        status: 'delivered',
      });

      const { container } = render(
        <EmailDeliveryStatus
          emailId="email-class"
          email="test@example.com"
          className="custom-class"
        />
      );

      await waitFor(() => {
        expect(container.firstChild).toHaveClass('custom-class');
      });
    });

    it('should apply correct color classes for different statuses', async () => {
      const statuses = [
        { status: 'delivered', colorClass: 'text-green-600' },
        { status: 'pending', colorClass: 'text-blue-600' },
        { status: 'failed', colorClass: 'text-red-600' },
        { status: 'bounced', colorClass: 'text-orange-600' },
      ];

      for (const { status, colorClass } of statuses) {
        mockAuthAPI.getEmailDeliveryStatus.mockResolvedValue({
          success: true,
          status: status as any,
        });

        const { unmount } = render(
          <EmailDeliveryStatus
            emailId={`email-${status}`}
            email="test@example.com"
          />
        );

        await waitFor(() => {
          const statusElement = screen.getByText(new RegExp(`Email.*${status === 'delivered' ? 'delivered successfully' : status}`));
          expect(statusElement).toHaveClass(colorClass);
        });

        unmount();
      }
    });
  });
});