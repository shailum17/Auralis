import { InputHTMLAttributes, forwardRef, ReactNode, useState, useId, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useAnnouncer, useReducedMotion, generateId, createAriaAttributes } from '@/lib/accessibility'
import { animationPresets } from '@/lib/animation-system'
import { ValidationRule, ValidationResult } from './types'

const accessibleInputVariants = cva(
  'w-full rounded-lg border bg-white transition-all duration-200 ease-in-out placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-50 forced-colors:border forced-colors:border-solid',
  {
    variants: {
      variant: {
        default: 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
        filled: 'border-transparent bg-secondary-100 focus:bg-white focus:border-primary-500 focus:ring-primary-500',
        flushed: 'border-0 border-b-2 border-secondary-300 rounded-none bg-transparent focus:border-primary-500 focus:ring-0 px-0',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-4 text-base',
      },
      state: {
        default: '',
        error: 'border-error-300 bg-error-50 focus:border-error-500 focus:ring-error-500',
        success: 'border-success-300 bg-success-50 focus:border-success-500 focus:ring-success-500',
        warning: 'border-warning-300 bg-warning-50 focus:border-warning-500 focus:ring-warning-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
)

interface AccessibleInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof accessibleInputVariants> {
  label?: string
  helperText?: string
  error?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  validation?: ValidationRule[]
  showValidation?: boolean
  onValidationChange?: (result: ValidationResult) => void
  floating?: boolean
  
  // Enhanced accessibility props
  ariaLabel?: string
  ariaDescribedBy?: string
  announceErrors?: boolean
  announceSuccess?: boolean
  errorId?: string
  helperId?: string
  labelId?: string
  
  // Enhanced interaction props
  clearable?: boolean
  onClear?: () => void
  showCharacterCount?: boolean
  maxLength?: number
}

const validateInput = (value: string, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value.trim()) {
          errors.push(rule.message)
        }
        break
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (value && !emailRegex.test(value)) {
          errors.push(rule.message)
        }
        break
      case 'minLength':
        if (value && value.length < rule.value) {
          errors.push(rule.message)
        }
        break
      case 'maxLength':
        if (value && value.length > rule.value) {
          errors.push(rule.message)
        }
        break
      case 'pattern':
        if (value && !new RegExp(rule.value).test(value)) {
          errors.push(rule.message)
        }
        break
      case 'custom':
        if (rule.validator && value && !rule.validator(value)) {
          errors.push(rule.message)
        }
        break
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    className,
    variant,
    size,
    state,
    type = 'text',
    label,
    helperText,
    error,
    icon,
    iconPosition = 'left',
    validation = [],
    showValidation = false,
    onValidationChange,
    floating = false,
    required,
    disabled,
    
    // Accessibility props
    ariaLabel,
    ariaDescribedBy,
    announceErrors = true,
    announceSuccess = false,
    errorId: providedErrorId,
    helperId: providedHelperId,
    labelId: providedLabelId,
    
    // Enhanced props
    clearable = false,
    onClear,
    showCharacterCount = false,
    maxLength,
    
    id: providedId,
    'aria-describedby': ariaDescribedByProp,
    onChange,
    onFocus,
    onBlur,
    value,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '')
    const [isFocused, setIsFocused] = useState(false)
    const [validationResult, setValidationResult] = useState<ValidationResult>({
      isValid: true,
      errors: [],
      warnings: []
    })
    const [hasBeenFocused, setHasBeenFocused] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)
    const prefersReducedMotion = useReducedMotion()
    const { announce } = useAnnouncer()

    // Generate IDs
    const inputId = providedId || generateId('input')
    const labelId = providedLabelId || generateId('label')
    const errorId = providedErrorId || generateId('error')
    const helperId = providedHelperId || generateId('helper')

    const hasError = error || (!validationResult.isValid && showValidation && hasBeenFocused)
    const hasSuccess = !hasError && validationResult.isValid && showValidation && hasBeenFocused && String(internalValue).length > 0
    const displayError = error || (showValidation && hasBeenFocused ? validationResult.errors[0] : undefined)
    
    const currentState = hasError ? 'error' : hasSuccess ? 'success' : state || 'default'
    const hasValue = Boolean(value !== undefined ? String(value).length > 0 : String(internalValue).length > 0)
    const currentValue = value !== undefined ? String(value) : String(internalValue)

    // Build aria-describedby
    const describedByIds = [
      ariaDescribedBy,
      ariaDescribedByProp,
      helperText && !hasError ? helperId : undefined,
      hasError ? errorId : undefined,
    ].filter(Boolean).join(' ') || undefined

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)

      if (validation.length > 0) {
        const result = validateInput(newValue, validation)
        setValidationResult(result)
        onValidationChange?.(result)

        // Announce validation results
        if (hasBeenFocused) {
          if (!result.isValid && announceErrors) {
            announce(`Validation error: ${result.errors[0]}`, 'assertive')
          } else if (result.isValid && announceSuccess && newValue.length > 0) {
            announce('Input is valid', 'polite')
          }
        }
      }

      onChange?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      setHasBeenFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    const handleClear = () => {
      if (clearable && onClear) {
        onClear()
        setInternalValue('')
        announce('Input cleared', 'polite')
        
        // Focus back to input
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
    }

    // Announce errors when they change
    useEffect(() => {
      if (error && announceErrors && hasBeenFocused) {
        announce(`Error: ${error}`, 'assertive')
      }
    }, [error, announceErrors, hasBeenFocused, announce])

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    const iconPositionClasses = {
      left: icon ? (size === 'sm' ? 'pl-9' : size === 'md' ? 'pl-10' : 'pl-11') : '',
      right: icon ? (size === 'sm' ? 'pr-9' : size === 'md' ? 'pr-10' : 'pr-11') : ''
    }

    const clearButtonClasses = clearable && hasValue ? (size === 'sm' ? 'pr-9' : size === 'md' ? 'pr-10' : 'pr-11') : ''

    const inputClasses = cn(
      accessibleInputVariants({ variant, size, state: currentState }),
      iconPositionClasses[iconPosition],
      clearButtonClasses,
      floating && 'placeholder-transparent',
      prefersReducedMotion && 'motion-reduce:transition-none',
      className
    )

    const iconClasses = cn(
      'absolute top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none transition-colors duration-200',
      iconSizes[size || 'md'],
      {
        'left-3': iconPosition === 'left',
        'right-3': iconPosition === 'right' && !(clearable && hasValue),
        'text-primary-500': isFocused && !hasError,
        'text-error-500': hasError,
        'text-success-500': hasSuccess,
      }
    )

    // Create ARIA attributes
    const ariaAttributes = createAriaAttributes({
      label: ariaLabel,
      describedBy: describedByIds,
      invalid: hasError ? true : undefined,
      required: required,
    })

    const characterCount = currentValue.length
    const isOverLimit = maxLength ? characterCount > maxLength : false

    return (
      <div className="w-full">
        {/* Label */}
        {label && !floating && (
          <motion.label
            id={labelId}
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700 mb-2"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.2 }}
          >
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </motion.label>
        )}

        <div className="relative">
          <input
            {...props}
            {...ariaAttributes}
            ref={ref || inputRef}
            type={type}
            id={inputId}
            value={value}
            className={inputClasses}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Floating Label */}
          {label && floating && (
            <motion.label
              id={labelId}
              htmlFor={inputId}
              className={cn(
                'absolute left-3 text-secondary-500 pointer-events-none transition-all duration-200 origin-left',
                {
                  'top-1/2 -translate-y-1/2 text-sm': !isFocused && !hasValue,
                  'top-2 text-xs scale-75 text-primary-600': isFocused || hasValue,
                  'text-error-600': hasError && (isFocused || hasValue),
                  'text-success-600': hasSuccess && (isFocused || hasValue),
                }
              )}
              animate={prefersReducedMotion ? {} : {
                scale: isFocused || hasValue ? 0.75 : 1,
                y: isFocused || hasValue ? -20 : 0,
              }}
              transition={prefersReducedMotion ? {} : { duration: 0.2 }}
            >
              {label}
              {required && (
                <span className="text-error-500 ml-1" aria-label="required">
                  *
                </span>
              )}
            </motion.label>
          )}

          {/* Icon */}
          {icon && (
            <motion.div
              className={iconClasses}
              aria-hidden="true"
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={prefersReducedMotion ? {} : { duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          {/* Clear Button */}
          {clearable && hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 right-3 text-secondary-400 hover:text-secondary-600 focus:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 rounded-sm p-0.5 transition-colors duration-200',
                iconSizes[size || 'md']
              )}
              aria-label="Clear input"
              tabIndex={-1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-full h-full"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Focus Ring Animation */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-primary-500 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: isFocused && !hasError ? 0.2 : 0,
                scale: isFocused && !hasError ? 1 : 0.95,
              }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>

        {/* Character Count */}
        {showCharacterCount && maxLength && (
          <div className="mt-1 text-right">
            <span
              className={cn(
                'text-xs',
                isOverLimit ? 'text-error-600' : 'text-secondary-500'
              )}
              aria-live="polite"
            >
              {characterCount}/{maxLength}
            </span>
          </div>
        )}

        {/* Error/Helper Text */}
        <AnimatePresence mode="wait">
          {hasError && displayError ? (
            <motion.div
              key="error"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              transition={prefersReducedMotion ? {} : { duration: 0.2 }}
              className="mt-1"
            >
              <p
                id={errorId}
                className="text-sm text-error-600"
                role="alert"
                aria-live="polite"
              >
                {displayError}
              </p>
            </motion.div>
          ) : helperText ? (
            <motion.div
              key="helper"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              transition={prefersReducedMotion ? {} : { duration: 0.2 }}
              className="mt-1"
            >
              <p
                id={helperId}
                className="text-sm text-secondary-500"
              >
                {helperText}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Validation Warnings */}
        {showValidation && validationResult.warnings.length > 0 && hasBeenFocused && (
          <div className="mt-1">
            {validationResult.warnings.map((warning, index) => (
              <p
                key={index}
                className="text-sm text-warning-600"
                role="alert"
                aria-live="polite"
              >
                {warning}
              </p>
            ))}
          </div>
        )}

        {/* Screen reader only validation summary */}
        {showValidation && !validationResult.isValid && hasBeenFocused && (
          <div className="sr-only" aria-live="polite">
            Input validation failed: {validationResult.errors.join(', ')}
          </div>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'

export { AccessibleInput, validateInput, accessibleInputVariants }
export type { AccessibleInputProps, ValidationRule, ValidationResult }