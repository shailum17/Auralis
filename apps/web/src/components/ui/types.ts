// Shared types for UI components

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: string) => boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface PasswordRequirement {
  id: string
  label: string
  validator: (password: string) => boolean
  met: boolean
}

export interface PasswordStrength {
  score: number // 0-4
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
  requirements: PasswordRequirement[]
}