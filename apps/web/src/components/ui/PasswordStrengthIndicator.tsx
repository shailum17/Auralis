import { useMemo } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PasswordRequirement, PasswordStrength } from './types'

interface PasswordStrengthIndicatorProps {
  password: string
  requirements?: Omit<PasswordRequirement, 'met'>[]
  showRequirements?: boolean
  showStrengthBar?: boolean
  className?: string
  'aria-label'?: string
}

const DEFAULT_REQUIREMENTS: Omit<PasswordRequirement, 'met'>[] = [
  {
    id: 'minLength',
    label: 'At least 8 characters',
    validator: (password) => password.length >= 8
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    validator: (password) => /[A-Z]/.test(password)
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    validator: (password) => /[a-z]/.test(password)
  },
  {
    id: 'number',
    label: 'One number',
    validator: (password) => /\d/.test(password)
  },
  {
    id: 'special',
    label: 'One special character',
    validator: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
]

const calculatePasswordStrength = (
  password: string,
  requirements: Omit<PasswordRequirement, 'met'>[]
): PasswordStrength => {
  if (!password) {
    return {
      score: 0,
      level: 'very-weak',
      feedback: ['Enter a password'],
      requirements: requirements.map(req => ({ ...req, met: false }))
    }
  }

  const evaluatedRequirements = requirements.map(req => ({
    ...req,
    met: req.validator(password)
  }))

  const metRequirements = evaluatedRequirements.filter(req => req.met).length
  const totalRequirements = requirements.length

  // Calculate score based on met requirements and additional factors
  let score = Math.floor((metRequirements / totalRequirements) * 4)
  
  // Bonus points for length
  if (password.length >= 12) score = Math.min(score + 1, 4)
  if (password.length >= 16) score = Math.min(score + 1, 4)
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score = Math.max(score - 1, 0) // Repeated characters
  if (/123|abc|qwe/i.test(password)) score = Math.max(score - 1, 0) // Sequential patterns

  const levels: PasswordStrength['level'][] = ['very-weak', 'weak', 'fair', 'good', 'strong']
  const level = levels[score] || 'very-weak'

  const feedback: string[] = []
  
  if (score === 0) {
    feedback.push('Very weak password')
  } else if (score === 1) {
    feedback.push('Weak password')
  } else if (score === 2) {
    feedback.push('Fair password')
  } else if (score === 3) {
    feedback.push('Good password')
  } else {
    feedback.push('Strong password')
  }

  // Add specific feedback
  if (password.length < 8) {
    feedback.push('Use at least 8 characters')
  }
  if (metRequirements < totalRequirements) {
    const unmetCount = totalRequirements - metRequirements
    feedback.push(`Meet ${unmetCount} more requirement${unmetCount > 1 ? 's' : ''}`)
  }
  if (password.length >= 12) {
    feedback.push('Great length!')
  }

  return {
    score,
    level,
    feedback,
    requirements: evaluatedRequirements
  }
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  requirements = DEFAULT_REQUIREMENTS,
  showRequirements = true,
  showStrengthBar = true,
  className,
  'aria-label': ariaLabel = 'Password strength indicator'
}) => {
  const strength = useMemo(
    () => calculatePasswordStrength(password, requirements),
    [password, requirements]
  )

  const strengthColors = {
    'very-weak': 'bg-red-500',
    'weak': 'bg-orange-500',
    'fair': 'bg-yellow-500',
    'good': 'bg-blue-500',
    'strong': 'bg-green-500'
  }

  const strengthTextColors = {
    'very-weak': 'text-red-700',
    'weak': 'text-orange-700',
    'fair': 'text-yellow-700',
    'good': 'text-blue-700',
    'strong': 'text-green-700'
  }

  const strengthLabels = {
    'very-weak': 'Very Weak',
    'weak': 'Weak',
    'fair': 'Fair',
    'good': 'Good',
    'strong': 'Strong'
  }

  return (
    <div className={clsx('space-y-3', className)} aria-label={ariaLabel}>
      {showStrengthBar && password && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Password Strength
            </span>
            <span
              className={clsx('text-sm font-medium', strengthTextColors[strength.level])}
              aria-live="polite"
            >
              {strengthLabels[strength.level]}
            </span>
          </div>
          
          <div className="flex space-x-1" role="progressbar" aria-valuenow={strength.score} aria-valuemax={4}>
            {Array.from({ length: 4 }, (_, index) => (
              <motion.div
                key={index}
                className={clsx(
                  'h-2 flex-1 rounded-full transition-colors duration-300',
                  index < strength.score
                    ? strengthColors[strength.level]
                    : 'bg-gray-200'
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              />
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            {strength.feedback.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm text-gray-600" aria-live="polite">
                  {strength.feedback[0]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {showRequirements && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Password Requirements
          </h4>
          <ul className="space-y-2" role="list">
            {strength.requirements.map((requirement) => (
              <li
                key={requirement.id}
                className="flex items-center space-x-2"
              >
                <div
                  className={clsx(
                    'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200',
                    requirement.met
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  )}
                  aria-hidden="true"
                >
                  {requirement.met ? (
                    <CheckIcon className="w-3 h-3" />
                  ) : (
                    <XMarkIcon className="w-3 h-3" />
                  )}
                </div>
                <span
                  className={clsx(
                    'text-sm transition-colors duration-200',
                    requirement.met
                      ? 'text-green-700 font-medium'
                      : 'text-gray-600'
                  )}
                >
                  {requirement.label}
                </span>
                <span className="sr-only">
                  {requirement.met ? 'Met' : 'Not met'}
                </span>
              </li>
            ))}
          </ul>
          
          {/* Screen reader summary */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {strength.requirements.filter(req => req.met).length} of {strength.requirements.length} requirements met.
            Password strength: {strengthLabels[strength.level]}.
          </div>
        </div>
      )}
    </div>
  )
}

export { PasswordStrengthIndicator, calculatePasswordStrength, DEFAULT_REQUIREMENTS }
export type { PasswordStrengthIndicatorProps }