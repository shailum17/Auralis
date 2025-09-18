#!/bin/bash

echo "🔧 Generating Prisma client..."

cd apps/api
if ! npx prisma generate; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated successfully!"
cd ../..