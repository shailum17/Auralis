// Authentication Types and Interfaces

// Password strength interfaces
export interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  met: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  requirements: PasswordRequirement[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: string;
  avatarUrl?: string;
  
  // Contact information
  phone?: string;
  location?: string;
  pronouns?: string;
  
  // Verification status
  emailVerified: boolean;
  phoneVerified?: boolean;
  
  // Academic information
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
    courses?: string[];
    gpa?: number;
    graduationYear?: number;
  };
  
  // User preferences
  interests: string[];
  
  // Privacy settings
  privacySettings: {
    allowDirectMessages: boolean;
    showOnlineStatus: boolean;
    allowProfileViewing: boolean;
    dataCollection: boolean;
  };
  
  // Wellness settings
  wellnessSettings: {
    trackMood: boolean;
    trackStress: boolean;
    shareWellnessData: boolean;
    crisisAlertsEnabled: boolean;
    allowWellnessInsights: boolean;
  };
  
  // User preferences
  preferences?: {
    feedAlgorithm?: string;
    privacyLevel?: string;
    theme?: string;
    language?: string;
    timezone?: string;
    notifications?: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      messageNotifications?: boolean;
      postReactions?: boolean;
      commentReplies?: boolean;
      studyGroupInvites?: boolean;
      sessionReminders?: boolean;
      wellnessAlerts?: boolean;
      moderationActions?: boolean;
      systemAnnouncements?: boolean;
    };
  };
  
  // System fields
  role: UserRole;
  isActive: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
}

// Registration interfaces
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  bio?: string;
  interests?: string[];
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
    gpa?: number;
  };
  acceptTerms: boolean;
}

export interface RegisterResponse extends AuthResponse {
  requiresVerification?: boolean;
}

// Login interfaces
export interface LoginData {
  identifier: string; // email or username
  password: string;
  rememberMe?: boolean;
  sessionDuration?: number; // in hours
}

export interface LoginResponse extends AuthResponse {
  requiresVerification?: boolean;
}

// Email verification interfaces
export interface EmailVerificationData {
  email: string;
  otp: string;
}

export interface EmailVerificationResponse extends AuthResponse {}

// OTP interfaces
export interface OTPRequest {
  email?: string;
  username?: string;
  type: 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET';
}

export interface OTPVerification {
  email?: string;
  username?: string;
  otp: string;
  type: 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET';
  rememberMe?: boolean;
  sessionDuration?: number;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  email?: string;
  otpId?: string;
  error?: string;
}

// Password reset interfaces
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Form validation interfaces
export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
}

// Authentication state interfaces
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: AuthTokens | null;
}

export interface AuthContextType extends AuthState {
  // Initialization status
  isInitialized: boolean;
  
  // Authentication actions
  login: (data: LoginData) => Promise<LoginResponse>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  
  // Email verification
  verifyEmail: (data: EmailVerificationData) => Promise<EmailVerificationResponse>;
  resendVerificationEmail: (email: string) => Promise<OTPResponse>;
  
  // OTP operations
  requestOTP: (data: OTPRequest) => Promise<OTPResponse>;
  verifyOTP: (data: OTPVerification) => Promise<AuthResponse>;
  
  // Password reset
  requestPasswordReset: (data: PasswordResetRequest) => Promise<OTPResponse>;
  resetPassword: (data: PasswordResetData) => Promise<PasswordResetResponse>;
  
  // Token management
  refreshToken: () => Promise<boolean>;
  isSessionValid: () => boolean;
  ensureValidToken: () => Promise<boolean>;
  
  // User operations
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Session management interfaces
export interface SessionConfig {
  rememberMe: boolean;
  sessionDuration: number; // in hours
  autoRefresh: boolean;
}

export interface SessionData {
  user: User;
  tokens: AuthTokens;
  config: SessionConfig;
  expiresAt: Date;
}

// Permission and role interfaces
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// API response interfaces
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error interfaces
export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ValidationError extends AuthError {
  field: string;
  value?: any;
}

// Onboarding interfaces
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isRequired: boolean;
  isCompleted: boolean;
}

export interface OnboardingData {
  personalInfo: {
    fullName: string;
    bio?: string;
    dateOfBirth?: Date;
    gender?: string;
  };
  academicInfo: {
    institution?: string;
    major?: string;
    year?: number;
    gpa?: number;
    graduationYear?: number;
  };
  interests: string[];
  privacySettings: User['privacySettings'];
  wellnessSettings: User['wellnessSettings'];
  preferences: User['preferences'];
}

export interface OnboardingResponse extends AuthResponse {
  completedSteps?: string[];
  nextStep?: string;
}