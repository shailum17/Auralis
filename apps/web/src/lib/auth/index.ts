/**
 * Authentication Module - Central exports for all auth-related functionality
 */

// Core authentication context and hooks
export { AuthProvider, useAuth, AuthContext } from '@/contexts/AuthContext';
export { useAuth as useAuthHook } from '@/hooks/useAuth';

// Authentication API client
export { authAPI } from '@/lib/auth-api';

// Authentication utilities and helpers
export { authUtils } from '@/lib/auth-utils';

// Form validation utilities
export { 
  FormValidator, 
  AuthValidationRules, 
  useFormValidation 
} from '@/lib/form-validation';

// Type definitions
export type {
  User,
  UserRole,
  AuthState,
  AuthContextType,
  AuthTokens,
  AuthResponse,
  LoginData,
  RegisterData,
  EmailVerificationData,
  OTPRequest,
  OTPVerification,
  OTPResponse,
  PasswordResetRequest,
  PasswordResetData,
  PasswordResetResponse,
  FormValidationError,
  FormValidationResult,
  SessionConfig,
  SessionData,
  Permission,
  RolePermissions,
  PasswordStrength,
  PasswordRequirement,
  OnboardingStep,
  OnboardingData,
  OnboardingResponse,
  AuthError,
  ValidationError,
  APIResponse,
  PaginatedResponse,
} from '@/types/auth';

// Re-export validation types from UI components
export type {
  ValidationRule,
  ValidationResult,
} from '@/components/ui/types';