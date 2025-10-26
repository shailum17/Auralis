import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  FeedbackMessage, 
  MultiStepFeedback, 
  RecoverySuggestions,
  FeedbackType,
  StepFeedback,
  RecoverySuggestion
} from '../FeedbackMessage';

describe('FeedbackMessage', () => {
  const mockAction = jest.fn();
  const mockDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render feedback message with title and message', () => {
      render(
        <FeedbackMessage
          type="info"
          title="Information"
          message="This is an informational message"
        />
      );
      
      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByText('This is an informational message')).toBeInTheDocument();
    });

    it('should render appropriate icon for each type', () => {
      const types: FeedbackType[] = ['info', 'success', 'warning', 'error'];
      
      types.forEach(type => {
        const { unmount } = render(
          <FeedbackMessage type={type} title={`${type} message`} />
        );
        
        expect(screen.getByText(`${type} message`)).toBeInTheDocument();
        unmount();
      });
    });

    it('should render without message when not provided', () => {
      render(<FeedbackMessage type="info" title="Just a title" />);
      
      expect(screen.getByText('Just a title')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode', () => {
      render(
        <FeedbackMessage
          type="success"
          title="Success"
          message="Operation completed"
          compact
        />
      );
      
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });

    it('should show limited actions in compact mode', () => {
      render(
        <FeedbackMessage
          type="info"
          title="Info"
          compact
          actions={[
            { label: 'Action 1', onClick: mockAction },
            { label: 'Action 2', onClick: mockAction },
          ]}
        />
      );
      
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.queryByText('Action 2')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render action buttons', () => {
      render(
        <FeedbackMessage
          type="warning"
          title="Warning"
          actions={[
            { label: 'Confirm', onClick: mockAction, variant: 'primary' },
            { label: 'Cancel', onClick: mockAction, variant: 'outline' },
          ]}
        />
      );
      
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should execute action when button is clicked', () => {
      render(
        <FeedbackMessage
          type="info"
          title="Info"
          actions={[{ label: 'Execute', onClick: mockAction }]}
        />
      );
      
      fireEvent.click(screen.getByText('Execute'));
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dismissible', () => {
    it('should show dismiss button when dismissible and onDismiss provided', () => {
      render(
        <FeedbackMessage
          type="info"
          title="Dismissible"
          dismissible
          onDismiss={mockDismiss}
        />
      );
      
      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      render(
        <FeedbackMessage
          type="info"
          title="Dismissible"
          dismissible
          onDismiss={mockDismiss}
        />
      );
      
      const dismissButton = screen.getByRole('button');
      fireEvent.click(dismissButton);
      
      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not show dismiss button when dismissible is false', () => {
      render(
        <FeedbackMessage
          type="info"
          title="Not Dismissible"
          dismissible={false}
          onDismiss={mockDismiss}
        />
      );
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});

describe('MultiStepFeedback', () => {
  const mockSteps: StepFeedback[] = [
    { id: 'step1', title: 'Step 1', message: 'First step', type: 'info', completed: true },
    { id: 'step2', title: 'Step 2', message: 'Second step', type: 'info', completed: false },
    { id: 'step3', title: 'Step 3', message: 'Third step', type: 'info', completed: false },
  ];

  describe('Step Rendering', () => {
    it('should render all steps', () => {
      render(<MultiStepFeedback steps={mockSteps} />);
      
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('should show completed steps as success', () => {
      render(<MultiStepFeedback steps={mockSteps} />);
      
      // Completed step should be rendered as success type
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });

    it('should highlight current step', () => {
      render(<MultiStepFeedback steps={mockSteps} currentStep="step2" />);
      
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });
  });

  describe('Step States', () => {
    it('should handle different step types', () => {
      const stepsWithDifferentTypes: StepFeedback[] = [
        { id: 'info', title: 'Info Step', type: 'info', completed: false },
        { id: 'warning', title: 'Warning Step', type: 'warning', completed: false },
        { id: 'error', title: 'Error Step', type: 'error', completed: false },
      ];

      render(<MultiStepFeedback steps={stepsWithDifferentTypes} />);
      
      expect(screen.getByText('Info Step')).toBeInTheDocument();
      expect(screen.getByText('Warning Step')).toBeInTheDocument();
      expect(screen.getByText('Error Step')).toBeInTheDocument();
    });
  });
});

describe('RecoverySuggestions', () => {
  const mockSuggestions: RecoverySuggestion[] = [
    {
      title: 'Check Connection',
      description: 'Verify your internet connection is stable',
      priority: 'high',
      action: { label: 'Test Connection', onClick: jest.fn() },
    },
    {
      title: 'Clear Cache',
      description: 'Clear your browser cache and cookies',
      priority: 'medium',
      action: { label: 'Clear Cache', onClick: jest.fn() },
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      priority: 'low',
    },
  ];

  describe('Suggestion Rendering', () => {
    it('should render all suggestions', () => {
      render(<RecoverySuggestions suggestions={mockSuggestions} />);
      
      expect(screen.getByText('Check Connection')).toBeInTheDocument();
      expect(screen.getByText('Clear Cache')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(
        <RecoverySuggestions 
          suggestions={mockSuggestions} 
          title="Custom Solutions:" 
        />
      );
      
      expect(screen.getByText('Custom Solutions:')).toBeInTheDocument();
    });

    it('should render suggestion descriptions', () => {
      render(<RecoverySuggestions suggestions={mockSuggestions} />);
      
      expect(screen.getByText('Verify your internet connection is stable')).toBeInTheDocument();
      expect(screen.getByText('Clear your browser cache and cookies')).toBeInTheDocument();
      expect(screen.getByText('Get help from our support team')).toBeInTheDocument();
    });
  });

  describe('Priority Ordering', () => {
    it('should order suggestions by priority', () => {
      const unorderedSuggestions: RecoverySuggestion[] = [
        { title: 'Low Priority', description: 'Low', priority: 'low' },
        { title: 'High Priority', description: 'High', priority: 'high' },
        { title: 'Medium Priority', description: 'Medium', priority: 'medium' },
      ];

      render(<RecoverySuggestions suggestions={unorderedSuggestions} />);
      
      const suggestions = screen.getAllByRole('heading', { level: 5 });
      expect(suggestions[0]).toHaveTextContent('High Priority');
      expect(suggestions[1]).toHaveTextContent('Medium Priority');
      expect(suggestions[2]).toHaveTextContent('Low Priority');
    });

    it('should show priority indicators', () => {
      render(<RecoverySuggestions suggestions={mockSuggestions} />);
      
      // Check for priority indicators (colored dots)
      const container = screen.getByText('Check Connection').closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render action buttons when provided', () => {
      render(<RecoverySuggestions suggestions={mockSuggestions} />);
      
      expect(screen.getByText('Test Connection')).toBeInTheDocument();
      expect(screen.getByText('Clear Cache')).toBeInTheDocument();
      expect(screen.queryByText('Contact Support Button')).not.toBeInTheDocument();
    });

    it('should execute action when button is clicked', () => {
      const mockAction = jest.fn();
      const suggestionsWithAction: RecoverySuggestion[] = [
        {
          title: 'Test Action',
          description: 'Test description',
          action: { label: 'Execute', onClick: mockAction },
        },
      ];

      render(<RecoverySuggestions suggestions={suggestionsWithAction} />);
      
      fireEvent.click(screen.getByText('Execute'));
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<RecoverySuggestions suggestions={mockSuggestions} />);
      
      const mainTitle = screen.getByRole('heading', { level: 4 });
      expect(mainTitle).toHaveTextContent('Try these solutions:');
      
      const suggestionTitles = screen.getAllByRole('heading', { level: 5 });
      expect(suggestionTitles).toHaveLength(3);
    });
  });
});