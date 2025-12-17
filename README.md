# Student Community Platform

A comprehensive, privacy-first student community platform designed to foster safe, supportive academic communities while maintaining strict privacy standards and data minimization principles. Built with modern technologies and a focus on mental wellness, real-time communication, and community engagement.

## 🌟 Features

### Core Functionality
- **Multi-User Support**: ✅ Unlimited concurrent users with complete data isolation
- **User Authentication**: Secure JWT-based auth with refresh tokens
- **Anonymous Posting**: Post anonymously while maintaining private user linkage
- **Community Forums**: Create posts, comments, and reactions with tag-based organization
- **Real-time Chat**: Direct messages and group chats with WebSocket support
- **Feed System**: Main and topic-based feeds with multiple sorting options

### Privacy & Wellness
- **Privacy-First Design**: Data minimization, pseudonymization, and user consent
- **Mood Tracking**: Optional mood logging with trend analysis
- **Stress Analysis**: ML-powered stress detection with transparent, non-diagnostic insights
- **Wellness Banners**: Contextual support messages and resource recommendations
- **Content Moderation**: Community-driven reporting with human oversight

### Safety & Moderation
- **Content Safety**: Automated toxicity detection with human moderation
- **Reporting System**: User-friendly content and user reporting
- **Moderation Tools**: Admin dashboard for content management
- **Rate Limiting**: Comprehensive abuse prevention

## 🏗️ Architecture

### Technology Stack

#### Frontend (Next.js 14 App)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Headless UI, Heroicons, Lucide React
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form with Zod validation
- **Charts**: Chart.js, Recharts
- **Animation**: Framer Motion, Lenis
- **Real-time**: Socket.io Client
- **Testing**: Jest, Playwright, Testing Library

#### Backend (NestJS API)
- **Framework**: NestJS with TypeScript
- **Database**: Prisma ORM with PostgreSQL/SQLite
- **Authentication**: JWT with Passport strategies
- **Real-time**: Socket.io WebSocket gateway
- **Validation**: Class Validator, Zod
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, Rate limiting, CORS
- **Email**: Nodemailer integration
- **Testing**: Jest, Supertest

#### ML Service (Python FastAPI)
- **Framework**: FastAPI with Pydantic
- **Language**: Python 3.11+
- **Server**: Uvicorn ASGI server
- **Configuration**: Pydantic Settings
- **CORS**: FastAPI CORS middleware
- **Logging**: Custom logging setup
- **Environment**: Python-dotenv

#### Infrastructure & DevOps
- **Containerization**: Docker with multi-stage builds
- **Development**: Hot reload, concurrent development
- **Package Management**: pnpm workspaces
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **CI/CD**: Ready for GitHub Actions, Docker deployment

### Privacy & Security
- **Zero-Trust Architecture**: No implicit trust between services
- **Data Encryption**: At rest and in transit
- **Audit Logging**: Comprehensive activity tracking
- **GDPR Compliance**: Right to erasure, data portability
- **Differential Privacy**: ML model protection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- pnpm (recommended) or npm

### Development Setup

#### Option 1: Quick Setup (Recommended)

**Windows:**
```cmd
scripts\setup.bat
```

**Linux/macOS:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-community-platform
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Database Setup**
   ```bash
   # Run migrations and seed
   docker-compose exec api npx prisma migrate deploy
   docker-compose exec api npm run prisma:seed
   ```

5. **Access the Application**
   - Web App: http://localhost:3000
   - API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs
   - ML Service: http://localhost:8001

#### Default Accounts
- **Admin**: admin@example.com / admin123!
- **Moderator**: moderator@example.com / mod123!
- **User**: user1@example.com / user123!

### Manual Development Setup

**Windows:**
```cmd
scripts\dev.bat
```

**Linux/macOS:**
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

Then start the development servers in separate terminals:

```bash
# Terminal 1 - API
cd apps/api && pnpm dev

# Terminal 2 - ML Service  
cd apps/ml-service && python src/main.py

# Terminal 3 - Web App
cd apps/web && pnpm dev
```

## 📁 Project Structure

```
student-community-platform/
├── apps/
│   ├── web/                    # Next.js 14 frontend application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── lib/           # Utility libraries
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── utils/         # Helper utilities
│   │   └── package.json       # Frontend dependencies
│   ├── api/                   # NestJS backend API
│   │   ├── src/
│   │   │   ├── modules/       # Feature modules
│   │   │   ├── common/        # Shared utilities
│   │   │   └── health/        # Health check endpoints
│   │   ├── prisma/            # Database schema & migrations
│   │   └── package.json       # Backend dependencies
│   └── ml-service/            # Python FastAPI ML service
│       ├── src/               # Python source code
│       ├── tests/             # ML service tests
│       └── requirements.txt   # Python dependencies
├── docs/                      # Comprehensive documentation
│   ├── architecture/          # System design documents
│   ├── frontend/              # Frontend documentation
│   ├── backend/               # Backend documentation
│   └── ml-service/            # ML service documentation
├── scripts/                   # Development & deployment scripts
└── package.json              # Root workspace configuration
```

## 🔐 Privacy & Security

### Data Protection
- **Minimal Data Collection**: Only essential data is collected
- **Pseudonymization**: Personal identifiers separated from content
- **Retention Policies**: Automated data deletion after retention periods
- **User Consent**: Granular privacy controls

### Security Measures
- **Authentication**: JWT with refresh token rotation
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Per-endpoint and global rate limits
- **Input Validation**: Comprehensive request validation
- **Security Headers**: CORS, CSP, and other security headers

### ML Privacy
- **No Medical Diagnosis**: Stress scores are supportive, not diagnostic
- **Transparent Models**: Interpretable algorithms with clear explanations
- **Differential Privacy**: Statistical privacy protection
- **User Control**: Opt-out options for all ML features

## 🧪 Testing

### Unit Tests
```bash
# API tests
cd apps/api
pnpm test

# ML service tests
cd apps/ml-service
pytest
```

### Integration Tests
```bash
# Cross-service tests
pnpm test:integration
```

### E2E Tests
```bash
# Web application E2E
cd apps/web
pnpm test:e2e
```

## 📊 Monitoring & Observability

### Metrics
- **Application Metrics**: Request rates, response times, error rates
- **Business Metrics**: User engagement, content creation, wellness trends
- **Infrastructure Metrics**: Resource usage, database performance

### Logging
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Privacy-Safe**: No PII in logs
- **Centralized**: Aggregated logging with search capabilities

### Alerting
- **SLO-based Alerts**: Service level objective monitoring
- **Anomaly Detection**: Unusual pattern detection
- **Escalation**: Automated incident response

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Consistent code formatting
- **Prettier**: Automated code formatting
- **Conventional Commits**: Standardized commit messages

### Privacy Guidelines
- Never log PII or sensitive data
- Implement privacy by design
- Document data flows
- Regular privacy impact assessments

## 📚 Documentation

### 📖 Complete Documentation

#### Service Documentation
- [**Frontend Documentation**](docs/frontend/README.md) - Next.js 14 app architecture, components, and features
- [**Backend Documentation**](docs/backend/README.md) - NestJS API, modules, and database design  
- [**ML Service Documentation**](docs/ml-service/README.md) - Python FastAPI service and ML capabilities

#### System Documentation
- [**Project Summary**](docs/PROJECT_SUMMARY.md) - Comprehensive overview of features and implementation
- [**Architecture Overview**](docs/architecture/README.md) - System design and service interactions
- [**Quick Start Guide**](RUN_PROJECT.md) - Get the platform running in 3 terminals
- [**Multi-User Support**](MULTI_USER_GUIDE.md) - Complete guide to concurrent user support

#### Technical Documentation
- [**API Documentation**](docs/api/) - REST API endpoints and WebSocket events
- [**Privacy & Security**](docs/security-privacy/) - Privacy-first design and security measures
- [**Deployment Guide**](docs/deployment/) - Production deployment instructions
- [**Contributing Guide**](CONTRIBUTING.md) - Development workflow and standards

### Multi-User System
✅ **Fully Supported** - The platform supports unlimited concurrent users with complete data isolation.

- [Quick Reference](QUICK_REFERENCE_MULTI_USER.md) - Quick facts and verification
- [User Data Isolation](docs/USER_DATA_ISOLATION.md) - Technical details
- [Architecture Diagrams](docs/architecture/MULTI_USER_ARCHITECTURE.md) - Visual guides
- [Test Suite](test-multi-user-isolation.js) - Automated verification

Run diagnostic: `node check-multi-user-setup.js`

## 🆘 Support

### Community Support
- GitHub Issues for bug reports
- Discussions for questions and ideas
- Wiki for community documentation

### Security Issues
For security vulnerabilities, please email security@example.com instead of creating public issues.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with privacy and student wellbeing in mind
- Inspired by best practices in mental health technology
- Community-driven development approach

---

**Note**: This platform is designed to support student wellbeing but is not a substitute for professional mental health services. If you're experiencing a mental health crisis, please contact your local emergency services or a mental health professional.