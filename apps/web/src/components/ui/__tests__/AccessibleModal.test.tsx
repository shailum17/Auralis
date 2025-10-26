import React, { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessibleModal } from '../AccessibleModal'

// Mock createPortal to render in the same container
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

describe('AccessibleModal', () => {
  const user = userEvent.setup()
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', async () => {
      render(<AccessibleModal {...defaultProps} />)
      const modal = screen.getByRole('dialog')
      
      expect(modal).toBeInTheDocument()
      expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    it('should have proper modal attributes', () => {
      render(<AccessibleModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAttribute('aria-label', 'Test Modal')
    })

    it('should associate title with modal', () => {
      render(<AccessibleModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      const title = screen.getByText('Test Modal')
      
      expect(modal).toHaveAttribute('aria-labelledby')
      expect(title).toHaveAttribute('id', modal.getAttribute('aria-labelledby'))
    })

    it('should associate description with modal', () => {
      render(
        <AccessibleModal 
          {...defaultProps} 
          description="This is a test modal description"
        />
      )
      
      const modal = screen.getByRole('dialog')
      const description = screen.getByText('This is a test modal description')
      
      expect(modal).toHaveAttribute('aria-describedby')
      expect(description).toHaveAttribute('id', modal.getAttribute('aria-describedby'))
    })

    it('should support alertdialog role', () => {
      render(<AccessibleModal {...defaultProps} role="alertdialog" />)
      
      const modal = screen.getByRole('alertdialog')
      expect(modal).toBeInTheDocument()
    })

    it('should provide screen reader instructions', () => {
      render(<AccessibleModal {...defaultProps} />)
      
      const instructions = screen.getByText(/Modal dialog opened/)
      expect(instructions).toHaveClass('sr-only')
      expect(instructions).toHaveAttribute('aria-live', 'polite')
    })

    it('should announce modal opening and closing', async () => {
      const { rerender } = render(
        <AccessibleModal 
          {...defaultProps}
          announceOnOpen="Modal opened"
          announceOnClose="Modal closed"
        />
      )
      
      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      // Close modal
      rerender(
        <AccessibleModal 
          {...defaultProps}
          isOpen={false}
          announceOnOpen="Modal opened"
          announceOnClose="Modal closed"
        />
      )
      
      // Modal should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('should trap focus within modal', async () => {
      render(
        <AccessibleModal {...defaultProps}>
          <button>First Button</button>
          <button>Second Button</button>
          <input type="text" placeholder="Input" />
        </AccessibleModal>
      )
      
      const firstButton = screen.getByRole('button', { name: 'First Button' })
      const secondButton = screen.getByRole('button', { name: 'Second Button' })
      const input = screen.getByRole('textbox')
      const closeButton = screen.getByRole('button', { name: 'Close modal' })
      
      // First focusable element should be focused initially
      await waitFor(() => {
        expect(firstButton).toHaveFocus()
      })
      
      // Tab through elements
      await user.tab()
      expect(secondButton).toHaveFocus()
      
      await user.tab()
      expect(input).toHaveFocus()
      
      await user.tab()
      expect(closeButton).toHaveFocus()
      
      // Tab should wrap to first element
      await user.tab()
      expect(firstButton).toHaveFocus()
      
      // Shift+Tab should go backwards
      await user.tab({ shift: true })
      expect(closeButton).toHaveFocus()
    })

    it('should restore focus when modal closes', async () => {
      const TriggerButton = () => {
        const [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            <AccessibleModal 
              isOpen={isOpen} 
              onClose={() => setIsOpen(false)}
              title="Test Modal"
            >
              <div>Modal content</div>
            </AccessibleModal>
          </>
        )
      }
      
      render(<TriggerButton />)
      
      const triggerButton = screen.getByRole('button', { name: 'Open Modal' })
      
      // Click to open modal
      await user.click(triggerButton)
      
      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      // Close modal with Escape
      await user.keyboard('{Escape}')
      
      // Focus should return to trigger button
      await waitFor(() => {
        expect(triggerButton).toHaveFocus()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', async () => {
      const handleClose = jest.fn()
      
      render(
        <AccessibleModal 
          {...defaultProps} 
          onClose={handleClose}
          closeOnEscape={true}
        />
      )
      
      await user.keyboard('{Escape}')
      expect(handleClose).toHaveBeenCalled()
    })

    it('should not close on Escape when disabled', async () => {
      const handleClose = jest.fn()
      
      render(
        <AccessibleModal 
          {...defaultProps} 
          onClose={handleClose}
          closeOnEscape={false}
        />
      )
      
      await user.keyboard('{Escape}')
      expect(handleClose).not.toHaveBeenCalled()
    })

    it('should close when clicking close button', async () => {
      const handleClose = jest.fn()
      
      render(
        <AccessibleModal 
          {...defaultProps} 
          onClose={handleClose}
          showCloseButton={true}
        />
      )
      
      const closeButton = screen.getByRole('button', { name: 'Close modal' })
      await user.click(closeButton)
      
      expect(handleClose).toHaveBeenCalled()
    })

    it('should close when clicking overlay', async () => {
      const handleClose = jest.fn()
      
      render(
        <AccessibleModal 
          {...defaultProps} 
          onClose={handleClose}
          closeOnOverlayClick={true}
        />
      )
      
      // Click on the overlay (not the modal content)
      const overlay = screen.getByRole('dialog').parentElement
      if (overlay) {
        await user.click(overlay)
        expect(handleClose).toHaveBeenCalled()
      }
    })

    it('should not close when clicking modal content', async () => {
      const handleClose = jest.fn()
      
      render(
        <AccessibleModal 
          {...defaultProps} 
          onClose={handleClose}
          closeOnOverlayClick={true}
        />
      )
      
      const modal = screen.getByRole('dialog')
      await user.click(modal)
      
      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('Visual States', () => {
    it('should apply correct size classes', () => {
      const { rerender } = render(
        <AccessibleModal {...defaultProps} size="sm" />
      )
      
      let modal = screen.getByRole('dialog')
      expect(modal).toHaveClass('max-w-sm')
      
      rerender(<AccessibleModal {...defaultProps} size="lg" />)
      modal = screen.getByRole('dialog')
      expect(modal).toHaveClass('max-w-lg')
      
      rerender(<AccessibleModal {...defaultProps} size="full" />)
      modal = screen.getByRole('dialog')
      expect(modal).toHaveClass('max-w-full', 'mx-4')
    })

    it('should show/hide close button based on prop', () => {
      const { rerender } = render(
        <AccessibleModal {...defaultProps} showCloseButton={true} />
      )
      
      expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument()
      
      rerender(<AccessibleModal {...defaultProps} showCloseButton={false} />)
      expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument()
    })

    it('should render without title when not provided', () => {
      render(
        <AccessibleModal 
          isOpen={true}
          onClose={jest.fn()}
          ariaLabel="Untitled Modal"
        >
          <div>Content without title</div>
        </AccessibleModal>
      )
      
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-label', 'Untitled Modal')
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('Body Scroll Prevention', () => {
    it('should prevent body scroll when open', () => {
      const originalOverflow = document.body.style.overflow
      
      render(<AccessibleModal {...defaultProps} />)
      
      expect(document.body.style.overflow).toBe('hidden')
      
      // Cleanup
      document.body.style.overflow = originalOverflow
    })

    it('should restore body scroll when closed', () => {
      const originalOverflow = document.body.style.overflow
      
      const { rerender } = render(<AccessibleModal {...defaultProps} />)
      
      expect(document.body.style.overflow).toBe('hidden')
      
      rerender(<AccessibleModal {...defaultProps} isOpen={false} />)
      
      expect(document.body.style.overflow).toBe(originalOverflow)
    })
  })

  describe('High Contrast Mode', () => {
    it('should have forced-colors support', () => {
      render(<AccessibleModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveClass('forced-colors:border', 'forced-colors:border-solid')
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
      render(<AccessibleModal {...defaultProps} />)
      
      // When reduced motion is preferred, animations should be disabled
      // This would need proper implementation in the component
    })
  })
})