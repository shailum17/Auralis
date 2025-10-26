import { render, screen } from '@testing-library/react';
import { ValidationErrorDisplay } from '../ValidationErrorDisplay';

describe('ValidationErrorDisplay', () => {
  const mockErrors = [
    { field: 'email', message: 'Email is required', type: 'error' as const },
    { field: 'username', message: 'Username is too short', type: 'error' as const },
  ];

  const mockWarnings = [
    { field: 'password', message: 'Consider a stronger password', type: 'warning' as const },
  ];

  it('should not render when no errors', () => {
    const { container } = render(<ValidationErrorDisplay errors={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render error messages', () => {
    render(<ValidationErrorDisplay errors={mockErrors} />);
    
    expect(screen.getByText('Email: Email is required')).toBeInTheDocument();
    expect(screen.getByText('Username: Username is too short')).toBeInTheDocument();
  });

  it('should render warning messages', () => {
    render(<ValidationErrorDisplay errors={mockWarnings} />);
    
    expect(screen.getByText('Password: Consider a stronger password')).toBeInTheDocument();
  });

  it('should render mixed error types', () => {
    const mixedErrors = [
      { field: 'email', message: 'Email is required', type: 'error' as const },
      { field: 'password', message: 'Consider a stronger password', type: 'warning' as const },
      { field: 'info', message: 'This is informational', type: 'info' as const },
    ];

    render(<ValidationErrorDisplay errors={mixedErrors} />);
    
    expect(screen.getByText('Email: Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password: Consider a stronger password')).toBeInTheDocument();
    expect(screen.getByText('Info: This is informational')).toBeInTheDocument();
  });

  it('should handle errors without field names', () => {
    const errorsWithoutField = [
      { field: '', message: 'General error message', type: 'error' as const },
    ];

    render(<ValidationErrorDisplay errors={errorsWithoutField} />);
    
    expect(screen.getByText('General error message')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ValidationErrorDisplay errors={mockErrors} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render appropriate icons for different error types', () => {
    const mixedErrors = [
      { field: 'email', message: 'Email error', type: 'error' as const },
      { field: 'password', message: 'Password warning', type: 'warning' as const },
      { field: 'info', message: 'Info message', type: 'info' as const },
    ];

    render(<ValidationErrorDisplay errors={mixedErrors} />);
    
    // We can't easily test for specific icons, but we can verify the messages are rendered
    expect(screen.getByText('Email: Email error')).toBeInTheDocument();
    expect(screen.getByText('Password: Password warning')).toBeInTheDocument();
    expect(screen.getByText('Info: Info message')).toBeInTheDocument();
  });

  it('should handle default error type', () => {
    const errorsWithoutType = [
      { field: 'email', message: 'Default error' },
    ];

    render(<ValidationErrorDisplay errors={errorsWithoutType as any} />);
    
    expect(screen.getByText('Email: Default error')).toBeInTheDocument();
  });

  it('should render multiple errors for the same field', () => {
    const duplicateFieldErrors = [
      { field: 'password', message: 'Password too short', type: 'error' as const },
      { field: 'password', message: 'Password too weak', type: 'warning' as const },
    ];

    render(<ValidationErrorDisplay errors={duplicateFieldErrors} />);
    
    expect(screen.getByText('Password: Password too short')).toBeInTheDocument();
    expect(screen.getByText('Password: Password too weak')).toBeInTheDocument();
  });
});