@echo off
echo 🚀 Setting up Forums in Database...
echo.

REM Step 1: Generate Prisma Client
echo 📦 Step 1: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    exit /b 1
)
echo ✅ Prisma client generated successfully
echo.

REM Step 2: Seed Forums
echo 🌱 Step 2: Seeding forums into database...
call npx ts-node prisma/seed-forums.ts
if errorlevel 1 (
    echo ❌ Failed to seed forums
    exit /b 1
)
echo ✅ Forums seeded successfully
echo.

echo 🎉 Setup complete! Forums are now in the database.
echo.
echo Next steps:
echo 1. Restart your backend server: npm run start:dev
echo 2. Forums will now be loaded from MongoDB
echo 3. Post counts will update in real-time
