import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OnboardingStepIndicator } from '../OnboardingStepIndicator';

const mockSteps = [
  {
    id: 'personal-info',
    title: 'Personal Info',
    description: 'Tell us about yourself',
    isRequired: true,
  },
  {
    id: 'academic-info',
    title: 'Academic',
    description: 'Your educational background',
    isRequired: false,
  },
  {
    id: 'interests',
    title: 'Interests',
    description: 'What you\'re passionate about',
    isRequired: false,
  },
];

describe('OnboardingStepIndicator', () => {
  it('renders all steps correctly', () => {
    render(
      <OnboardingStepIndicator
        steps={mockSteps}
        currentStep={0}
        completedSteps={new Set()}
      />
    );

    expect(screen.getAllByText('Personal Info')).toHaveLength(2); // Step title and current step description
    expect(screen.getByText('Academic')).toBeInTheDocument();
    expect(screen.getByText('Interests')).toBeInTheDocument();
  });

  it('shows correct progress percentage', () => {
    render(
      <OnboardingStepIndicator
        steps={mockSteps}
        currentStep={1}
        completedSteps={new Set([0])}
      />
    );

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('67% Complete')).toBeInTheDocument();
  });

  it('displays required indicators for required steps', () => {
    render(
      <OnboardingStepIndicator
        steps={mockSteps}
        currentStep={0}
        completedSteps={new Set()}
      />
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows completed steps with check marks', () => {
    render(
      <OnboardingStepIndicator
        steps={mockSteps}
        currentStep={2}
        completedSteps={new Set([0, 1])}
      />
    );

    // Check that current step shows number 3
    expect(screen.getByText('3')).toBeInTheDocument();
    // Check that completed steps show check marks (SVG elements with aria-hidden)
    const checkIcons = document.querySelectorAll('svg[aria-hidden="true"]');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('highlights current step', () => {
    render(
      <OnboardingStepIndicator
        steps={mockSteps}
        currentStep={1}
        completedSteps={new Set([0])}
      />
    );

    expect(screen.getAllByText('Academic')).toHaveLength(2); // Step title and current step description
    expect(screen.getByText('Your educational background')).toBeInTheDocument();
  });
});