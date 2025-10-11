# Design Document

## Overview

This design document outlines the comprehensive enhancement of the user authentication system, dashboard, and user-centric features for the Auralis student wellbeing platform. The design focuses on creating a modern, accessible, and intuitive user experience while maintaining the existing technical architecture and improving upon current implementations.

The enhancement will leverage the existing Next.js 14 frontend with React 18, Tailwind CSS, Framer Motion for animations, and the NestJS backend with JWT authentication and OTP verification systems.

## Architecture

### Frontend Architecture

**Technology Stack:**
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Hook Form for form management
- Zustand for state management
- React Query for API state management

**Component Structure:**
```
src/
├── app/
│   ├── auth/
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   └── dashboard/
├── components/
│   ├── auth/
│   │   ├── AuthLayout.tsx
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── OTPInput.tsx
│   │   ├── PasswordStrengthIndicator.tsx
│   │   └── SocialAuthButtons.tsx
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx
│   │   ├── UserProfile.tsx
│   │   ├── WellnessOverview.tsx
│   │   └── NavigationSidebar.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
└── contexts/
    ├── AuthContext.tsx
    └── ThemeContext.tsx
```

### Backend Integration

**Existing API Endpoints (Enhanced):**
- `POST /auth/register` - User registration
- `POST /auth/login` - Password-based login
- `POST /auth/verify-password-request-otp` - Password verification + OTP request
- `POST /auth/verify-password-otp` - OTP verification after password
- `POST /auth/otp/request-login` - Direct OTP login request
- `POST /auth/otp/verify-login` - Direct OTP verification
- `POST /auth/refresh` - Token refresh
- `GET /users/profile` - User profile data
- `PUT /users/profile` - Update profile
- `GET /users/preferences` - User preferences
- `PUT /users/preferences` - Update preferences

## Components and Interfaces

### Authentication Components

#### Enhanced Login Form Component
```typescript
interface LoginFormProps {
  onSuccess: (user: User, tokens: AuthTokens) => void;
  onError: (error: string) => void;
}

interface LoginFormState {
  method: 'password' | 'otp';
  step: 'credentials' | 'otp-verification';
  formData: {
    email: string;
    password?: string;
  };
  otp: string[];
  loading: boolean;
  errors: Record<string, string>;
}
```

**Features:**
- Dual authentication methods (password + OTP, direct OTP)
- Real-time form validation
- Accessible OTP input with auto-focus
- Progressive enhancement for security
- Remember me functionality
- Social authentication integration points

#### Enhanced Registration Form Component
```typescript
interface SignupFormProps {
  onSuccess: (user: User) => void;
  onError: (error: string) => void;
}

interface SignupFormState {
  step: 'registration' | 'email-verification' | 'onboarding';
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    fullName: string;
    acceptTerms: boolean;
  };
  passwordStrength: PasswordStrength;
  otp: string[];
  loading: boolean;
  errors: Record<string, string>;
}
```

**Features:**
- Multi-step registration process
- Real-time password strength validation
- Email verification with OTP
- Progressive onboarding flow
- Terms and privacy acceptance
- Accessibility compliance

#### OTP Input Component
```typescript
interface OTPInputProps {
  length: number;
  value: string[];
  onChange: (otp: string[]) => void;
  onComplete: (otp: string) => void;
  loading?: boolean;
  error?: string;
  autoFocus?: boolean;
}
```

**Features:**
- Configurable length (default 6 digits)
- Auto-focus and navigation
- Paste support for full OTP codes
- Visual feedback for errors
- Accessibility support with ARIA labels

#### Password Strength Indicator
```typescript
interface PasswordStrengthProps {
  password: string;
  requirements: PasswordRequirement[];
  showRequirements?: boolean;
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  met: boolean;
}
```

**Features:**
- Real-time strength calculation
- Visual progress indicator
- Detailed requirement checklist
- Color-coded feedback
- Accessibility announcements

### Dashboard Components

#### Enhanced Dashboard Layout
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  notifications: Notification[];
}

interface DashboardState {
  sidebarCollapsed: boolean;
  activeSection: string;
  notifications: Notification[];
  theme: 'light' | 'dark' | 'system';
}
```

**Features:**
- Responsive sidebar navigation
- Notification center
- Theme switching
- Breadcrumb navigation
- Quick action shortcuts
- User profile dropdown

#### User Profile Management
```typescript
interface UserProfileProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
  editable?: boolean;
}

interface ProfileSection {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  icon: React.ComponentType<any>;
  badge?: string | number;
}
```

**Features:**
- Tabbed interface for different settings
- Real-time validation and saving
- Avatar upload with preview
- Privacy settings with explanations
- Academic information management
- Wellness preferences

#### Wellness Overview Dashboard
```typescript
interface WellnessOverviewProps {
  userId: string;
  timeRange: 'week' | 'month' | 'quarter';
}

interface WellnessMetrics {
  moodScore: number;
  stressLevel: number;
  activityLevel: number;
  sleepQuality: number;
  socialEngagement: number;
}
```

**Features:**
- Interactive wellness metrics
- Trend visualization
- Goal tracking
- Personalized insights
- Quick mood logging
- Wellness recommendations

### UI Components

#### Enhanced Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Enhanced Input Component
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'tel' | 'url';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  validation?: ValidationRule[];
}
```

## Data Models

### Enhanced User Model
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  role: 'STUDENT' | 'MODERATOR' | 'ADMIN';
  createdAt: Date;
  lastActive: Date;
  
  // Profile Information
  profile: UserProfile;
  
  // Settings
  preferences: UserPreferences;
  privacySettings: PrivacySettings;
  wellnessSettings: WellnessSettings;
  notificationSettings: NotificationSettings;
  
  // Academic Information
  academicInfo?: AcademicInfo;
  
  // Wellness Data
  wellnessMetrics?: WellnessMetrics;
}

interface UserProfile {
  fullName: string;
  bio?: string;
  interests: string[];
  pronouns?: string;
  timezone: string;
  language: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  feedAlgorithm: 'chronological' | 'relevance' | 'wellness';
  privacyLevel: 'public' | 'friends' | 'private';
  language: string;
  timezone: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface PrivacySettings {
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  allowProfileViewing: 'everyone' | 'community' | 'friends' | 'none';
  dataCollection: boolean;
  analyticsOptOut: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  postReactions: boolean;
  commentReplies: boolean;
  studyGroupInvites: boolean;
  sessionReminders: boolean;
  wellnessAlerts: boolean;
  moderationActions: boolean;
  systemAnnouncements: boolean;
}
```

### Authentication Models
```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

interface RegistrationData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface OTPVerification {
  email: string;
  otp: string;
  type: 'login' | 'registration' | 'password-reset' | 'email-verification';
}
```

## Error Handling

### Authentication Error Handling
```typescript
interface AuthError {
  code: string;
  message: string;
  field?: string;
  suggestions?: string[];
}

enum AuthErrorCodes {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_INVALID = 'OTP_INVALID',
  RATE_LIMITED = 'RATE_LIMITED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}
```

**Error Handling Strategy:**
- User-friendly error messages
- Contextual help and suggestions
- Graceful degradation for network issues
- Retry mechanisms for transient errors
- Clear recovery paths for users
- Accessibility-compliant error announcements

### Form Validation
```typescript
interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: string) => boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}
```

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Hook testing for custom authentication hooks
- Utility function testing
- Form validation testing
- API client testing

### Integration Testing
- Authentication flow testing
- Dashboard navigation testing
- Profile management testing
- Settings persistence testing

### End-to-End Testing
- Complete user registration flow
- Login with different methods
- Password reset flow
- Dashboard functionality
- Cross-browser compatibility

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast validation
- Focus management
- ARIA label verification

## Performance Considerations

### Frontend Optimization
- Code splitting for authentication routes
- Lazy loading of dashboard components
- Image optimization for avatars
- Bundle size optimization
- Caching strategies for user data

### API Optimization
- Request debouncing for real-time validation
- Optimistic updates for profile changes
- Efficient pagination for activity feeds
- Background sync for offline support

## Security Considerations

### Authentication Security
- Secure token storage (httpOnly cookies for refresh tokens)
- CSRF protection
- Rate limiting on authentication endpoints
- Secure password requirements
- OTP expiration and rate limiting
- Session management and concurrent login handling

### Data Protection
- Input sanitization and validation
- XSS protection
- Secure headers implementation
- Privacy-compliant data handling
- Audit logging for sensitive operations

## Accessibility Features

### WCAG 2.1 AA Compliance
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Color contrast ratios
- Focus indicators
- Screen reader support

### Keyboard Navigation
- Tab order management
- Skip links for main content
- Keyboard shortcuts for common actions
- Focus trapping in modals
- Escape key handling

### Assistive Technology Support
- ARIA labels and descriptions
- Live regions for dynamic content
- Role attributes for custom components
- State announcements for form validation

## Responsive Design

### Breakpoint Strategy
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1280px, 1536px
- Flexible grid system
- Scalable typography
- Touch-friendly interface elements

### Progressive Enhancement
- Core functionality without JavaScript
- Enhanced experience with JavaScript enabled
- Offline capability for critical features
- Graceful degradation for older browsers

## Animation and Micro-interactions

### Framer Motion Integration
- Page transitions
- Form state animations
- Loading states
- Success/error feedback
- Hover and focus effects
- Reduced motion support

### Performance Considerations
- GPU-accelerated animations
- Respect for user motion preferences
- Optimized animation timing
- Minimal layout thrashing