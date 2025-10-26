import { render, screen } from '@testing-library/react';
import { FormStepIndicator } from '../FormStepIndicator';

describe('FormStepIndicator', () => {
  const mockSteps = [
    { id: 'step1', title: 'Step 1', description: 'First step' },
    { id: 'step2', title: 'Step 2', description: 'Second step' },
    { id: 'step3', title: 'Step 3', description: 'Third step' },
    { id: 'step4', title: 'Step 4', description: 'Fourth step' },
  ];

  it('should render all step numbers', () => {
    render(<FormStepIndicator steps={mockSteps} currentStep={0} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should highlight current step', () => {
    render(<FormStepIndicator steps={mockSteps} currentStep={1} />);
    
    const currentStepElement = screen.getByText('2').closest('div');
    expect(currentStepElement).toHaveClass('bg-primary-600');
  });

  it('should show completed steps with check marks', () => {
    render(<FormStepIndicator steps={mockSteps} currentStep={2} />);
    
    // Steps 0 and 1 should be completed (show check marks)
    // We can't easily test for the check icon, but we can test the styling
    const step1Element = screen.getByText('1').closest('div');
    const step2Element = screen.getByText('2').closest('div');
    
    expect(step1Element).toHaveClass('bg-success-500');
    expect(step2Element).toHaveClass('bg-success-500');
  });

  it('should show step titles on larger screens', () => {
    render(<FormStepIndicator steps={mockSteps} currentStep={0} />);
    
    // Step titles should be present but hidden on mobile (sm:block class)
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByText('Step 4')).toBeInTheDocument();
  });

  it('should display current step description', () => {
    render(<FormStepIndicator steps={mockSteps} currentStep={1} />);
    
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();
  });

  it('should show progress percentage', () => {
    render(<FormStepIndicator steps={mockSteps} currentStep={1} />);
    
    // Current step is 1 (0-indexed), so progress should be (1+1)/4 * 100 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should calculate progress correctly for different steps', () => {
    const { rerender } = render(<FormStepIndicator steps={mockSteps} currentStep={0} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
    
    rerender(<FormStepIndicator steps={mockSteps} currentStep={2} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    
    rerender(<FormStepIndicator steps={mockSteps} currentStep={3} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FormStepIndicator steps={mockSteps} currentStep={0} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle empty steps array', () => {
    render(<FormStepIndicator steps={[]} currentStep={0} />);
    
    // Should not crash and should show 100% progress
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should handle currentStep beyond steps length', () => {
    render(<FormStepIndicator steps={mockSteps} currentStep={10} />);
    
    // Should not crash and should show 100% progress
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});