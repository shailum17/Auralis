import { InputHTMLAttributes, forwardRef, ReactNode, useState, useId } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { ValidationRule, ValidationResult } from './types'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  validation?: ValidationRule[]
  showValidation?: boolean
  onValidationChange?: (result: ValidationResult) => void
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
    type = 'text',
    label,
    helperText,
    error,
    icon,
    iconPosition = 'left',
    size = 'md',
    validation = [],
    showValidation = false,
    onValidationChange,
    required,
    disabled,
    id: providedId,
    'aria-describedby': ariaDescribedBy,
    onChange,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState('')
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
    const displayError = error || (showValidation ? validationResult.errors[0] : undefined)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInternalValue(value)

      if (validation.length > 0) {
        const result = validateInput(value, validation)
        setValidationResult(result)
        onValidationChange?.(result)
      }

      onChange?.(e)
    }

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-4 text-base'
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

    const baseClasses = clsx(
      'w-full rounded-lg border bg-white transition-all duration-200 ease-in-out',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
      sizeClasses[size],
      iconPositionClasses[iconPosition],
      {
        'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !hasError,
        'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500': hasError,
      },
      className
    )

    const iconClasses = clsx(
      'absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none',
      iconSizes[size],
      {
        'left-3': iconPosition === 'left',
        'right-3': iconPosition === 'right',
      }
    )

    const describedBy = [
      ariaDescribedBy,
      helperText && !hasError ? helperTextId : undefined,
      hasError ? errorId : undefined,
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <input
            {...props}
            ref={ref}
            type={type}
            id={inputId}
            className={baseClasses}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={describedBy}
            disabled={disabled}
            required={required}
            onChange={handleChange}
          />

          {icon && (
            <div className={iconClasses} aria-hidden="true">
              {icon}
            </div>
          )}
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

export { Input, validateInput }
export type { InputProps, ValidationRule, ValidationResult }