@echo off
echo 🚀 Starting Student Community Platform...

REM Set environment variable
set DATABASE_URL=file:./apps/api/dev.db

echo 📝 Starting services in separate windows...

REM Start API Service
echo 🔌 Starting API Service...
start "API Service" cmd /k "cd apps/api && set DATABASE_URL=file:./dev.db && npm run dev"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start ML Service
echo 🤖 Starting ML Service...
start "ML Service" cmd /k "cd apps/ml-service && python src/main.py"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Web Application
echo 🌐 Starting Web Application...
start "Web App" cmd /k "cd apps/web && npm run dev"

echo ✅ All services starting...
echo.
echo 📍 Service URLs:
echo    🌐 Web App:     http://localhost:3000
echo    🔌 API:         http://localhost:3001
echo    📚 API Docs:    http://localhost:3001/api/docs
echo    🤖 ML Service:  http://localhost:8001
echo.
echo 👤 Default accounts:
echo    Admin:      admin@example.com / admin123!
echo    User:       user1@example.com / user123!
echo.
echo Press any key to exit...
pause >nul