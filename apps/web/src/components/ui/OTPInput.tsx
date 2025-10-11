import { forwardRef, useRef, useEffect, useState, KeyboardEvent, ClipboardEvent } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

interface OTPInputProps {
  length?: number
  value?: string[]
  onChange?: (otp: string[]) => void
  onComplete?: (otp: string) => void
  loading?: boolean
  error?: string
  disabled?: boolean
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  placeholder?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  ({
    length = 6,
    value = [],
    onChange,
    onComplete,
    loading = false,
    error,
    disabled = false,
    autoFocus = true,
    size = 'md',
    className,
    placeholder = '○',
    'aria-label': ariaLabel = 'Enter verification code',
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState<string[]>(
      Array.from({ length }, (_, i) => value[i] || '')
    )
    const [focusedIndex, setFocusedIndex] = useState<number>(-1)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const completionCalledRef = useRef<string>('')

    const currentValue = value.length > 0 ? value : internalValue
    const isDisabled = disabled || loading

    // Update internal value when external value changes
    useEffect(() => {
      if (value.length > 0) {
        setInternalValue(Array.from({ length }, (_, i) => value[i] || ''))
      }
    }, [value, length])

    // Auto-focus first input on mount
    useEffect(() => {
      if (autoFocus && !isDisabled) {
        const firstEmptyIndex = currentValue.findIndex(val => !val)
        const indexToFocus = firstEmptyIndex === -1 ? 0 : firstEmptyIndex
        inputRefs.current[indexToFocus]?.focus()
      }
    }, [autoFocus, isDisabled])

    // Handle completion
    useEffect(() => {
      const filledValues = currentValue.filter(val => val !== '')
      const otpString = currentValue.join('')
      
      if (filledValues.length === length && onComplete && !isDisabled && completionCalledRef.current !== otpString) {
        completionCalledRef.current = otpString
        onComplete(otpString)
      }
      
      // Reset completion tracking when OTP is cleared
      if (filledValues.length === 0) {
        completionCalledRef.current = ''
      }
    }, [currentValue, length, onComplete, isDisabled])

    const updateValue = (newValue: string[], index?: number) => {
      if (value.length === 0) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)

      // Auto-focus next input
      if (index !== undefined && index < length - 1 && newValue[index]) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus()
        }, 0)
      }
    }

    const handleInputChange = (index: number, inputValue: string) => {
      // Only allow single digit/character
      const sanitizedValue = inputValue.slice(-1)
      
      const newValue = [...currentValue]
      newValue[index] = sanitizedValue

      updateValue(newValue, index)
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      const { key } = e

      if (key === 'Backspace') {
        e.preventDefault()
        const newValue = [...currentValue]
        
        if (currentValue[index]) {
          // Clear current input
          newValue[index] = ''
          updateValue(newValue)
        } else if (index > 0) {
          // Move to previous input and clear it
          newValue[index - 1] = ''
          updateValue(newValue)
          setTimeout(() => {
            inputRefs.current[index - 1]?.focus()
          }, 0)
        }
      } else if (key === 'Delete') {
        e.preventDefault()
        const newValue = [...currentValue]
        newValue[index] = ''
        updateValue(newValue)
      } else if (key === 'ArrowLeft' && index > 0) {
        e.preventDefault()
        inputRefs.current[index - 1]?.focus()
      } else if (key === 'ArrowRight' && index < length - 1) {
        e.preventDefault()
        inputRefs.current[index + 1]?.focus()
      } else if (key === 'Home') {
        e.preventDefault()
        inputRefs.current[0]?.focus()
      } else if (key === 'End') {
        e.preventDefault()
        inputRefs.current[length - 1]?.focus()
      } else if (/^[0-9a-zA-Z]$/.test(key)) {
        // Allow alphanumeric input
        e.preventDefault()
        const newValue = [...currentValue]
        newValue[index] = key
        updateValue(newValue, index)
      }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData('text/plain').trim()
      
      if (pastedData.length === length) {
        const newValue = pastedData.split('').slice(0, length)
        updateValue(newValue)
        
        // Focus the last input
        setTimeout(() => {
          inputRefs.current[length - 1]?.focus()
        }, 0)
      }
    }

    const handleFocus = (index: number) => {
      setFocusedIndex(index)
    }

    const handleBlur = () => {
      setFocusedIndex(-1)
    }

    const handleClick = (index: number) => {
      inputRefs.current[index]?.focus()
    }

    const sizeClasses = {
      sm: 'h-10 w-10 text-lg',
      md: 'h-12 w-12 text-xl',
      lg: 'h-14 w-14 text-2xl'
    }

    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4'
    }

    return (
      <div
        ref={ref}
        className={clsx('flex flex-col', className)}
        {...props}
      >
        <div
          className={clsx('flex justify-center', gapClasses[size])}
          role="group"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        >
          {Array.from({ length }, (_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <input
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={currentValue[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                onClick={() => handleClick(index)}
                disabled={isDisabled}
                placeholder={placeholder}
                className={clsx(
                  'text-center font-mono font-semibold rounded-lg border-2 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                  sizeClasses[size],
                  {
                    // Normal state
                    'border-gray-300 bg-white text-gray-900': !error && focusedIndex !== index,
                    'focus:border-blue-500 focus:ring-blue-500': !error,
                    
                    // Focused state
                    'border-blue-500 ring-2 ring-blue-500 ring-opacity-20 bg-blue-50': 
                      focusedIndex === index && !error,
                    
                    // Error state
                    'border-red-300 bg-red-50 text-red-900': error,
                    'focus:border-red-500 focus:ring-red-500': error,
                    'border-red-500 ring-2 ring-red-500 ring-opacity-20': 
                      focusedIndex === index && error,
                    
                    // Filled state
                    'border-green-300 bg-green-50': 
                      currentValue[index] && !error && focusedIndex !== index,
                  }
                )}
                aria-label={`Digit ${index + 1} of ${length}`}
                aria-invalid={error ? 'true' : 'false'}
              />
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex justify-center"
            >
              <p
                className="text-sm text-red-600 text-center"
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex justify-center"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-500" role="status" aria-live="polite">
              <svg
                className="animate-spin h-4 w-4"
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
              <span>Verifying...</span>
            </div>
          </motion.div>
        )}

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {currentValue.filter(val => val).length > 0 && (
            `${currentValue.filter(val => val).length} of ${length} digits entered`
          )}
        </div>
      </div>
    )
  }
)

OTPInput.displayName = 'OTPInput'

export { OTPInput }
export type { OTPInputProps }