import { InputHTMLAttributes, forwardRef, ReactNode, useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ValidationRule, ValidationResult } from './types'

const inputVariants = cva(
  'w-full rounded-lg border bg-white transition-all duration-200 ease-in-out placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-50',
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

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  error?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  validation?: ValidationRule[]
  showValidation?: boolean
  onValidationChange?: (result: ValidationResult) => void
  floating?: boolean
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

const Input = forwardRef<HTMLInputElement, InputProps>(
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
    id: providedId,
    'aria-describedby': ariaDescribedBy,
    onChange,
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

    const id = useId()
    const inputId = providedId || id
    const helperTextId = `${inputId}-helper`
    const errorId = `${inputId}-error`

    const hasError = error || (!validationResult.isValid && showValidation)
    const hasSuccess = !hasError && validationResult.isValid && showValidation && String(internalValue).length > 0
    const displayError = error || (showValidation ? validationResult.errors[0] : undefined)
    
    const currentState = hasError ? 'error' : hasSuccess ? 'success' : state || 'default'
    const hasValue = Boolean(value !== undefined ? String(value).length > 0 : String(internalValue).length > 0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)

      if (validation.length > 0) {
        const result = validateInput(newValue, validation)
        setValidationResult(result)
        onValidationChange?.(result)
      }

      onChange?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    const iconPositionClasses = {
      left: icon ? (size === 'sm' ? 'pl-9' : size === 'md' ? 'pl-10' : 'pl-11') : '',
      right: icon ? (size === 'sm' ? 'pr-9' : size === 'md' ? 'pr-10' : 'pr-11') : ''
    }

    const inputClasses = cn(
      inputVariants({ variant, size, state: currentState }),
      iconPositionClasses[iconPosition],
      floating && 'placeholder-transparent',
      className
    )

    const iconClasses = cn(
      'absolute top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none transition-colors duration-200',
      iconSizes[size || 'md'],
      {
        'left-3': iconPosition === 'left',
        'right-3': iconPosition === 'right',
        'text-primary-500': isFocused && !hasError,
        'text-error-500': hasError,
        'text-success-500': hasSuccess,
      }
    )

    const describedBy = [
      ariaDescribedBy,
      helperText && !hasError ? helperTextId : undefined,
      hasError ? errorId : undefined,
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        {label && !floating && (
          <motion.label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700 mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
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
            ref={ref}
            type={type}
            id={inputId}
            value={value}
            className={inputClasses}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={describedBy}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Floating Label */}
          {label && floating && (
            <motion.label
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
              animate={{
                scale: isFocused || hasValue ? 0.75 : 1,
                y: isFocused || hasValue ? -20 : 0,
              }}
              transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          {/* Focus Ring Animation */}
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-primary-500 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isFocused && !hasError ? 0.2 : 0,
              scale: isFocused && !hasError ? 1 : 0.95,
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {hasError && displayError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-1"
            >
              <p
                id={errorId}
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {displayError}
              </p>
            </motion.div>
          ) : helperText ? (
            <motion.div
              key="helper"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-1"
            >
              <p
                id={helperTextId}
                className="text-sm text-gray-500"
              >
                {helperText}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {showValidation && validationResult.warnings.length > 0 && (
          <div className="mt-1">
            {validationResult.warnings.map((warning, index) => (
              <p
                key={index}
                className="text-sm text-yellow-600"
                role="alert"
                aria-live="polite"
              >
                {warning}
              </p>
            ))}
          </div>
        )}

        {/* Screen reader only validation summary */}
        {showValidation && !validationResult.isValid && (
          <div className="sr-only" aria-live="polite">
            Input validation failed: {validationResult.errors.join(', ')}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, validateInput, inputVariants }
export type { InputProps, ValidationRule, ValidationResult }