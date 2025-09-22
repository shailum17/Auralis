#!/bin/bash

# Student Community Platform Setup Script
echo "🚀 Setting up Student Community Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update the configuration."
fi

# Start the services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Build and start the API service
echo "🔧 Building and starting API service..."
docker-compose up -d api

# Wait for API to be ready
echo "⏳ Waiting for API service to be ready..."
sleep 15

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec api pnpm exec prisma migrate deploy

# Seed the database
echo "🌱 Seeding database with sample data..."
docker-compose exec api pnpm run prisma:seed

# Start ML service
echo "🤖 Starting ML service..."
docker-compose up -d ml-service

# Start web application
echo "🌐 Starting web application..."
docker-compose up -d web

echo ""
echo "✅ Setup complete! Services are starting up..."
echo ""
echo "📍 Service URLs:"
echo "   🌐 Web App:     http://localhost:3000"
echo "   🔌 API:         http://localhost:3001"
echo "   📚 API Docs:    http://localhost:3001/api/docs"
echo "   🤖 ML Service:  http://localhost:8001"
echo ""
echo "👤 Default accounts:"
echo "   Admin:      admin@example.com / admin123!"
echo "   Moderator:  moderator@example.com / mod123!"
echo "   User:       user1@example.com / user123!"
echo ""
echo "🔍 To view logs: docker-compose logs -f [service-name]"
echo "🛑 To stop:      docker-compose down"
echo ""
echo "Happy coding! 🎉"