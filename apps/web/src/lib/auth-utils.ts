import { User, UserRole, Permission, RolePermissions, PasswordStrength, PasswordRequirement } from '@/types/auth';
import { ValidationRule, ValidationResult } from '@/components/ui/types';

// Role-based permissions configuration
const ROLE_PERMISSIONS: RolePermissions = {
  USER: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'posts', action: 'create' },
    { resource: 'posts', action: 'read' },
    { resource: 'posts', action: 'update', conditions: { isOwner: true } },
    { resource: 'posts', action: 'delete', conditions: { isOwner: true } },
    { resource: 'comments', action: 'create' },
    { resource: 'comments', action: 'read' },
    { resource: 'comments', action: 'update', conditions: { isOwner: true } },
    { resource: 'comments', action: 'delete', conditions: { isOwner: true } },
    { resource: 'wellness', action: 'read' },
    { resource: 'wellness', action: 'update' },
  ],
  MODERATOR: [
    // Inherits all USER permissions plus:
    { resource: 'posts', action: 'moderate' },
    { resource: 'comments', action: 'moderate' },
    { resource: 'users', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'update' },
  ],
  ADMIN: [
    // Full access to all resources
    { resource: '*', action: '*' },
  ],
};

// Password strength requirements
const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    validator: (password: string) => password.length >= 8,
    met: false,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    validator: (password: string) => /[A-Z]/.test(password),
    met: false,
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    validator: (password: string) => /[a-z]/.test(password),
    met: false,
  },
  {
    id: 'number',
    label: 'At least one number',
    validator: (password: string) => /\d/.test(password),
    met: false,
  },
  {
    id: 'special',
    label: 'At least one special character',
    validator: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    met: false,
  },
];

class AuthUtils {
  // Permission checking
  hasPermission(user: User | null, resource: string, action: string, context?: Record<string, any>): boolean {
    if (!user) {
      console.debug('Permission denied: No user provided');
      return false;
    }

    if (!user.isActive) {
      console.debug('Permission denied: User is not active');
      return false;
    }

    const permissions = this.getUserPermissions(user.role);
    
    // Check for wildcard admin permissions
    if (permissions.some(p => p.resource === '*' && p.action === '*')) {
      console.debug(`Permission granted: Admin wildcard access for ${resource}:${action}`);
      return true;
    }

    // Find matching permission
    const permission = permissions.find(p => 
      (p.resource === resource || p.resource === '*') && 
      (p.action === action || p.action === '*')
    );

    if (!permission) {
      console.debug(`Permission denied: No matching permission for ${resource}:${action}`);
      return false;
    }

    // Check conditions if they exist
    if (permission.conditions && context) {
      const conditionsMet = this.checkConditions(permission.conditions, context, user);
      console.debug(`Permission ${conditionsMet ? 'granted' : 'denied'}: Conditions check for ${resource}:${action}`);
      return conditionsMet;
    }

    console.debug(`Permission granted: ${resource}:${action}`);
    return true;
  }

  private getUserPermissions(role: UserRole): Permission[] {
    const permissions: Permission[] = [];
    
    // Add role-specific permissions
    if (ROLE_PERMISSIONS[role]) {
      permissions.push(...ROLE_PERMISSIONS[role]);
    }

    // Inherit permissions from lower roles
    if (role === 'MODERATOR') {
      permissions.push(...(ROLE_PERMISSIONS.USER || []));
    } else if (role === 'ADMIN') {
      permissions.push(...(ROLE_PERMISSIONS.USER || []));
      permissions.push(...(ROLE_PERMISSIONS.MODERATOR || []));
    }

    return permissions;
  }

  private checkConditions(conditions: Record<string, any>, context: Record<string, any>, user: User): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'isOwner':
          if (value && context.userId !== user.id) return false;
          break;
        case 'isActive':
          if (value && !user.isActive) return false;
          break;
        case 'emailVerified':
          if (value && !user.emailVerified) return false;
          break;
        default:
          if (context[key] !== value) return false;
      }
    }
    return true;
  }

  // Role checking utilities
  isAdmin(user: User | null): boolean {
    return user?.role === 'ADMIN' && user?.isActive === true;
  }

  isModerator(user: User | null): boolean {
    return (user?.role === 'MODERATOR' || this.isAdmin(user)) && user?.isActive === true;
  }

  isUser(user: User | null): boolean {
    return user?.role === 'USER' && user?.isActive === true;
  }

  // Enhanced role checking
  hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role && user?.isActive === true;
  }

  hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(user, role));
  }

  isAtLeastRole(user: User | null, minimumRole: UserRole): boolean {
    if (!user || !user.isActive) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      'USER': 1,
      'MODERATOR': 2,
      'ADMIN': 3,
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const minimumLevel = roleHierarchy[minimumRole] || 0;
    
    return userLevel >= minimumLevel;
  }

  // Get role hierarchy level
  getRoleLevel(role: UserRole): number {
    const roleHierarchy: Record<UserRole, number> = {
      'USER': 1,
      'MODERATOR': 2,
      'ADMIN': 3,
    };
    return roleHierarchy[role] || 0;
  }

  // User status utilities
  isEmailVerified(user: User | null): boolean {
    return user?.emailVerified === true;
  }

  isActive(user: User | null): boolean {
    return user?.isActive === true;
  }

  isPhoneVerified(user: User | null): boolean {
    return user?.phoneVerified === true;
  }

  isFullyVerified(user: User | null): boolean {
    return this.isEmailVerified(user) && this.isActive(user);
  }

  // Check if user profile is complete
  isProfileComplete(user: User | null): boolean {
    if (!user) return false;
    
    return !!(
      user.fullName &&
      user.email &&
      user.username &&
      user.interests.length > 0 &&
      this.isEmailVerified(user)
    );
  }

  // Check if user needs onboarding
  needsOnboarding(user: User | null): boolean {
    if (!user) return true;
    
    return !(
      user.fullName &&
      user.interests.length > 0 &&
      user.privacySettings &&
      user.wellnessSettings
    );
  }

  // Check if user can perform authenticated actions
  canPerformAuthenticatedActions(user: User | null): boolean {
    return !!(
      user &&
      this.isActive(user) &&
      this.isEmailVerified(user)
    );
  }

  // Get user verification status
  getUserVerificationStatus(user: User | null): {
    email: boolean;
    phone: boolean;
    profile: boolean;
    onboarding: boolean;
    overall: boolean;
  } {
    return {
      email: this.isEmailVerified(user),
      phone: this.isPhoneVerified(user),
      profile: this.isProfileComplete(user),
      onboarding: !this.needsOnboarding(user),
      overall: this.canPerformAuthenticatedActions(user) && this.isProfileComplete(user),
    };
  }

  canAccessResource(user: User | null, resource: string): boolean {
    return this.hasPermission(user, resource, 'read');
  }

  canModifyResource(user: User | null, resource: string, context?: Record<string, any>): boolean {
    return this.hasPermission(user, resource, 'update', context);
  }

  // Enhanced permission checking methods
  canCreateResource(user: User | null, resource: string, context?: Record<string, any>): boolean {
    return this.hasPermission(user, resource, 'create', context);
  }

  canDeleteResource(user: User | null, resource: string, context?: Record<string, any>): boolean {
    return this.hasPermission(user, resource, 'delete', context);
  }

  canModerateResource(user: User | null, resource: string, context?: Record<string, any>): boolean {
    return this.hasPermission(user, resource, 'moderate', context);
  }

  // Bulk permission checking
  hasAnyPermission(user: User | null, permissions: Array<{ resource: string; action: string; context?: Record<string, any> }>): boolean {
    return permissions.some(({ resource, action, context }) => 
      this.hasPermission(user, resource, action, context)
    );
  }

  hasAllPermissions(user: User | null, permissions: Array<{ resource: string; action: string; context?: Record<string, any> }>): boolean {
    return permissions.every(({ resource, action, context }) => 
      this.hasPermission(user, resource, action, context)
    );
  }

  // Get all permissions for a user
  getAllUserPermissions(user: User | null): Permission[] {
    if (!user) return [];
    return this.getUserPermissions(user.role);
  }

  // Check if user can perform any action on a resource
  canAccessResourceAtAll(user: User | null, resource: string): boolean {
    if (!user) return false;
    
    const permissions = this.getUserPermissions(user.role);
    return permissions.some(p => 
      p.resource === resource || p.resource === '*'
    );
  }

  // Token utilities
  async validateToken(token: string): Promise<boolean> {
    try {
      if (!token) return false;
      
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  getTokenPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      return JSON.parse(atob(parts[1]));
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.getTokenPayload(token);
      if (!payload || !payload.exp) return true;
      
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= now;
    } catch (error) {
      return true;
    }
  }

  getTokenExpirationTime(token: string): Date | null {
    try {
      const payload = this.getTokenPayload(token);
      if (!payload || !payload.exp) return null;
      
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Password validation and strength checking
  validatePassword(password: string): PasswordStrength {
    const requirements = PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: req.validator(password),
    }));

    const metCount = requirements.filter(req => req.met).length;
    const score = Math.min(metCount, 4);
    
    let level: PasswordStrength['level'];
    let feedback: string[] = [];

    switch (score) {
      case 0:
      case 1:
        level = 'very-weak';
        feedback = ['Password is too weak', 'Add more character types'];
        break;
      case 2:
        level = 'weak';
        feedback = ['Password could be stronger', 'Consider adding more requirements'];
        break;
      case 3:
        level = 'fair';
        feedback = ['Password is acceptable', 'Add one more requirement for better security'];
        break;
      case 4:
        level = 'good';
        feedback = ['Password is good'];
        break;
      case 5:
        level = 'strong';
        feedback = ['Password is strong'];
        break;
      default:
        level = 'very-weak';
        feedback = ['Password is too weak'];
    }

    return {
      score,
      level,
      feedback,
      requirements,
    };
  }

  // Form validation utilities
  createEmailValidation(): ValidationRule[] {
    return [
      {
        type: 'required',
        message: 'Email is required',
      },
      {
        type: 'email',
        message: 'Please enter a valid email address',
      },
    ];
  }

  createUsernameValidation(): ValidationRule[] {
    return [
      {
        type: 'required',
        message: 'Username is required',
      },
      {
        type: 'minLength',
        value: 3,
        message: 'Username must be at least 3 characters',
      },
      {
        type: 'maxLength',
        value: 30,
        message: 'Username must be less than 30 characters',
      },
      {
        type: 'pattern',
        value: '^[a-zA-Z0-9_-]+$',
        message: 'Username can only contain letters, numbers, underscores, and hyphens',
      },
    ];
  }

  createPasswordValidation(): ValidationRule[] {
    return [
      {
        type: 'required',
        message: 'Password is required',
      },
      {
        type: 'minLength',
        value: 8,
        message: 'Password must be at least 8 characters',
      },
      {
        type: 'custom',
        validator: (password: string) => {
          const strength = this.validatePassword(password);
          return strength.score >= 3; // Require at least 'fair' strength
        },
        message: 'Password must meet security requirements',
      },
    ];
  }

  createConfirmPasswordValidation(originalPassword: string): ValidationRule[] {
    return [
      {
        type: 'required',
        message: 'Please confirm your password',
      },
      {
        type: 'custom',
        validator: (confirmPassword: string) => confirmPassword === originalPassword,
        message: 'Passwords do not match',
      },
    ];
  }

  createFullNameValidation(): ValidationRule[] {
    return [
      {
        type: 'required',
        message: 'Full name is required',
      },
      {
        type: 'minLength',
        value: 2,
        message: 'Full name must be at least 2 characters',
      },
      {
        type: 'maxLength',
        value: 100,
        message: 'Full name must be less than 100 characters',
      },
    ];
  }

  // User display utilities
  getUserDisplayName(user: User | null): string {
    if (!user) return 'Guest';
    return user.fullName || user.username || user.email;
  }

  getUserInitials(user: User | null): string {
    if (!user) return 'G';
    
    const name = user.fullName || user.username || user.email;
    const parts = name.split(' ');
    
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    
    return name.substring(0, 2).toUpperCase();
  }

  formatUserRole(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'MODERATOR':
        return 'Moderator';
      case 'USER':
        return 'User';
      default:
        return 'Unknown';
    }
  }

  // Enhanced user display utilities
  getUserShortName(user: User | null): string {
    if (!user) return 'Guest';
    
    if (user.fullName) {
      const parts = user.fullName.split(' ');
      return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    }
    
    return user.username || user.email.split('@')[0];
  }

  getUserAvatarUrl(user: User | null): string | null {
    return user?.avatarUrl || null;
  }

  formatUserStatus(user: User | null): string {
    if (!user) return 'Offline';
    if (!user.isActive) return 'Inactive';
    if (!user.emailVerified) return 'Unverified';
    return 'Active';
  }

  getUserStatusColor(user: User | null): 'green' | 'yellow' | 'red' | 'gray' {
    if (!user || !user.isActive) return 'gray';
    if (!user.emailVerified) return 'yellow';
    return 'green';
  }

  // Format user information for display
  formatUserInfo(user: User | null): {
    displayName: string;
    shortName: string;
    initials: string;
    role: string;
    status: string;
    statusColor: 'green' | 'yellow' | 'red' | 'gray';
    avatarUrl: string | null;
    isVerified: boolean;
    isComplete: boolean;
  } {
    return {
      displayName: this.getUserDisplayName(user),
      shortName: this.getUserShortName(user),
      initials: this.getUserInitials(user),
      role: this.formatUserRole(user?.role || 'USER'),
      status: this.formatUserStatus(user),
      statusColor: this.getUserStatusColor(user),
      avatarUrl: this.getUserAvatarUrl(user),
      isVerified: this.isFullyVerified(user),
      isComplete: this.isProfileComplete(user),
    };
  }

  // Session utilities
  getSessionDurationOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 1, label: '1 hour' },
      { value: 4, label: '4 hours' },
      { value: 8, label: '8 hours' },
      { value: 24, label: '1 day' },
      { value: 168, label: '1 week' },
      { value: 720, label: '30 days' },
    ];
  }

  formatSessionDuration(hours: number): string {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours < 168) {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else {
      const weeks = Math.floor(hours / 168);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
  }

  // URL and navigation utilities
  getRedirectUrl(user: User | null, intendedUrl?: string): string {
    if (!user) return '/auth/signin';
    
    // Check if email needs verification first
    if (!user.emailVerified) {
      return '/auth/verify-email';
    }
    
    // Check if user needs to complete onboarding
    if (this.needsOnboarding(user)) {
      return '/onboarding';
    }
    
    // If there's an intended URL and it's not an auth page, redirect there
    if (intendedUrl && 
        intendedUrl !== '/auth/signin' && 
        intendedUrl !== '/auth/signup' && 
        intendedUrl !== '/auth/verify-email' &&
        intendedUrl !== '/onboarding') {
      return intendedUrl;
    }
    
    return '/dashboard';
  }

  // Get next required step for user
  getNextRequiredStep(user: User | null): {
    step: 'signin' | 'verify-email' | 'onboarding' | 'complete';
    url: string;
    message: string;
  } {
    if (!user) {
      return {
        step: 'signin',
        url: '/auth/signin',
        message: 'Please sign in to continue',
      };
    }

    if (!user.emailVerified) {
      return {
        step: 'verify-email',
        url: '/auth/verify-email',
        message: 'Please verify your email address',
      };
    }

    if (this.needsOnboarding(user)) {
      return {
        step: 'onboarding',
        url: '/onboarding',
        message: 'Please complete your profile setup',
      };
    }

    return {
      step: 'complete',
      url: '/dashboard',
      message: 'Welcome back!',
    };
  }

  shouldRedirectToOnboarding(user: User | null): boolean {
    if (!user) return false;
    
    // Check if essential profile information is missing
    return !user.fullName || user.interests.length === 0;
  }

  shouldRedirectToEmailVerification(user: User | null): boolean {
    return user ? !user.emailVerified : false;
  }

  // Error handling utilities
  getAuthErrorMessage(error: string | undefined): string {
    if (!error) return 'An unexpected error occurred';
    
    // Map common error codes to user-friendly messages
    const errorMap: Record<string, string> = {
      'INVALID_CREDENTIALS': 'Invalid email/username or password',
      'EMAIL_NOT_VERIFIED': 'Please verify your email address before signing in',
      'ACCOUNT_LOCKED': 'Your account has been temporarily locked',
      'INVALID_OTP': 'Invalid or expired verification code',
      'OTP_EXPIRED': 'Verification code has expired. Please request a new one',
      'TOO_MANY_ATTEMPTS': 'Too many failed attempts. Please try again later',
      'EMAIL_ALREADY_EXISTS': 'An account with this email already exists',
      'USERNAME_ALREADY_EXISTS': 'This username is already taken',
      'WEAK_PASSWORD': 'Password does not meet security requirements',
      'NETWORK_ERROR': 'Network error. Please check your connection and try again',
    };
    
    return errorMap[error] || error;
  }

  // Security utilities
  sanitizeUserInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }

  // Rate limiting helpers
  checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    if (typeof window === 'undefined') return true;
    
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]');
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    localStorage.setItem(`rateLimit_${key}`, JSON.stringify(validAttempts));
    
    return true;
  }

  getRemainingAttempts(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): number {
    if (typeof window === 'undefined') return maxAttempts;
    
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]');
    const validAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    return Math.max(0, maxAttempts - validAttempts.length);
  }

  // Development utilities
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  getDevOTP(): string {
    // Return a fixed OTP for development
    return this.isDevelopment() ? '123456' : '';
  }

  // Logging utilities for debugging
  logPermissionCheck(user: User | null, resource: string, action: string, result: boolean, context?: Record<string, any>): void {
    if (this.isDevelopment()) {
      console.log(`Permission Check: ${user?.username || 'anonymous'} -> ${resource}:${action} = ${result}`, {
        user: user ? { id: user.id, role: user.role, active: user.isActive } : null,
        context,
      });
    }
  }
}

export const authUtils = new AuthUtils();