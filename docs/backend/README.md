# Backend Documentation - NestJS API

## Overview

The backend is a robust NestJS application built with TypeScript, providing a comprehensive REST API with real-time WebSocket support, authentication, and modular architecture for the student community platform.

## Technology Stack

### Core Technologies
- **NestJS**: Progressive Node.js framework for scalable server-side applications
- **TypeScript**: Type-safe JavaScript development
- **Prisma**: Next-generation ORM for database management
- **PostgreSQL/SQLite**: Primary database (SQLite for development, PostgreSQL for production)

### Key Libraries & Dependencies

#### Framework & Core
- **@nestjs/core**: NestJS core functionality
- **@nestjs/common**: Common NestJS utilities and decorators
- **@nestjs/platform-express**: Express platform adapter
- **reflect-metadata**: Metadata reflection API

#### Database & ORM
- **@prisma/client**: Prisma database client
- **prisma**: Prisma CLI and schema management

#### Authentication & Security
- **@nestjs/jwt**: JWT token management
- **@nestjs/passport**: Passport.js integration
- **passport-jwt**: JWT authentication strategy
- **passport-local**: Local authentication strategy
- **bcrypt**: Password hashing
- **helmet**: Security headers middleware

#### Real-time Communication
- **@nestjs/websockets**: WebSocket support
- **@nestjs/platform-socket.io**: Socket.io integration
- **socket.io**: Real-time bidirectional event-based communication

#### Validation & Documentation
- **class-validator**: Decorator-based validation
- **class-transformer**: Object transformation
- **@nestjs/swagger**: OpenAPI/Swagger documentation
- **zod**: TypeScript-first schema validation

#### Utilities & Services
- **axios**: HTTP client for external API calls
- **nodemailer**: Email sending functionality
- **redis**: Redis client for caching
- **uuid**: UUID generation
- **dotenv**: Environment variable management

#### Development & Testing
- **@nestjs/testing**: NestJS testing utilities
- **jest**: JavaScript testing framework
- **supertest**: HTTP assertion library
- **ts-jest**: TypeScript preprocessor for Jest

## Project Structure

```
apps/api/src/
├── modules/                # Feature modules
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── posts/             # Post management
│   ├── comments/          # Comment system
│   ├── chat/              # Real-time chat
│   ├── wellness/          # Wellness tracking
│   ├── community/         # Community features
│   ├── moderation/        # Content moderation
│   ├── analytics/         # Analytics tracking
│   ├── newsletter/        # Email newsletters
│   ├── resources/         # Resource management
│   ├── feed/              # Content feed
│   └── ml-gateway/        # ML service integration
├── common/                # Shared utilities
│   ├── database/          # Database configuration
│   ├── guards/            # Authentication guards
│   ├── decorators/        # Custom decorators
│   ├── prisma/            # Prisma service
│   ├── email/             # Email service
│   ├── repositories/      # Data repositories
│   └── types/             # Shared types
├── health/                # Health check endpoints
│   ├── health.controller.ts
│   ├── health.service.ts
│   └── health.module.ts
├── app.module.ts          # Root application module
└── main.ts                # Application entry point
```

## Key Modules

### 1. Authentication Module (`src/modules/auth/`)
Handles user authentication, registration, and JWT token management.

**Features:**
- User registration with email verification
- JWT-based authentication with refresh tokens
- Password reset functionality
- Role-based access control (RBAC)
- Session management

**Key Files:**
- `auth.controller.ts` - Authentication endpoints
- `auth.service.ts` - Authentication business logic
- `jwt.strategy.ts` - JWT authentication strategy
- `local.strategy.ts` - Local authentication strategy

### 2. Users Module (`src/modules/users/`)
Manages user profiles, preferences, and account settings.

**Features:**
- User profile management
- Privacy settings
- Account preferences
- User search and discovery
- Profile picture upload

### 3. Posts Module (`src/modules/posts/`)
Handles content creation, management, and interaction.

**Features:**
- Post creation and editing
- Anonymous posting support
- Tag-based categorization
- Post reactions (likes, dislikes)
- Content filtering and search

### 4. Comments Module (`src/modules/comments/`)
Manages comment system for posts and discussions.

**Features:**
- Nested comment threads
- Comment reactions
- Anonymous commenting
- Comment moderation
- Real-time comment updates

### 5. Chat Module (`src/modules/chat/`)
Provides real-time messaging capabilities.

**Features:**
- Direct messaging
- Group chat rooms
- Message history
- Typing indicators
- Online presence
- File sharing

### 6. Wellness Module (`src/modules/wellness/`)
Handles wellness tracking and mental health features.

**Features:**
- Mood tracking
- Stress level monitoring
- Wellness goal setting
- Progress analytics
- Integration with ML service

### 7. Community Module (`src/modules/community/`)
Manages community features and social interactions.

**Features:**
- Community creation and management
- Member roles and permissions
- Community events
- Discussion forums
- Community analytics

### 8. Moderation Module (`src/modules/moderation/`)
Provides content moderation and safety features.

**Features:**
- Content reporting system
- Automated content filtering
- Moderator tools
- User suspension/banning
- Audit logging

### 9. ML Gateway Module (`src/modules/ml-gateway/`)
Integrates with the Python ML service for AI-powered features.

**Features:**
- Stress analysis requests
- Content safety checking
- Sentiment analysis
- Recommendation engine
- ML model management

## Database Design

### Prisma Schema
The database schema is defined in `prisma/schema.prisma` and includes:

**Core Entities:**
- **User**: User accounts and profiles
- **Post**: Content posts with metadata
- **Comment**: Comment system with threading
- **Reaction**: Likes, dislikes, and other reactions
- **Chat**: Real-time messaging
- **WellnessEntry**: Wellness tracking data
- **Community**: Community groups and forums
- **Report**: Content and user reports

**Key Relationships:**
- User → Posts (one-to-many)
- Post → Comments (one-to-many)
- User → WellnessEntries (one-to-many)
- User → Communities (many-to-many)
- Post → Reactions (one-to-many)

### Database Operations
```typescript
// Example Prisma operations
const user = await this.prisma.user.create({
  data: {
    email: 'user@example.com',
    username: 'username',
    hashedPassword: 'hashed_password'
  }
});

const posts = await this.prisma.post.findMany({
  where: { authorId: userId },
  include: {
    author: true,
    comments: true,
    reactions: true
  }
});
```

## API Endpoints

### Authentication Endpoints
```
POST   /api/v1/auth/register     # User registration
POST   /api/v1/auth/login        # User login
POST   /api/v1/auth/refresh      # Refresh JWT token
POST   /api/v1/auth/logout       # User logout
POST   /api/v1/auth/forgot       # Password reset request
POST   /api/v1/auth/reset        # Password reset confirmation
```

### User Management
```
GET    /api/v1/users/profile     # Get user profile
PUT    /api/v1/users/profile     # Update user profile
GET    /api/v1/users/settings    # Get user settings
PUT    /api/v1/users/settings    # Update user settings
DELETE /api/v1/users/account     # Delete user account
```

### Posts & Content
```
GET    /api/v1/posts             # Get posts feed
POST   /api/v1/posts             # Create new post
GET    /api/v1/posts/:id         # Get specific post
PUT    /api/v1/posts/:id         # Update post
DELETE /api/v1/posts/:id         # Delete post
POST   /api/v1/posts/:id/reactions # Add reaction to post
```

### Comments
```
GET    /api/v1/comments/:postId  # Get post comments
POST   /api/v1/comments          # Create comment
PUT    /api/v1/comments/:id      # Update comment
DELETE /api/v1/comments/:id      # Delete comment
```

### Wellness
```
GET    /api/v1/wellness/entries  # Get wellness entries
POST   /api/v1/wellness/entries  # Create wellness entry
GET    /api/v1/wellness/analytics # Get wellness analytics
POST   /api/v1/wellness/goals    # Set wellness goals
```

### Real-time Events (WebSocket)
```
chat:join         # Join chat room
chat:leave        # Leave chat room
chat:message      # Send message
chat:typing       # Typing indicator
user:online       # User online status
post:reaction     # Real-time post reactions
comment:new       # New comment notification
```

## Security Implementation

### Authentication & Authorization
- JWT tokens with configurable expiration
- Refresh token rotation
- Role-based access control (RBAC)
- Protected routes with guards
- Rate limiting per endpoint

### Data Protection
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection with helmet
- CORS configuration

### Privacy Features
- Anonymous posting with user linkage
- Data minimization principles
- User consent management
- Right to erasure (GDPR)
- Audit logging for sensitive operations

## Real-time Features

### WebSocket Implementation
```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
})
export class ChatGateway {
  @SubscribeMessage('chat:message')
  handleMessage(client: Socket, payload: any) {
    // Handle real-time message
    this.server.to(payload.roomId).emit('chat:message', payload);
  }
}
```

### Supported Events
- Real-time chat messaging
- Live post reactions
- Typing indicators
- User presence status
- Notification delivery
- Live comment updates

## Configuration & Environment

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# JWT Configuration
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="your-refresh-secret"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# ML Service
ML_SERVICE_URL="http://localhost:8001"

# Application
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## Testing Strategy

### Unit Testing
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### Integration Testing
```bash
# Run e2e tests
npm run test:e2e
```

### Test Structure
- Unit tests: `*.spec.ts` files alongside source code
- Integration tests: `test/` directory
- Test utilities: Shared testing helpers
- Mock data: Test fixtures and factories

## Performance Optimization

### Database Optimization
- Proper indexing strategy
- Query optimization with Prisma
- Connection pooling
- Database migrations

### Caching Strategy
- Redis for session storage
- API response caching
- Database query caching
- Static asset caching

### Monitoring & Logging
- Structured logging with Winston
- Performance metrics collection
- Error tracking and alerting
- Health check endpoints

## Deployment

### Development Setup
```bash
cd apps/api
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## API Documentation

### Swagger/OpenAPI
- Automatic API documentation generation
- Interactive API explorer
- Request/response schemas
- Authentication examples

Access at: `http://localhost:3001/api/docs`

### Documentation Features
- Endpoint descriptions
- Parameter validation
- Response examples
- Error code documentation
- Authentication requirements

## Error Handling

### Global Exception Filter
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Global error handling logic
  }
}
```

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2023-12-17T10:00:00.000Z",
  "path": "/api/v1/posts"
}
```

## Future Enhancements

### Planned Features
- GraphQL API support
- Advanced analytics dashboard
- Machine learning integration
- Microservices architecture
- Event sourcing implementation

### Performance Improvements
- Database sharding
- Horizontal scaling
- Advanced caching strategies
- CDN integration
- Load balancing