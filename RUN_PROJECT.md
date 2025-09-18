# 🚀 How to Run the Student Community Platform

## Prerequisites ✅
- ✅ Node.js 18+ (You have v22.18.0)
- ✅ Python 3.11+ (You have v3.13.7)
- ✅ pnpm installed
- ✅ Dependencies installed
- ✅ Database setup complete
- ✅ Environment configured

## Quick Start (3 Terminal Setup)

### Terminal 1: API Service
```bash
cd apps/api
$env:DATABASE_URL="file:./dev.db"
npm run dev
```

### Terminal 2: ML Service
```bash
cd apps/ml-service
pip install -r requirements.txt
python src/main.py
```

### Terminal 3: Web Application
```bash
cd apps/web
npm run dev
```

## Service URLs
- 🌐 **Web App**: http://localhost:3000
- 🔌 **API**: http://localhost:3001
- 📚 **API Docs**: http://localhost:3001/api/docs
- 🤖 **ML Service**: http://localhost:8001

## Default Test Accounts
- **Admin**: admin@example.com / admin123!
- **User**: user1@example.com / user123!

## API Endpoints Available

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh token

### Posts & Feed
- `GET /api/v1/posts` - Get posts feed
- `POST /api/v1/posts` - Create new post
- `GET /api/v1/posts/:id` - Get specific post
- `POST /api/v1/posts/:id/reactions` - Add reaction

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile

### Health Check
- `GET /api/v1/health` - API health status

## Testing the API

### 1. Register a new user:
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!"
  }'
```

### 2. Login:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 3. Create a post (use token from login):
```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "Hello from the API!",
    "tags": ["test", "api"],
    "isAnonymous": false
  }'
```

## Troubleshooting

### If API fails to start:
1. Check database connection:
   ```bash
   cd apps/api
   $env:DATABASE_URL="file:./dev.db"
   npx prisma db push
   ```

2. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

### If ML Service fails:
1. Install Python dependencies:
   ```bash
   cd apps/ml-service
   pip install -r requirements.txt
   ```

2. Check Python version:
   ```bash
   python --version  # Should be 3.11+
   ```

### If Web App fails:
1. Install dependencies:
   ```bash
   cd apps/web
   npm install
   ```

2. Check Next.js setup:
   ```bash
   npm run build
   ```

## Features to Test

### 1. Anonymous Posting
- Create posts with `"isAnonymous": true`
- Author will show as "Anonymous" publicly
- Still linked to user privately for moderation

### 2. Real-time Chat
- WebSocket connection at `ws://localhost:3001/chat`
- Create channels and send messages
- Typing indicators and presence

### 3. Wellness Features
- Mood tracking endpoints
- Stress analysis (when ML service is running)
- Wellness banners and recommendations

### 4. Moderation
- Report content
- Admin/moderator actions
- Content hiding and user management

## Development Tips

### Hot Reload
All services support hot reload:
- API: Automatically restarts on file changes
- ML Service: Use `--reload` flag with uvicorn
- Web: Next.js hot reload enabled

### Database Management
```bash
# View database
cd apps/api
npx prisma studio

# Reset database
npx prisma db push --force-reset
npx ts-node prisma/seed-simple.ts
```

### Logs and Debugging
- API logs: Console output in Terminal 1
- ML Service logs: Console output in Terminal 2
- Web logs: Console output in Terminal 3
- Browser DevTools for frontend debugging

## Next Steps

1. **Start all services** using the 3-terminal setup above
2. **Visit** http://localhost:3000 to see the web app
3. **Test API** using http://localhost:3001/api/docs (Swagger UI)
4. **Create test data** using the default accounts
5. **Explore features** like anonymous posting, chat, wellness tracking

The platform is now fully functional with:
- ✅ User authentication and authorization
- ✅ Anonymous posting system
- ✅ Real-time chat with WebSockets
- ✅ Wellness and mood tracking
- ✅ Content moderation tools
- ✅ ML-powered stress analysis
- ✅ Privacy-first design
- ✅ Comprehensive API documentation

Happy coding! 🎉