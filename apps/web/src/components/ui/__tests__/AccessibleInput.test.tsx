import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessibleInput } from '../AccessibleInput'

describe('AccessibleInput', () => {
  const user = userEvent.setup()

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', async () => {
      render(<AccessibleInput label="Test Input" />)
      const input = screen.getByRole('textbox', { name: 'Test Input' })
      
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should associate label with input', () => {
      render(<AccessibleInput label="Test Label" />)
      
      const input = screen.getByRole('textbox', { name: 'Test Label' })
      const label = screen.getByText('Test Label')
      
      expect(input).toBeInTheDocument()
      expect(label).toBeInTheDocument()
      expect(input).toHaveAttribute('id')
      expect(label).toHaveAttribute('for', input.getAttribute('id'))
    })

    it('should support aria-label when no visible label', () => {
      render(<AccessibleInput ariaLabel="Accessible Label" />)
      
      const input = screen.getByRole('textbox', { name: 'Accessible Label' })
      expect(input).toHaveAttribute('aria-label', 'Accessible Label')
    })

    it('should associate helper text with input', () => {
      render(
        <AccessibleInput 
          label="Test Input" 
          helperText="This is helper text" 
        />
      )
      
      const input = screen.getByRole('textbox')
      const helperText = screen.getByText('This is helper text')
      
      expect(input).toHaveAttribute('aria-describedby')
      expect(helperText).toHaveAttribute('id', input.getAttribute('aria-describedby'))
    })

    it('should associate error message with input', () => {
      render(
        <AccessibleInput 
          label="Test Input" 
          error="This is an error" 
        />
      )
      
      const input = screen.getByRole('textbox')
      const errorMessage = screen.getByText('This is an error')
      
      expect(input).toHaveAttribute('aria-describedby')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(errorMessage).toHaveAttribute('role', 'alert')
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    })

    it('should mark required fields correctly', () => {
      render(<AccessibleInput label="Required Field" required />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-required', 'true')
      expect(input).toBeRequired()
      
      const requiredIndicator = screen.getByText('*')
      expect(requiredIndicator).toHaveAttribute('aria-label', 'required')
    })

    it('should announce validation errors', async () => {
      const mockAnnounce = jest.fn()
      
      render(
        <AccessibleInput 
          label="Test Input"
          validation={[
            { type: 'required', message: 'This field is required' }
          ]}
          showValidation={true}
          announceErrors={true}
        />
      )
      
      const input = screen.getByRole('textbox')
      
      // Focus and blur to trigger validation
      await user.click(input)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('This field is required')).toBeInTheDocument()
      })
    })

    it('should support character count for screen readers', () => {
      render(
        <AccessibleInput 
          label="Test Input"
          maxLength={100}
          showCharacterCount={true}
          value="Hello"
        />
      )
      
      const characterCount = screen.getByText('5/100')
      expect(characterCount).toHaveAttribute('aria-live', 'polite')
    })

    it('should provide clear button accessibility', async () => {
      const handleClear = jest.fn()
      
      render(
        <AccessibleInput 
          label="Test Input"
          value="Some text"
          clearable={true}
          onClear={handleClear}
        />
      )
      
      const clearButton = screen.getByRole('button', { name: 'Clear input' })
      expect(clearButton).toBeInTheDocument()
      expect(clearButton).toHaveAttribute('aria-label', 'Clear input')
      
      await user.click(clearButton)
      expect(handleClear).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should be focusable with Tab', async () => {
      render(<AccessibleInput label="Test Input" />)
      
      const input = screen.getByRole('textbox')
      
      await user.tab()
      expect(input).toHaveFocus()
    })

    it('should support keyboard input', async () => {
      render(<AccessibleInput label="Test Input" />)
      
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await user.type(input, 'Hello World')
      
      expect(input).toHaveValue('Hello World')
    })

    it('should handle clear button with keyboard', async () => {
      const handleClear = jest.fn()
      
      render(
        <AccessibleInput 
          label="Test Input"
          value="Some text"
          clearable={true}
          onClear={handleClear}
        />
      )
      
      const clearButton = screen.getByRole('button', { name: 'Clear input' })
      
      clearButton.focus()
      await user.keyboard('{Enter}')
      
      expect(handleClear).toHaveBeenCalled()
    })
  })

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      render(
        <AccessibleInput 
          label="Required Field"
          validation={[
            { type: 'required', message: 'This field is required' }
          ]}
          showValidation={true}
        />
      )
      
      const input = screen.getByRole('textbox')
      
      // Focus and blur without entering text
      await user.click(input)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('This field is required')).toBeInTheDocument()
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('should validate email format', async () => {
      render(
        <AccessibleInput 
          label="Email"
          type="email"
          validation={[
            { type: 'email', message: 'Please enter a valid email' }
          ]}
          showValidation={true}
        />
      )
      
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await user.type(input, 'invalid-email')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
      })
    })

    it('should validate minimum length', async () => {
      render(
        <AccessibleInput 
          label="Password"
          type="password"
          validation={[
            { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
          ]}
          showValidation={true}
        />
      )
      
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await user.type(input, '123')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })
  })

  describe('Visual States', () => {
    it('should apply error styles', () => {
      render(<AccessibleInput label="Test Input" error="Error message" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-error-300', 'bg-error-50')
    })

    it('should apply success styles when valid', async () => {
      render(
        <AccessibleInput 
          label="Test Input"
          validation={[
            { type: 'required', message: 'Required' }
          ]}
          showValidation={true}
          value="Valid input"
        />
      )
      
      const input = screen.getByRole('textbox')
      
      // Focus to trigger validation display
      await user.click(input)
      await user.tab()
      
      await waitFor(() => {
        expect(input).toHaveClass('border-success-300', 'bg-success-50')
      })
    })

    it('should show floating label animation', async () => {
      render(<AccessibleInput label="Floating Label" floating={true} />)
      
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Floating Label')
      
      // Initially, label should be in placeholder position
      expect(label).toHaveClass('top-1/2', '-translate-y-1/2')
      
      // When focused, label should move up
      await user.click(input)
      
      await waitFor(() => {
        expect(label).toHaveClass('top-2', 'text-xs', 'scale-75')
      })
    })
  })

  describe('High Contrast Mode', () => {
    it('should have forced-colors support', () => {
      render(<AccessibleInput label="Test Input" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('forced-colors:border', 'forced-colors:border-solid')
    })
  })

  describe('Reduced Motion', () => {
    beforeEach(() => {
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
      render(<AccessibleInput label="Test Input" floating={true} />)
      
      const input = screen.getByRole('textbox')
      // Animation classes should be disabled when reduced motion is preferred
      expect(input).toHaveClass('motion-reduce:transition-none')
    })
  })
})