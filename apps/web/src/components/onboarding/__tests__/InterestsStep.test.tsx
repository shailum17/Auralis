import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { InterestsStep } from '../InterestsStep';

const mockData = {
    interests: [],
    studyPreferences: [],
    mentalHealthGoals: [],
};

const mockOnChange = jest.fn();
const mockErrors = {};

describe('InterestsStep', () => {
    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders all interest categories', () => {
        render(
            <InterestsStep
                data={mockData}
                onChange={mockOnChange}
                errors={mockErrors}
            />
        );

        expect(screen.getByText('Academic & Learning')).toBeInTheDocument();
        expect(screen.getByText('Health & Wellness')).toBeInTheDocument();
        expect(screen.getByText('Social & Community')).toBeInTheDocument();
        expect(screen.getByText('Career & Professional')).toBeInTheDocument();
        expect(screen.getByText('Creative & Arts')).toBeInTheDocument();
        expect(screen.getByText('Technology & Innovation')).toBeInTheDocument();
    });

    it('renders study preferences section', () => {
        render(
            <InterestsStep
                data={mockData}
                onChange={mockOnChange}
                errors={mockErrors}
            />
        );

        expect(screen.getByText('Study Preferences')).toBeInTheDocument();
        expect(screen.getByText('Group Study')).toBeInTheDocument();
        expect(screen.getByText('Solo Study')).toBeInTheDocument();
    });

    it('renders mental health goals section', () => {
        render(
            <InterestsStep
                data={mockData}
                onChange={mockOnChange}
                errors={mockErrors}
            />
        );

        expect(screen.getByText('Wellness & Mental Health Goals')).toBeInTheDocument();
        expect(screen.getByText('Stress Management')).toBeInTheDocument();
        expect(screen.getByText('Anxiety Support')).toBeInTheDocument();
    });

    it('toggles interest selection', async () => {
        const user = userEvent.setup();

        render(
            <InterestsStep
                data={mockData}
                onChange={mockOnChange}
                errors={mockErrors}
            />
        );

        const academicSuccessButton = screen.getByText('Academic Success');
        await user.click(academicSuccessButton);

        expect(mockOnChange).toHaveBeenCalledWith('interests', ['Academic Success']);
    });

    it('toggles study preference selection', async () => {
        const user = userEvent.setup();

        render(
            <InterestsStep
                data={mockData}
                onChange={mockOnChange}
                errors={mockErrors}
            />
        );

        const groupStudyButton = screen.getByText('Group Study');
        await user.click(groupStudyButton);

        expect(mockOnChange).toHaveBeenCalledWith('studyPreferences', ['Group Study']);
    });

    it('toggles mental health goal selection', async () => {
        const user = userEvent.setup();

        render(
            <InterestsStep
                data={mockData}
                onChange={mockOnChange}
                errors={mockErrors}
            />
        );

        const stressManagementButton = screen.getByText('Stress Management');
        await user.click(stressManagementButton);

        expect(mockOnChange).toHaveBeenCalledWith('mentalHealthGoals', ['Stress Management']);
    });

    it('shows selection summary when items are selected', () => {
        const dataWithSelections = {
            interests: ['Academic Success', 'Mental Health'],
            studyPreferences: ['Group Study'],
            mentalHealthGoals: ['Stress Management'],
        };

        render(
            <InterestsStep
                data={dataWithSelections}
                onChange={mockOnChange}
                errors={mockErrors}
            />
        );

        expect(screen.getByText('Your Selections')).toBeInTheDocument();
        expect(screen.getByText('2 selected')).toBeInTheDocument(); // interests
        expect(screen.getAllByText('1 selected')).toHaveLength(2); // study preferences and mental health goals
    });

    it('removes interest when clicked again', async () => {
        const user = userEvent.setup();
        const dataWithInterest = {
            ...mockData,
            interests: ['Academic Success'],
        };

        render(
            <InterestsStep
                data={dataWithInterest}
                onChange={mockOnChange}
                errors={mockErrors}
            />
        );

        const academicSuccessButton = screen.getByText('Academic Success');
        await user.click(academicSuccessButton);

        expect(mockOnChange).toHaveBeenCalledWith('interests', []);
    });
});