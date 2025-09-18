#!/bin/bash

echo "🔍 Checking for errors in the codebase..."

# Check TypeScript compilation errors
echo "📝 Checking TypeScript compilation..."
cd apps/api
if ! npx tsc --noEmit; then
    echo "❌ TypeScript compilation errors found in API"
    exit 1
fi
cd ../..

cd apps/web
if ! npx tsc --noEmit; then
    echo "❌ TypeScript compilation errors found in Web"
    exit 1
fi
cd ../..

# Check Python syntax
echo "🐍 Checking Python syntax..."
cd apps/ml-service
if ! python -m py_compile src/main.py; then
    echo "❌ Python syntax errors found in ML service"
    exit 1
fi

if ! python -m py_compile src/api.py; then
    echo "❌ Python syntax errors found in ML API"
    exit 1
fi
cd ../..

# Check for missing files
echo "📁 Checking for missing files..."

missing_files=()

# Check for essential API files
if [ ! -f "apps/api/tsconfig.json" ]; then
    missing_files+=("apps/api/tsconfig.json")
fi

if [ ! -f "apps/api/nest-cli.json" ]; then
    missing_files+=("apps/api/nest-cli.json")
fi

# Check for essential web files
if [ ! -f "apps/web/next-env.d.ts" ]; then
    missing_files+=("apps/web/next-env.d.ts")
fi

if [ ! -f "apps/web/tsconfig.json" ]; then
    missing_files+=("apps/web/tsconfig.json")
fi

# Check for Python __init__.py files
if [ ! -f "apps/ml-service/src/__init__.py" ]; then
    missing_files+=("apps/ml-service/src/__init__.py")
fi

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Missing files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

# Check for Docker issues
echo "🐳 Checking Docker configuration..."
if ! docker-compose config > /dev/null 2>&1; then
    echo "❌ Docker Compose configuration errors"
    exit 1
fi

# Check for environment variables
echo "🔧 Checking environment configuration..."
if [ ! -f ".env.example" ]; then
    echo "❌ Missing .env.example file"
    exit 1
fi

echo "✅ All checks passed! No errors found."