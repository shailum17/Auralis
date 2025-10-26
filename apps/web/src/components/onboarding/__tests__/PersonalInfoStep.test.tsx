import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PersonalInfoStep } from '../PersonalInfoStep';

const mockData = {
  fullName: '',
  bio: '',
  dateOfBirth: '',
  gender: '',
};

const mockOnChange = jest.fn();
const mockErrors = {};

describe('PersonalInfoStep', () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all form fields', () => {
    render(
      <PersonalInfoStep
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tell us about yourself/i)).toBeInTheDocument(); // Bio textarea
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/select gender/i)).toBeInTheDocument(); // Gender select
  });

  it('calls onChange when full name is updated', async () => {
    const user = userEvent.setup();
    
    render(
      <PersonalInfoStep
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const fullNameInput = screen.getByLabelText(/full name/i);
    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'John Doe');

    // Check that onChange was called with the correct field name and that it was called multiple times
    expect(mockOnChange).toHaveBeenCalledWith('fullName', expect.any(String));
    expect(mockOnChange).toHaveBeenCalledTimes(8); // 8 characters in "John Doe"
  });

  it('calls onChange when bio is updated', async () => {
    const user = userEvent.setup();
    
    render(
      <PersonalInfoStep
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const bioTextarea = screen.getByPlaceholderText(/tell us about yourself/i);
    await user.type(bioTextarea, 'I am a student');

    // Check that onChange was called with the correct field name and that it was called multiple times
    expect(mockOnChange).toHaveBeenCalledWith('bio', expect.any(String));
    expect(mockOnChange).toHaveBeenCalledTimes(14); // 14 characters in "I am a student"
  });

  it('displays error messages', () => {
    const errorsWithMessages = {
      fullName: 'Full name is required',
      bio: 'Bio is too long',
    };

    render(
      <PersonalInfoStep
        data={mockData}
        onChange={mockOnChange}
        errors={errorsWithMessages}
      />
    );

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Bio is too long')).toBeInTheDocument();
  });

  it('shows character count for bio', () => {
    const dataWithBio = { ...mockData, bio: 'Hello world' };
    
    render(
      <PersonalInfoStep
        data={dataWithBio}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByText('11/500 characters')).toBeInTheDocument();
  });

  it('handles gender selection', async () => {
    const user = userEvent.setup();
    
    render(
      <PersonalInfoStep
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const genderSelect = screen.getByDisplayValue(/select gender/i);
    await user.selectOptions(genderSelect, 'male');

    expect(mockOnChange).toHaveBeenCalledWith('gender', 'male');
  });

  it('prevents future dates in date of birth', () => {
    render(
      <PersonalInfoStep
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const dateInput = screen.getByLabelText(/date of birth/i);
    const today = new Date().toISOString().split('T')[0];
    
    expect(dateInput).toHaveAttribute('max', today);
  });
});