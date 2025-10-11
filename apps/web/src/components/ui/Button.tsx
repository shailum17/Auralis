import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  loadingText?: string
  motionProps?: {
    whileHover?: any
    whileTap?: any
    initial?: any
    animate?: any
    exit?: any
    transition?: any
  }
}

const LoadingSpinner = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <svg
      className={clsx('animate-spin', sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    loadingText,
    children,
    disabled,
    motionProps,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    const baseClasses = clsx(
      'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative overflow-hidden',
      {
        'w-full': fullWidth,
        'rounded-md': size === 'sm',
        'rounded-lg': size === 'md' || size === 'lg',
        'rounded-xl': size === 'xl',
      }
    )

    const variantClasses = {
      primary: clsx(
        'bg-blue-600 text-white shadow-sm',
        'hover:bg-blue-700 active:bg-blue-800',
        'focus-visible:ring-blue-500',
        'disabled:bg-blue-300'
      ),
      secondary: clsx(
        'bg-gray-100 text-gray-900 shadow-sm',
        'hover:bg-gray-200 active:bg-gray-300',
        'focus-visible:ring-gray-500',
        'disabled:bg-gray-50 disabled:text-gray-400'
      ),
      outline: clsx(
        'border border-gray-300 bg-white text-gray-700 shadow-sm',
        'hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100',
        'focus-visible:ring-gray-500',
        'disabled:border-gray-200 disabled:text-gray-400'
      ),
      ghost: clsx(
        'text-gray-700',
        'hover:bg-gray-100 active:bg-gray-200',
        'focus-visible:ring-gray-500',
        'disabled:text-gray-400'
      ),
      danger: clsx(
        'bg-red-600 text-white shadow-sm',
        'hover:bg-red-700 active:bg-red-800',
        'focus-visible:ring-red-500',
        'disabled:bg-red-300'
      )
    }

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
      xl: 'h-14 px-8 text-lg gap-3'
    }

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6'
    }

    const spinnerSizes = {
      sm: 'sm' as const,
      md: 'sm' as const,
      lg: 'md' as const,
      xl: 'lg' as const
    }

    const buttonContent = (
      <>
        {loading && (
          <LoadingSpinner size={spinnerSizes[size]} />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className={clsx('flex-shrink-0', iconSizes[size])} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={clsx(loading && 'opacity-0')}>
          {loading && loadingText ? loadingText : children}
        </span>
        {!loading && icon && iconPosition === 'right' && (
          <span className={clsx('flex-shrink-0', iconSizes[size])} aria-hidden="true">
            {icon}
          </span>
        )}
      </>
    )

    const buttonProps = {
      className: clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      ),
      disabled: isDisabled,
      ref,
      'aria-disabled': isDisabled,
      'aria-busy': loading,
      ...props
    }

    if (motionProps) {
      const defaultWhileHover = !isDisabled ? { scale: 1.02 } : undefined
      const defaultWhileTap = !isDisabled ? { scale: 0.98 } : undefined

      const mergedWhileHover = motionProps.whileHover
        ? (defaultWhileHover ? { ...defaultWhileHover, ...motionProps.whileHover } : motionProps.whileHover)
        : defaultWhileHover

      const mergedWhileTap = motionProps.whileTap
        ? (defaultWhileTap ? { ...defaultWhileTap, ...motionProps.whileTap } : motionProps.whileTap)
        : defaultWhileTap

      return (
        <motion.button
          {...buttonProps}
          whileHover={mergedWhileHover}
          whileTap={mergedWhileTap}
          initial={motionProps.initial}
          animate={motionProps.animate}
          exit={motionProps.exit}
          transition={motionProps.transition}
        >
          {buttonContent}
        </motion.button>
      )
    }

    return (
      <button {...buttonProps}>
        {buttonContent}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }