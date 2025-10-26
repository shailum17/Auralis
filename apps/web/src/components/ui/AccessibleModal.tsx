import { forwardRef, HTMLAttributes, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { FocusTrap } from './FocusTrap'
import { useKeyboardNavigation, useAnnouncer, useReducedMotion, generateId } from '@/lib/accessibility'
import { animationPresets } from '@/lib/animation-system'
import { X } from 'lucide-react'

interface AccessibleModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  children: React.ReactNode
  
  // Accessibility props
  ariaLabel?: string
  ariaDescribedBy?: string
  announceOnOpen?: string
  announceOnClose?: string
  role?: 'dialog' | 'alertdialog'
}

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
} as const

const AccessibleModal = forwardRef<HTMLDivElement, AccessibleModalProps>(
  ({
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    children,
    className,
    
    // Accessibility props
    ariaLabel,
    ariaDescribedBy,
    announceOnOpen,
    announceOnClose,
    role = 'dialog',
    
    id: providedId,
    ...props
  }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const prefersReducedMotion = useReducedMotion()
    const { announce } = useAnnouncer()
    
    // Generate IDs
    const modalId = providedId || generateId('modal')
    const titleId = generateId('modal-title')
    const descriptionId = generateId('modal-description')

    // Keyboard navigation
    const { handleKeyDown } = useKeyboardNavigation(
      undefined, // Enter
      undefined, // Space
      closeOnEscape ? onClose : undefined, // Escape
    )

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === overlayRef.current) {
        onClose()
      }
    }

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        const originalStyle = window.getComputedStyle(document.body).overflow
        document.body.style.overflow = 'hidden'
        
        // Announce modal opening
        if (announceOnOpen) {
          announce(announceOnOpen, 'assertive')
        }
        
        return () => {
          document.body.style.overflow = originalStyle
          
          // Announce modal closing
          if (announceOnClose) {
            announce(announceOnClose, 'polite')
          }
        }
      }
    }, [isOpen, announceOnOpen, announceOnClose, announce])

    // Build aria-describedby
    const describedBy = [
      ariaDescribedBy,
      description ? descriptionId : undefined,
    ].filter(Boolean).join(' ') || undefined

    if (!isOpen) return null

    const modalContent = (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
        onKeyDown={handleKeyDown}
      >
        <FocusTrap active={isOpen}>
          <motion.div
            ref={ref || modalRef}
            id={modalId}
            role={role}
            aria-modal="true"
            aria-label={ariaLabel || title}
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={describedBy}
            className={cn(
              'relative w-full bg-white rounded-xl shadow-2xl border border-secondary-200 max-h-[90vh] overflow-hidden',
              modalSizes[size],
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'forced-colors:border forced-colors:border-solid',
              className
            )}
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
            transition={prefersReducedMotion ? undefined : { type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2
                      id={titleId}
                      className="text-xl font-semibold text-secondary-900 truncate"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id={descriptionId}
                      className="mt-1 text-sm text-secondary-600"
                    >
                      {description}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      'ml-4 p-2 text-secondary-400 hover:text-secondary-600 focus:text-secondary-600',
                      'rounded-lg hover:bg-secondary-100 focus:bg-secondary-100',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                      'transition-colors duration-200',
                      'forced-colors:border forced-colors:border-solid forced-colors:border-transparent hover:forced-colors:border-solid'
                    )}
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              {children}
            </div>

            {/* Screen reader instructions */}
            <div className="sr-only" aria-live="polite">
              {isOpen && (
                <>
                  Modal dialog opened. 
                  {closeOnEscape && 'Press Escape to close. '}
                  {closeOnOverlayClick && 'Click outside to close. '}
                  Use Tab to navigate between interactive elements.
                </>
              )}
            </div>
          </motion.div>
        </FocusTrap>
      </div>
    )

    // Render in portal
    if (typeof document !== 'undefined') {
      return createPortal(modalContent, document.body)
    }

    return null
  }
)

AccessibleModal.displayName = 'AccessibleModal'

// Modal components for structured content
const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 border-b border-secondary-200', className)}
      {...props}
    />
  )
)
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-xl font-semibold text-secondary-900', className)}
      {...props}
    />
  )
)
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('mt-1 text-sm text-secondary-600', className)}
      {...props}
    />
  )
)
ModalDescription.displayName = 'ModalDescription'

const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  )
)
ModalContent.displayName = 'ModalContent'

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-3 p-6 border-t border-secondary-200 bg-secondary-50', className)}
      {...props}
    />
  )
)
ModalFooter.displayName = 'ModalFooter'

export { 
  AccessibleModal, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalContent, 
  ModalFooter 
}
export type { AccessibleModalProps }