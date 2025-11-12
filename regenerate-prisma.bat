@echo off
echo ========================================
echo Prisma Client Regeneration Script
echo ========================================
echo.
echo This script will regenerate the Prisma Client to fix TypeScript errors.
echo.
echo Step 1: Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Cleaning Prisma cache...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo Deleted .prisma folder
) else (
    echo .prisma folder not found
)

echo Step 3: Navigating to API directory...
cd apps\api

echo Step 4: Regenerating Prisma Client...
call npx prisma generate

echo.
echo ========================================
echo Done! You can now restart your servers.
echo ========================================
echo.
pause
