#!/bin/bash

echo "🚀 Setting up Forums in Database..."
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✅ Prisma client generated successfully"
echo ""

# Step 2: Seed Forums
echo "🌱 Step 2: Seeding forums into database..."
npx ts-node prisma/seed-forums.ts
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed forums"
    exit 1
fi
echo "✅ Forums seeded successfully"
echo ""

echo "🎉 Setup complete! Forums are now in the database."
echo ""
echo "Next steps:"
echo "1. Restart your backend server: npm run start:dev"
echo "2. Forums will now be loaded from MongoDB"
echo "3. Post counts will update in real-time"
