@echo off
echo 🚀 Setting up Student Community Platform...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created. Please review and update the configuration.
)

REM Start the services
echo 🐳 Starting Docker services...
docker-compose up -d postgres redis

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Build and start the API service
echo 🔧 Building and starting API service...
docker-compose up -d api

REM Wait for API to be ready
echo ⏳ Waiting for API service to be ready...
timeout /t 15 /nobreak >nul

REM Run database migrations
echo 🗄️  Running database migrations...
docker-compose exec api pnpm exec prisma migrate deploy

REM Seed the database
echo 🌱 Seeding database with sample data...
docker-compose exec api pnpm run prisma:seed

REM Start ML service
echo 🤖 Starting ML service...
docker-compose up -d ml-service

REM Start web application
echo 🌐 Starting web application...
docker-compose up -d web

echo.
echo ✅ Setup complete! Services are starting up...
echo.
echo 📍 Service URLs:
echo    🌐 Web App:     http://localhost:3000
echo    🔌 API:         http://localhost:3001
echo    📚 API Docs:    http://localhost:3001/api/docs
echo    🤖 ML Service:  http://localhost:8001
echo.
echo 👤 Default accounts:
echo    Admin:      admin@example.com / admin123!
echo    Moderator:  moderator@example.com / mod123!
echo    User:       user1@example.com / user123!
echo.
echo 🔍 To view logs: docker-compose logs -f [service-name]
echo 🛑 To stop:      docker-compose down
echo.
echo Happy coding! 🎉