# Troubleshooting Guide

This guide helps resolve common issues when setting up and running the Student Community Platform.

## 🚨 Common Issues

### Database Connection Issues

**Problem**: `Error: P1001: Can't reach database server`

**Solutions**:
1. Ensure PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Restart database service:
   ```bash
   docker-compose restart postgres
   ```

4. Verify connection string in `.env`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_community"
   ```

### Port Conflicts

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
1. Check what's using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/macOS
   lsof -i :3000
   ```

2. Kill the process or change ports in `.env`:
   ```
   PORT=3001
   WEB_PORT=3001
   ML_PORT=8002
   ```

### Docker Issues

**Problem**: `docker: command not found`

**Solutions**:
1. Install Docker Desktop from https://docker.com/get-started
2. Ensure Docker is running
3. Add Docker to your PATH

**Problem**: `permission denied while trying to connect to the Docker daemon`

**Solutions**:
1. **Linux**: Add user to docker group:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Windows**: Run as Administrator or ensure Docker Desktop is running

### Node.js/pnpm Issues

**Problem**: `pnpm: command not found`

**Solutions**:
1. Install pnpm globally:
   ```bash
   npm install -g pnpm
   ```

2. Or use npm instead:
   ```bash
   npm install
   npm run dev
   ```

**Problem**: `Node version mismatch`

**Solutions**:
1. Use Node.js 18 or higher:
   ```bash
   node --version  # Should be v18+
   ```

2. Use nvm to manage Node versions:
   ```bash
   # Install Node 18
   nvm install 18
   nvm use 18
   ```

### Python/ML Service Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`

**Solutions**:
1. Install Python dependencies:
   ```bash
   cd apps/ml-service
   pip install -r requirements.txt
   ```

2. Use virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/macOS
   source venv/bin/activate
   pip install -r requirements.txt
   ```

**Problem**: `Python version compatibility`

**Solutions**:
1. Use Python 3.11:
   ```bash
   python --version  # Should be 3.11+
   ```

2. Install Python 3.11 from https://python.org

### Prisma/Database Migration Issues

**Problem**: `Migration failed to apply`

**Solutions**:
1. Reset database:
   ```bash
   cd apps/api
   npx prisma migrate reset
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Apply migrations manually:
   ```bash
   npx prisma db push
   ```

### API Connection Issues

**Problem**: `Network Error` or `CORS Error`

**Solutions**:
1. Check API is running:
   ```bash
   curl http://localhost:3001/health
   ```

2. Verify CORS settings in `apps/api/src/main.ts`

3. Check environment variables:
   ```bash
   # In web app
   API_URL=http://localhost:3001
   ```

### ML Service Connection Issues

**Problem**: `ML service timeout` or `Bad Gateway`

**Solutions**:
1. Check ML service is running:
   ```bash
   curl http://localhost:8001/health
   ```

2. Increase timeout in API service:
   ```
   ML_SERVICE_TIMEOUT=10000
   ```

3. Check ML service logs:
   ```bash
   docker-compose logs ml-service
   ```

## 🔧 Development Tips

### Hot Reload Not Working

1. **API**: Ensure `--watch` flag is used:
   ```bash
   nest start --watch
   ```

2. **Web**: Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **ML Service**: Use development server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8001
   ```

### Performance Issues

1. **Database**: Add indexes for frequently queried fields
2. **API**: Enable caching with Redis
3. **Web**: Use Next.js Image optimization
4. **ML**: Implement model caching

### Memory Issues

1. **Docker**: Increase Docker memory limit
2. **Node.js**: Increase heap size:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

## 🧪 Testing Issues

### Unit Tests Failing

1. **API Tests**:
   ```bash
   cd apps/api
   npm run test
   ```

2. **Check test database**:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db" npm run test
   ```

### E2E Tests Failing

1. **Install Playwright**:
   ```bash
   cd apps/web
   npx playwright install
   ```

2. **Run tests**:
   ```bash
   npm run test:e2e
   ```

## 📊 Monitoring & Debugging

### Enable Debug Logging

1. **API**:
   ```
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

2. **ML Service**:
   ```
   FASTMCP_LOG_LEVEL=DEBUG
   ```

### Health Checks

1. **API Health**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **ML Service Health**:
   ```bash
   curl http://localhost:8001/health
   ```

3. **Database Health**:
   ```bash
   docker-compose exec postgres pg_isready -U postgres
   ```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f ml-service
docker-compose logs -f web
```

## 🆘 Getting Help

If you're still experiencing issues:

1. **Check the logs** for error messages
2. **Search existing issues** in the repository
3. **Create a new issue** with:
   - Operating system and version
   - Node.js and Python versions
   - Complete error message
   - Steps to reproduce
   - Relevant log output

## 🔄 Clean Reset

If all else fails, perform a clean reset:

```bash
# Stop all services
docker-compose down -v

# Remove all containers and volumes
docker system prune -a --volumes

# Remove node_modules
rm -rf node_modules apps/*/node_modules

# Remove Python cache
find . -name "__pycache__" -exec rm -rf {} +

# Start fresh
./scripts/setup.sh  # or setup.bat on Windows
```

This will give you a completely fresh installation.