#!/bin/bash

# Development startup script
echo "🔧 Starting development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start database services
echo "🗄️  Starting database services..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd apps/api && pnpm exec prisma generate && cd ../..

# Run migrations
echo "🔄 Running database migrations..."
cd apps/api && pnpm exec prisma migrate dev && cd ../..

# Seed database
echo "🌱 Seeding database..."
cd apps/api && pnpm run prisma:seed && cd ../..

echo ""
echo "✅ Development environment ready!"
echo ""
echo "🚀 To start development servers:"
echo "   Terminal 1: cd apps/api && pnpm dev"
echo "   Terminal 2: cd apps/ml-service && python src/main.py"
echo "   Terminal 3: cd apps/web && pnpm dev"
echo ""
echo "📍 Development URLs:"
echo "   🌐 Web App:     http://localhost:3000"
echo "   🔌 API:         http://localhost:3001"
echo "   📚 API Docs:    http://localhost:3001/api/docs"
echo "   🤖 ML Service:  http://localhost:8001"