@echo off
echo 🔧 Starting development environment...

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pnpm is not installed. Installing pnpm...
    npm install -g pnpm
)

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Start database services
echo 🗄️  Starting database services...
docker-compose up -d postgres redis

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Generate Prisma client
echo 🔧 Generating Prisma client...
cd apps\api
npx prisma generate
cd ..\..

REM Run migrations
echo 🔄 Running database migrations...
cd apps\api
npx prisma migrate dev
cd ..\..

REM Seed database
echo 🌱 Seeding database...
cd apps\api
npm run prisma:seed
cd ..\..

echo.
echo ✅ Development environment ready!
echo.
echo 🚀 To start development servers:
echo    Terminal 1: cd apps\api ^&^& pnpm dev
echo    Terminal 2: cd apps\ml-service ^&^& python src\main.py
echo    Terminal 3: cd apps\web ^&^& pnpm dev
echo.
echo 📍 Development URLs:
echo    🌐 Web App:     http://localhost:3000
echo    🔌 API:         http://localhost:3001
echo    📚 API Docs:    http://localhost:3001/api/docs
echo    🤖 ML Service:  http://localhost:8001