#!/bin/bash

echo "🔄 Regenerating Prisma Client..."
npx prisma generate

echo "📤 Pushing schema changes to database..."
npx prisma db push

echo "✅ Schema update complete!"
