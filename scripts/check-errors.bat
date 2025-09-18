@echo off
echo 🔍 Checking for errors in the codebase...

REM Check TypeScript compilation errors
echo 📝 Checking TypeScript compilation...
cd apps\api
npx tsc --noEmit
if errorlevel 1 (
    echo ❌ TypeScript compilation errors found in API
    exit /b 1
)
cd ..\..

cd apps\web
npx tsc --noEmit
if errorlevel 1 (
    echo ❌ TypeScript compilation errors found in Web
    exit /b 1
)
cd ..\..

REM Check Python syntax
echo 🐍 Checking Python syntax...
cd apps\ml-service
python -m py_compile src\main.py
if errorlevel 1 (
    echo ❌ Python syntax errors found in ML service
    exit /b 1
)

python -m py_compile src\api.py
if errorlevel 1 (
    echo ❌ Python syntax errors found in ML API
    exit /b 1
)
cd ..\..

REM Check for missing files
echo 📁 Checking for missing files...

if not exist "apps\api\tsconfig.json" (
    echo ❌ Missing apps\api\tsconfig.json
    exit /b 1
)

if not exist "apps\api\nest-cli.json" (
    echo ❌ Missing apps\api\nest-cli.json
    exit /b 1
)

if not exist "apps\web\next-env.d.ts" (
    echo ❌ Missing apps\web\next-env.d.ts
    exit /b 1
)

if not exist "apps\web\tsconfig.json" (
    echo ❌ Missing apps\web\tsconfig.json
    exit /b 1
)

if not exist "apps\ml-service\src\__init__.py" (
    echo ❌ Missing apps\ml-service\src\__init__.py
    exit /b 1
)

REM Check Docker configuration
echo 🐳 Checking Docker configuration...
docker-compose config >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose configuration errors
    exit /b 1
)

REM Check for environment variables
echo 🔧 Checking environment configuration...
if not exist ".env.example" (
    echo ❌ Missing .env.example file
    exit /b 1
)

echo ✅ All checks passed! No errors found.