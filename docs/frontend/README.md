# Frontend Documentation - Next.js Application

## Overview

The frontend is a modern Next.js 14 application built with TypeScript, featuring a comprehensive student community platform with real-time communication, wellness tracking, and privacy-first design.

## Technology Stack

### Core Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **React 18**: Modern React with concurrent features

### Key Libraries & Dependencies

#### UI & Styling
- **@headlessui/react**: Unstyled, accessible UI components
- **@heroicons/react**: Beautiful hand-crafted SVG icons
- **lucide-react**: Feature-rich icon library
- **framer-motion**: Production-ready motion library
- **tailwind-merge**: Utility for merging Tailwind classes
- **class-variance-authority**: Type-safe component variants

#### State Management & Data Fetching
- **zustand**: Lightweight state management
- **react-query**: Server state management and caching
- **react-hook-form**: Performant forms with easy validation
- **zod**: TypeScript-first schema validation

#### Charts & Visualization
- **chart.js**: Simple yet flexible JavaScript charting
- **react-chartjs-2**: React wrapper for Chart.js
- **recharts**: Composable charting library

#### Real-time & Communication
- **socket.io-client**: Real-time bidirectional event-based communication
- **axios**: Promise-based HTTP client

#### Development & Testing
- **@playwright/test**: End-to-end testing framework
- **@testing-library/react**: Simple and complete testing utilities
- **jest**: JavaScript testing framework
- **eslint**: Code linting and formatting

## Project Structure

```
apps/web/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes (Next.js)
│   ├── community/         # Community features
│   ├── dashboard/         # User dashboard
│   ├── wellness/          # Wellness tracking
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── community/         # Community features
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   ├── ui/                # Reusable UI components
│   └── wellness/          # Wellness components
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── ThemeContext.tsx   # Theme management
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useWellnessData.ts # Wellness data management
│   └── ...                # Other custom hooks
├── lib/                   # Utility libraries
│   ├── api.ts             # API client configuration
│   ├── auth-utils.ts      # Authentication utilities
│   ├── utils.ts           # General utilities
│   └── ...                # Other libraries
├── types/                 # TypeScript type definitions
│   ├── auth.ts            # Authentication types
│   └── global.d.ts        # Global type declarations
└── utils/                 # Helper utilities
    ├── wellnessDataManager.ts
    └── testWellnessSync.ts
```

## Key Features

### 1. Authentication System
- JWT-based authentication with refresh tokens
- Secure login/logout functionality
- Protected routes and role-based access
- Password reset and email verification

**Key Files:**
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/hooks/useAuth.ts` - Authentication hook
- `src/lib/auth-utils.ts` - Authentication utilities
- `src/app/(auth)/` - Authentication pages

### 2. Community Features
- Forum-style discussions with posts and comments
- Real-time chat functionality
- Anonymous posting capabilities
- Content moderation and reporting
- Tag-based organization

**Key Files:**
- `src/app/community/` - Community pages
- `src/components/community/` - Community components
- `src/lib/community-service.ts` - Community API service

### 3. Wellness Tracking
- Mood tracking and visualization
- Stress analysis integration with ML service
- Wellness data synchronization
- Privacy-preserving analytics

**Key Files:**
- `src/app/wellness/` - Wellness pages
- `src/components/wellness/` - Wellness components
- `src/hooks/useWellnessData.ts` - Wellness data hook
- `src/utils/wellnessDataManager.ts` - Data management

### 4. Dashboard & Profile
- Personalized user dashboard
- Profile management
- Activity tracking
- Settings and preferences

**Key Files:**
- `src/app/dashboard/` - Dashboard pages
- `src/components/dashboard/` - Dashboard components
- `src/lib/profile-service.ts` - Profile API service

### 5. Admin Panel
- User management
- Content moderation
- System analytics
- Configuration management

**Key Files:**
- `src/app/admin/` - Admin pages
- `src/components/admin/` - Admin components
- `src/lib/admin-utils.ts` - Admin utilities

## Development Guidelines

### Component Architecture
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow the compound component pattern for complex UI
- Use Tailwind CSS for styling with design system tokens

### State Management
- Use Zustand for client-side state
- Use React Query for server state
- Implement proper error boundaries
- Handle loading and error states consistently

### Performance Optimization
- Implement code splitting with Next.js dynamic imports
- Use React.memo for expensive components
- Optimize images with Next.js Image component
- Implement proper caching strategies

### Testing Strategy
- Unit tests with Jest and Testing Library
- Integration tests for critical user flows
- E2E tests with Playwright
- Visual regression testing for UI components

## API Integration

### REST API Communication
```typescript
// Example API service
import { api } from '@/lib/api';

export const communityService = {
  getPosts: () => api.get('/posts'),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`)
};
```

### Real-time Communication
```typescript
// Socket.io integration
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('newMessage', (message) => {
  // Handle real-time message
});
```

### Error Handling
- Implement global error boundaries
- Use consistent error messaging
- Handle network failures gracefully
- Provide user-friendly error feedback

## Security Considerations

### Client-Side Security
- Sanitize user inputs
- Implement CSP headers
- Use HTTPS in production
- Validate data on both client and server

### Privacy Protection
- Minimize data collection
- Implement proper consent management
- Use secure storage for sensitive data
- Follow GDPR compliance guidelines

## Build & Deployment

### Development Build
```bash
cd apps/web
npm run dev
```

### Production Build
```bash
cd apps/web
npm run build
npm run start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Structure
- Unit tests: `__tests__` directories
- E2E tests: `tests/` directory
- Test utilities: `src/lib/__tests__/`

## Performance Monitoring

### Core Web Vitals
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Monitoring Tools
- Next.js built-in analytics
- Web Vitals reporting
- Error tracking with boundaries
- Performance profiling

## Accessibility

### WCAG Compliance
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

### Implementation
- Use Headless UI for accessible components
- Implement focus management
- Provide alternative text for images
- Support high contrast mode

## Future Enhancements

### Planned Features
- Progressive Web App (PWA) capabilities
- Offline functionality
- Push notifications
- Advanced analytics dashboard
- Multi-language support

### Technical Improvements
- Server-side rendering optimization
- Bundle size optimization
- Advanced caching strategies
- Performance monitoring integration