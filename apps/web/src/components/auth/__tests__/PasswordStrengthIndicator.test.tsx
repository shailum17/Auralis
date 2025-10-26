import { render, screen } from '@testing-library/react';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator';
import { PasswordStrength } from '@/types/auth';

describe('PasswordStrengthIndicator', () => {
  const mockPasswordStrength: PasswordStrength = {
    score: 3,
    level: 'good',
    feedback: ['Password is good'],
    requirements: [
      { id: 'length', label: 'At least 8 characters', validator: () => true, met: true },
      { id: 'uppercase', label: 'At least one uppercase letter', validator: () => true, met: true },
      { id: 'lowercase', label: 'At least one lowercase letter', validator: () => true, met: true },
      { id: 'number', label: 'At least one number', validator: () => true, met: true },
      { id: 'special', label: 'At least one special character', validator: () => true, met: false },
    ],
  };

  it('should not render when password is empty', () => {
    const { container } = render(
      <PasswordStrengthIndicator strength={mockPasswordStrength} password="" />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render password strength indicator', () => {
    render(
      <PasswordStrengthIndicator strength={mockPasswordStrength} password="TestPass123" />
    );
    
    expect(screen.getByText('Password Strength')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('should show requirements checklist', () => {
    render(
      <PasswordStrengthIndicator strength={mockPasswordStrength} password="TestPass123" />
    );
    
    expect(screen.getByText('Requirements:')).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('At least one uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('At least one lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('At least one number')).toBeInTheDocument();
    expect(screen.getByText('At least one special character')).toBeInTheDocument();
  });

  it('should show correct icons for met and unmet requirements', () => {
    render(
      <PasswordStrengthIndicator strength={mockPasswordStrength} password="TestPass123" />
    );
    
    // Should have check icons for met requirements and X icons for unmet
    const checkIcons = screen.getAllByTestId('check-circle');
    const xIcons = screen.getAllByTestId('x-circle');
    
    expect(checkIcons).toHaveLength(4); // 4 met requirements
    expect(xIcons).toHaveLength(1); // 1 unmet requirement
  });

  it('should display feedback messages', () => {
    render(
      <PasswordStrengthIndicator strength={mockPasswordStrength} password="TestPass123" />
    );
    
    expect(screen.getByText('Password is good')).toBeInTheDocument();
  });

  it('should handle very weak password', () => {
    const weakStrength: PasswordStrength = {
      score: 0,
      level: 'very-weak',
      feedback: ['Password is too weak'],
      requirements: [
        { id: 'length', label: 'At least 8 characters', validator: () => true, met: false },
        { id: 'uppercase', label: 'At least one uppercase letter', validator: () => true, met: false },
        { id: 'lowercase', label: 'At least one lowercase letter', validator: () => true, met: false },
        { id: 'number', label: 'At least one number', validator: () => true, met: false },
        { id: 'special', label: 'At least one special character', validator: () => true, met: false },
      ],
    };

    render(
      <PasswordStrengthIndicator strength={weakStrength} password="weak" />
    );
    
    expect(screen.getByText('Very weak')).toBeInTheDocument();
    expect(screen.getByText('Password is too weak')).toBeInTheDocument();
  });

  it('should handle strong password', () => {
    const strongStrength: PasswordStrength = {
      score: 4,
      level: 'strong',
      feedback: ['Password is strong'],
      requirements: [
        { id: 'length', label: 'At least 8 characters', validator: () => true, met: true },
        { id: 'uppercase', label: 'At least one uppercase letter', validator: () => true, met: true },
        { id: 'lowercase', label: 'At least one lowercase letter', validator: () => true, met: true },
        { id: 'number', label: 'At least one number', validator: () => true, met: true },
        { id: 'special', label: 'At least one special character', validator: () => true, met: true },
      ],
    };

    render(
      <PasswordStrengthIndicator strength={strongStrength} password="StrongPass123!" />
    );
    
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getByText('Password is strong')).toBeInTheDocument();
  });
});