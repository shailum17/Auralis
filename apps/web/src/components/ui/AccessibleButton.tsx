import React, { ButtonHTMLAttributes, forwardRef, ReactNode, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useKeyboardNavigation, useAnnouncer, useReducedMotion, generateId, createAriaAttributes } from '@/lib/accessibility'
import { animationPresets } from '@/lib/animation-system'

const accessibleButtonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 disabled:bg-primary-300 hover:shadow-md forced-colors:border forced-colors:border-solid',
        secondary: 'bg-secondary-100 text-secondary-900 shadow-sm hover:bg-secondary-200 active:bg-secondary-300 focus-visible:ring-secondary-500 disabled:bg-secondary-50 disabled:text-secondary-400 hover:shadow-md forced-colors:border forced-colors:border-solid',
        outline: 'border border-secondary-300 bg-white text-secondary-700 shadow-sm hover:bg-secondary-50 hover:border-secondary-400 active:bg-secondary-100 focus-visible:ring-secondary-500 disabled:border-secondary-200 disabled:text-secondary-400 forced-colors:border forced-colors:border-solid',
        ghost: 'text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus-visible:ring-secondary-500 disabled:text-secondary-400 forced-colors:border forced-colors:border-solid forced-colors:border-transparent hover:forced-colors:border-solid',
        danger: 'bg-error-600 text-white shadow-sm hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500 disabled:bg-error-300 hover:shadow-md forced-colors:border forced-colors:border-solid',
        success: 'bg-success-600 text-white shadow-sm hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 disabled:bg-success-300 hover:shadow-md forced-colors:border forced-colors:border-solid',
      },
      size: {
        xs: 'h-6 px-2 text-xs gap-1 rounded-md min-w-[1.5rem]',
        sm: 'h-8 px-3 text-sm gap-1.5 rounded-md min-w-[2rem]',
        md: 'h-10 px-4 text-sm gap-2 rounded-lg min-w-[2.5rem]',
        lg: 'h-12 px-6 text-base gap-2 rounded-lg min-w-[3rem]',
        xl: 'h-14 px-8 text-lg gap-3 rounded-xl min-w-[3.5rem]',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface AccessibleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragEnd' | 'onDragStart'>,
    VariantProps<typeof accessibleButtonVariants> {
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loadingText?: string
  ripple?: boolean
  
  // Accessibility props
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaExpanded?: boolean
  ariaPressed?: boolean
  ariaControls?: string
  announceOnClick?: string
  announceOnLoad?: string
  
  // Enhanced interaction props
  onActivate?: () => void // Called on both click and keyboard activation
  preventDoubleClick?: boolean
  doubleClickDelay?: number
}

const LoadingSpinner = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="img"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    loading = false,
    icon,
    iconPosition = 'left',
    loadingText,
    ripple = true,
    children,
    disabled,
    onClick,
    onActivate,
    preventDoubleClick = false,
    doubleClickDelay = 300,
    
    // Accessibility props
    ariaLabel,
    ariaDescribedBy,
    ariaExpanded,
    ariaPressed,
    ariaControls,
    announceOnClick,
    announceOnLoad,
    
    id: providedId,
    ...props
  }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
    const [lastClickTime, setLastClickTime] = useState(0)
    const buttonId = providedId || generateId('button')
    const isDisabled = disabled || loading
    const prefersReducedMotion = useReducedMotion()
    const { announce } = useAnnouncer()
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Keyboard navigation
    const { handleKeyDown } = useKeyboardNavigation(
      () => handleActivation(), // Enter
      () => handleActivation(), // Space
    )

    const iconSizes = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6'
    }

    const spinnerSizes = {
      xs: 'sm' as const,
      sm: 'sm' as const,
      md: 'sm' as const,
      lg: 'md' as const,
      xl: 'lg' as const
    }

    const handleActivation = () => {
      if (isDisabled) return

      // Prevent double-click if enabled
      if (preventDoubleClick) {
        const now = Date.now()
        if (now - lastClickTime < doubleClickDelay) {
          return
        }
        setLastClickTime(now)
      }

      // Announce action if specified
      if (announceOnClick) {
        announce(announceOnClick, 'polite')
      }

      // Call both onClick and onActivate
      onActivate?.()
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !isDisabled && !prefersReducedMotion) {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const id = Date.now()
        
        setRipples(prev => [...prev, { x, y, id }])
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== id))
        }, 600)
      }
      
      handleActivation()
      onClick?.(event)
    }

    // Announce loading state changes
    React.useEffect(() => {
      if (loading && announceOnLoad) {
        announce(announceOnLoad, 'polite')
      }
    }, [loading, announceOnLoad, announce])

    // Create ARIA attributes
    const ariaAttributes = createAriaAttributes({
      label: ariaLabel,
      describedBy: ariaDescribedBy,
      expanded: ariaExpanded,
      pressed: ariaPressed,
      controls: ariaControls,
      busy: loading,
      disabled: isDisabled,
    })

    const buttonContent = (
      <>
        {/* Ripple Effects */}
        {!prefersReducedMotion && ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? {} : { duration: 0.2 }}
          >
            <LoadingSpinner size={spinnerSizes[size || 'md']} />
          </motion.div>
        )}

        {/* Left Icon */}
        {!loading && icon && iconPosition === 'left' && (
          <motion.span
            className={cn('flex-shrink-0', iconSizes[size || 'md'])}
            aria-hidden="true"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}

        {/* Button Text */}
        <motion.span
          className={cn(loading && 'opacity-0')}
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={prefersReducedMotion ? {} : { opacity: 1 }}
          transition={prefersReducedMotion ? {} : { duration: 0.2 }}
        >
          {loading && loadingText ? loadingText : children}
        </motion.span>

        {/* Right Icon */}
        {!loading && icon && iconPosition === 'right' && (
          <motion.span
            className={cn('flex-shrink-0', iconSizes[size || 'md'])}
            aria-hidden="true"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}

        {/* Screen reader loading announcement */}
        {loading && (
          <span className="sr-only" aria-live="polite">
            {loadingText || 'Loading'}
          </span>
        )}
      </>
    )

    const buttonProps = {
      ...props,
      ...ariaAttributes,
      id: buttonId,
      ref: ref || buttonRef,
      className: cn(
        accessibleButtonVariants({ variant, size, fullWidth }),
        prefersReducedMotion && 'motion-reduce:transition-none motion-reduce:animate-none',
        className
      ),
      disabled: isDisabled,
      onClick: handleClick,
      onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
        handleKeyDown(e)
        props.onKeyDown?.(e)
      },
    }

    if (prefersReducedMotion) {
      return (
        <button {...buttonProps}>
          {buttonContent}
        </button>
      )
    }

    return (
      <motion.button
        {...buttonProps}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.1 }}
      >
        {buttonContent}
      </motion.button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

export { AccessibleButton, accessibleButtonVariants }
export type { AccessibleButtonProps }