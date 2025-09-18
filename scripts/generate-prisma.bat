@echo off
echo 🔧 Generating Prisma client...

cd apps\api
npx prisma generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    exit /b 1
)

echo ✅ Prisma client generated successfully!
cd ..\..