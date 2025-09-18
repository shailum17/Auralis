# Student Community Platform - System Architecture

## Overview

This document outlines the end-to-end architecture for a privacy-first, scalable Student Community Platform designed to foster safe, supportive academic communities while maintaining strict privacy standards and data minimization principles.

## Architecture Principles

### Privacy-First Design
- **Data Minimization**: Collect only essential data required for functionality
- **Consent-Driven**: Explicit user consent for all data processing activities
- **Pseudonymization**: Personal identifiers separated from behavioral data
- **Right to Erasure**: Complete data deletion capabilities
- **Transparency**: Clear data usage policies and retention windows

### Security & Trust
- **Zero-Trust Network**: No implicit trust between services
- **Defense in Depth**: Multiple security layers
- **Least Privilege**: Minimal required permissions
- **Audit Everything**: Comprehensive logging and monitoring

### Scalability & Performance
- **Microservices Architecture**: Independent, scalable services
- **Event-Driven Design**: Asynchronous processing where possible
- **Caching Strategy**: Multi-layer caching for performance
- **Horizontal Scaling**: Auto-scaling based on demand

## System Context (C4 Level 1)

```mermaid
graph TB
    Student[Student Users]
    Moderator[Moderators]
    Admin[Administrators]
    
    SCP[Student Community Platform]
    
    Email[Email Service]
    S3[AWS S3]
    Analytics[Analytics Service]
    
    Student --> SCP
    Moderator --> SCP
    Admin --> SCP
    
    SCP --> Email
    SCP --> S3
    SCP --> Analytics
```

### External Dependencies
- **Email Service**: User verification and notifications
- **AWS S3**: File storage for avatars and resources
- **Analytics Service**: Anonymized usage analytics

## Container Diagram (C4 Level 2)

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Application<br/>Next.js + React]
        Mobile[Mobile App<br/>React Native]
    end
    
    subgraph "API Gateway"
        Gateway[NGINX/Kong<br/>Rate Limiting, WAF]
    end
    
    subgraph "Application Layer"
        API[API Service<br/>NestJS + TypeScript]
        ML[ML Service<br/>Python + FastAPI]
        Worker[Background Worker<br/>Node.js]
        WS[WebSocket Service<br/>Socket.io]
    end
    
    subgraph "Data Layer"
        Postgres[(PostgreSQL<br/>Primary Database)]
        Redis[(Redis<br/>Cache + Sessions)]
        S3[(AWS S3<br/>File Storage)]
    end
    
    subgraph "Monitoring"
        Prometheus[Prometheus]
        Grafana[Grafana]
        Loki[Loki Logs]
    end
    
    Web --> Gateway
    Mobile --> Gateway
    Gateway --> API
    Gateway --> WS
    
    API --> ML
    API --> Worker
    API --> Postgres
    API --> Redis
    API --> S3
    
    ML --> Redis
    Worker --> Postgres
    Worker --> Redis
    
    API --> Prometheus
    ML --> Prometheus
    Worker --> Prometheus
```

## Component Diagram (C4 Level 3) - API Service

```mermaid
graph TB
    subgraph "API Service"
        subgraph "Controllers"
            AuthC[Auth Controller]
            UserC[User Controller]
            PostC[Post Controller]
            ChatC[Chat Controller]
            ModC[Moderation Controller]
        end
        
        subgraph "Services"
            AuthS[Auth Service]
            UserS[User Service]
            PostS[Post Service]
            ChatS[Chat Service]
            MLS[ML Gateway Service]
        end
        
        subgraph "Guards & Middleware"
            JWTGuard[JWT Guard]
            RateLimit[Rate Limiter]
            RBAC[Role-Based Access]
            Audit[Audit Logger]
        end
        
        subgraph "Data Access"
            UserRepo[User Repository]
            PostRepo[Post Repository]
            ChatRepo[Chat Repository]
        end
    end
    
    AuthC --> AuthS
    UserC --> UserS
    PostC --> PostS
    ChatC --> ChatS
    ModC --> MLS
    
    AuthS --> UserRepo
    UserS --> UserRepo
    PostS --> PostRepo
    ChatS --> ChatRepo
    
    JWTGuard --> AuthS
    RateLimit --> Redis
    Audit --> Loki
```

## Data Model (ERD)

```mermaid
erDiagram
    User {
        uuid id PK
        string email UK
        string password_hash
        string username UK
        text bio
        string avatar_url
        json interests
        timestamp created_at
        timestamp updated_at
        boolean email_verified
        json privacy_settings
        timestamp last_active
    }
    
    Post {
        uuid id PK
        uuid author_id FK
        text content
        boolean is_anonymous
        json tags
        timestamp created_at
        timestamp updated_at
        boolean is_hidden
        uuid hidden_by_mod_id FK
        text hide_reason
    }
    
    Comment {
        uuid id PK
        uuid post_id FK
        uuid author_id FK
        uuid parent_id FK
        text content
        boolean is_anonymous
        timestamp created_at
        timestamp updated_at
        boolean is_hidden
        uuid hidden_by_mod_id FK
        text hide_reason
    }
    
    Reaction {
        uuid id PK
        uuid user_id FK
        uuid target_id
        string target_type
        string reaction_type
        timestamp created_at
    }
    
    ChatChannel {
        uuid id PK
        string name
        string type
        timestamp created_at
        timestamp updated_at
    }
    
    ChatChannelMember {
        uuid id PK
        uuid channel_id FK
        uuid user_id FK
        string role
        timestamp created_at
    }

    Message {
        uuid id PK
        uuid channel_id FK
        uuid sender_id FK
        text content
        timestamp created_at
        boolean is_deleted
    }
    
    Report {
        uuid id PK
        uuid reporter_id FK
        uuid target_id
        string target_type
        string reason
        text description
        string status
        uuid handled_by_id FK
        timestamp created_at
        timestamp resolved_at
    }
    
    ModerationAction {
        uuid id PK
        uuid moderator_id FK
        uuid target_id
        string target_type
        string action_type
        text reason
        timestamp expires_at
        timestamp created_at
    }
    
    StressScore {
        uuid id PK
        uuid user_id FK
        float score
        json features
        timestamp created_at
        date score_date
    }
    
    MoodEntry {
        uuid id PK
        uuid user_id FK
        integer mood_score
        json tags
        text notes
        timestamp created_at
    }
    
    User ||--o{ Post : creates
    User ||--o{ Comment : writes
    User ||--o{ Reaction : makes
    User ||--o{ Message : sends
    User ||--o{ Report : files
    User ||--o{ ChatChannelMember : is_member_of
    User ||--o{ ModerationAction : performs
    User ||--o{ StressScore : has
    User ||--o{ MoodEntry : logs
    
    Post ||--o{ Comment : has
    Post ||--o{ Reaction : receives
    Comment ||--o{ Reaction : receives
    Comment ||--o{ Comment : replies_to
    
    ChatChannel ||--o{ Message : contains
    ChatChannel ||--o{ ChatChannelMember : has_members
```

## Event Taxonomy

### User Events
- `user.registered` - New user account created
- `user.email_verified` - Email verification completed
- `user.profile_updated` - Profile information changed
- `user.login` - User authentication successful
- `user.logout` - User session ended

### Content Events
- `post.created` - New post published
- `post.updated` - Post content modified
- `post.deleted` - Post removed
- `comment.created` - New comment added
- `comment.updated` - Comment modified
- `reaction.added` - User reacted to content
- `reaction.removed` - User removed reaction

### Chat Events
- `message.sent` - Chat message delivered
- `channel.created` - New chat channel established
- `user.joined_channel` - User joined chat
- `user.left_channel` - User left chat

### Moderation Events
- `report.filed` - Content reported by user
- `content.hidden` - Content hidden by moderator
- `user.suspended` - User account suspended
- `user.banned` - User account banned

### Wellness Events
- `mood.logged` - User logged mood entry
- `stress_score.calculated` - ML stress score computed
- `banner.shown` - Wellness banner displayed
- `resource.accessed` - Wellness resource viewed

### System Events
- `rate_limit.exceeded` - Rate limit violation
- `security.suspicious_activity` - Potential security threat
- `system.error` - Application error occurred

## Sequence Diagrams

### User Login Flow
```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant A as API
    participant DB as Database
    participant R as Redis
    
    U->>W: Enter credentials
    W->>A: POST /auth/login
    A->>DB: Validate user credentials
    DB-->>A: User data
    A->>A: Generate JWT tokens
    A->>R: Store refresh token
    A-->>W: Access + Refresh tokens
    W->>W: Store tokens securely
    W-->>U: Login successful
```

### Anonymous Post Creation
```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant A as API
    participant ML as ML Service
    participant DB as Database
    participant Q as Event Queue
    
    U->>W: Create post (anonymous=true)
    W->>A: POST /posts (with auth)
    A->>A: Validate JWT, extract user_id
    A->>ML: Analyze content for safety
    ML-->>A: Safety score + flags
    A->>DB: Store post (author_id=user_id, is_anonymous=true)
    A->>Q: Emit post.created event
    A-->>W: Post created (author="Anonymous")
    W-->>U: Post published anonymously
```

### ML Stress Scoring Pipeline
```mermaid
sequenceDiagram
    participant S as Scheduler
    participant ML as ML Service
    participant A as API
    participant DB as Database
    participant N as Notification Service
    
    S->>ML: Trigger daily stress analysis
    ML->>A: GET /users/recent-activity
    A->>DB: Fetch user behavioral data
    DB-->>A: Activity patterns
    A-->>ML: Behavioral features
    ML->>ML: Analyze text + behavior
    ML->>ML: Calculate stress score
    ML->>A: POST /stress-scores
    A->>DB: Store stress scores
    A->>N: Trigger wellness notifications
    N->>N: Send supportive messages
```

## Risk Register & Mitigations

### Privacy Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data breach exposing PII | High | Medium | Encryption at rest/transit, access controls, audit logs |
| Unauthorized data access | High | Low | Zero-trust architecture, RBAC, regular access reviews |
| Data retention violations | Medium | Low | Automated deletion, retention policies, compliance monitoring |

### Security Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SQL injection attacks | High | Low | Parameterized queries, input validation, WAF |
| DDoS attacks | Medium | Medium | Rate limiting, CDN, auto-scaling |
| JWT token compromise | High | Low | Short expiry, refresh rotation, secure storage |

### Operational Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Service downtime | Medium | Medium | Multi-AZ deployment, health checks, circuit breakers |
| Data loss | High | Low | Automated backups, PITR, disaster recovery |
| Performance degradation | Medium | Medium | Monitoring, auto-scaling, caching |

### Content Safety Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Harmful content spread | High | Medium | ML content filtering, human moderation, reporting system |
| False stress detection | Medium | Medium | Human oversight, transparent thresholds, opt-out options |
| Privacy in anonymous posts | Medium | Medium | Secure anonymization, audit trails, access controls |

## Scaling Plan

### Horizontal Pod Autoscaling (HPA)
```yaml
# API Service HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-service
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling Strategy
- **Read Replicas**: 2-3 read replicas for query distribution
- **Connection Pooling**: PgBouncer for connection management
- **Partitioning**: Time-based partitioning for posts and messages
- **Archival**: Move old data to cold storage after retention period

### Caching Strategy
- **L1 Cache**: Application-level caching (Node.js memory)
- **L2 Cache**: Redis for session data and frequently accessed content
- **L3 Cache**: CDN for static assets and public content
- **Cache Invalidation**: Event-driven cache updates

### Performance Targets
- **API Response Time**: p95 < 200ms, p99 < 500ms
- **WebSocket Latency**: < 100ms for real-time messages
- **ML Inference**: < 150ms for text analysis
- **Database Queries**: < 50ms for simple queries, < 200ms for complex

## Zero-Trust Network Architecture

```mermaid
graph TB
    subgraph "Internet"
        User[Users]
    end
    
    subgraph "Edge Security"
        WAF[Web Application Firewall]
        CDN[CloudFront CDN]
        LB[Load Balancer]
    end
    
    subgraph "DMZ"
        Gateway[API Gateway]
    end
    
    subgraph "Private Network"
        subgraph "App Tier"
            API[API Services]
            ML[ML Services]
            Worker[Workers]
        end
        
        subgraph "Data Tier"
            DB[(Database)]
            Cache[(Redis)]
        end
    end
    
    subgraph "Security Services"
        IAM[Identity & Access Management]
        Secrets[Secrets Manager]
        Audit[Audit Logging]
    end
    
    User --> WAF
    WAF --> CDN
    CDN --> LB
    LB --> Gateway
    
    Gateway --> API
    Gateway --> ML
    
    API --> DB
    API --> Cache
    ML --> Cache
    Worker --> DB
    
    API --> IAM
    ML --> IAM
    Worker --> IAM
    
    API --> Secrets
    ML --> Secrets
    
    API --> Audit
    ML --> Audit
    Gateway --> Audit
```

### Security Controls
- **Network Segmentation**: Services isolated in separate subnets
- **Service Mesh**: Istio for service-to-service encryption
- **Certificate Management**: Automated TLS certificate rotation
- **Identity Verification**: mTLS for service authentication
- **Traffic Monitoring**: Real-time network traffic analysis

## Data Retention & Pseudonymization

### Retention Windows
- **Raw User Content**: 30 days (then pseudonymized)
- **Behavioral Features**: 90 days
- **Aggregated Analytics**: 2 years
- **Audit Logs**: 7 years (compliance requirement)
- **User Accounts**: Until deletion request

### Pseudonymization Process
1. **Immediate**: Replace direct identifiers with pseudonyms
2. **30 Days**: Remove quasi-identifiers from content
3. **90 Days**: Aggregate behavioral data, delete individual records
4. **1 Year**: Archive aggregated data to cold storage

### Data Minimization
- **Collection**: Only collect data necessary for functionality
- **Processing**: Process only with explicit consent
- **Storage**: Store in least identifiable form possible
- **Sharing**: No data sharing with third parties

This architecture provides a solid foundation for building a privacy-first, scalable student community platform that prioritizes user safety and data protection while maintaining high performance and reliability.