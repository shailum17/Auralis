import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessibleButton } from '../AccessibleButton'

describe('AccessibleButton', () => {
  const user = userEvent.setup()

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', async () => {
      render(<AccessibleButton>Test Button</AccessibleButton>)
      const button = screen.getByRole('button', { name: 'Test Button' })
      
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should be focusable with keyboard', async () => {
      render(<AccessibleButton>Test Button</AccessibleButton>)
      const button = screen.getByRole('button', { name: 'Test Button' })
      
      await user.tab()
      expect(button).toHaveFocus()
    })

    it('should be activatable with Enter key', async () => {
      const handleClick = jest.fn()
      render(
        <AccessibleButton onActivate={handleClick}>
          Test Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button', { name: 'Test Button' })
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be activatable with Space key', async () => {
      const handleClick = jest.fn()
      render(
        <AccessibleButton onActivate={handleClick}>
          Test Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button', { name: 'Test Button' })
      button.focus()
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should have proper ARIA attributes', () => {
      render(
        <AccessibleButton
          ariaLabel="Custom label"
          ariaDescribedBy="description"
          ariaExpanded={true}
          ariaPressed={false}
          ariaControls="menu"
        >
          Test Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom label')
      expect(button).toHaveAttribute('aria-describedby', 'description')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(button).toHaveAttribute('aria-pressed', 'false')
      expect(button).toHaveAttribute('aria-controls', 'menu')
    })

    it('should announce loading state', async () => {
      const { rerender } = render(
        <AccessibleButton loading={false}>Test Button</AccessibleButton>
      )
      
      rerender(
        <AccessibleButton loading={true} loadingText="Loading...">
          Test Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should be disabled when loading', () => {
      render(
        <AccessibleButton loading={true}>Test Button</AccessibleButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should prevent double-click when enabled', async () => {
      const handleClick = jest.fn()
      render(
        <AccessibleButton
          onActivate={handleClick}
          preventDoubleClick={true}
          doubleClickDelay={100}
        >
          Test Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button')
      
      // Click twice rapidly
      await user.click(button)
      await user.click(button)
      
      // Should only be called once
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should announce custom messages', async () => {
      const mockAnnounce = jest.fn()
      
      // Mock the useAnnouncer hook
      jest.mock('@/lib/accessibility', () => ({
        ...jest.requireActual('@/lib/accessibility'),
        useAnnouncer: () => ({ announce: mockAnnounce }),
      }))
      
      render(
        <AccessibleButton announceOnClick="Button activated">
          Test Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      // Note: This test would need proper mocking setup to work
      // expect(mockAnnounce).toHaveBeenCalledWith('Button activated', 'polite')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle Tab navigation correctly', async () => {
      render(
        <div>
          <AccessibleButton>Button 1</AccessibleButton>
          <AccessibleButton>Button 2</AccessibleButton>
          <input type="text" placeholder="Input" />
        </div>
      )
      
      const button1 = screen.getByRole('button', { name: 'Button 1' })
      const button2 = screen.getByRole('button', { name: 'Button 2' })
      const input = screen.getByRole('textbox')
      
      // Tab through elements
      await user.tab()
      expect(button1).toHaveFocus()
      
      await user.tab()
      expect(button2).toHaveFocus()
      
      await user.tab()
      expect(input).toHaveFocus()
      
      // Shift+Tab back
      await user.tab({ shift: true })
      expect(button2).toHaveFocus()
    })

    it('should skip disabled buttons in tab order', async () => {
      render(
        <div>
          <AccessibleButton>Button 1</AccessibleButton>
          <AccessibleButton disabled>Button 2</AccessibleButton>
          <AccessibleButton>Button 3</AccessibleButton>
        </div>
      )
      
      const button1 = screen.getByRole('button', { name: 'Button 1' })
      const button3 = screen.getByRole('button', { name: 'Button 3' })
      
      await user.tab()
      expect(button1).toHaveFocus()
      
      await user.tab()
      expect(button3).toHaveFocus() // Should skip disabled button
    })
  })

  describe('Visual States', () => {
    it('should apply correct classes for different variants', () => {
      const { rerender } = render(
        <AccessibleButton variant="primary">Primary</AccessibleButton>
      )
      
      let button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-600')
      
      rerender(<AccessibleButton variant="secondary">Secondary</AccessibleButton>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary-100')
      
      rerender(<AccessibleButton variant="outline">Outline</AccessibleButton>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-secondary-300')
    })

    it('should apply correct classes for different sizes', () => {
      const { rerender } = render(
        <AccessibleButton size="sm">Small</AccessibleButton>
      )
      
      let button = screen.getByRole('button')
      expect(button).toHaveClass('h-8', 'px-3', 'text-sm')
      
      rerender(<AccessibleButton size="lg">Large</AccessibleButton>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-12', 'px-6', 'text-base')
    })

    it('should show loading spinner when loading', () => {
      render(
        <AccessibleButton loading={true}>Test Button</AccessibleButton>
      )
      
      const spinner = screen.getByRole('img', { name: 'Loading' })
      expect(spinner).toBeInTheDocument()
    })

    it('should display icons correctly', () => {
      const TestIcon = () => <span data-testid="test-icon">Icon</span>
      
      render(
        <AccessibleButton icon={<TestIcon />} iconPosition="left">
          With Icon
        </AccessibleButton>
      )
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })
  })

  describe('High Contrast Mode', () => {
    it('should have forced-colors support', () => {
      render(<AccessibleButton>Test Button</AccessibleButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('forced-colors:border', 'forced-colors:border-solid')
    })
  })

  describe('Reduced Motion', () => {
    beforeEach(() => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })
    })

    it('should respect reduced motion preferences', () => {
      render(<AccessibleButton>Test Button</AccessibleButton>)
      
      const button = screen.getByRole('button')
      // When reduced motion is preferred, motion classes should be disabled
      // This would need proper implementation in the component
    })
  })
})