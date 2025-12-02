@echo off
echo ========================================
echo Goal Management Features - Quick Update
echo ========================================
echo.
echo IMPORTANT: Make sure your API server is stopped!
echo Press Ctrl+C now if it's still running.
echo.
pause
echo.

echo [1/4] Regenerating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma client
    echo Make sure the API server is stopped and try again.
    pause
    exit /b 1
)
echo ✓ Prisma client generated
echo.

echo [2/4] Pushing schema to database...
call npx prisma db push
if errorlevel 1 (
    echo ERROR: Failed to push schema
    echo Make sure MongoDB is running.
    pause
    exit /b 1
)
echo ✓ Schema pushed to database
echo.

echo [3/4] Updating existing goals...
node update-existing-goals.js
if errorlevel 1 (
    echo ERROR: Failed to update existing goals
    pause
    exit /b 1
)
echo ✓ Existing goals updated
echo.

echo [4/4] All done!
echo.
echo ========================================
echo ✓ Update Complete!
echo ========================================
echo.
echo New features available:
echo - Goals auto-remove when completed
echo - Goals marked as overdue after week ends
echo - New endpoints: /goals/history and /goals/overdue
echo.
echo Next steps:
echo 1. Start your API server: npm run start:dev
echo 2. Test the features: node ../../test-goal-completion-and-overdue.js YOUR_TOKEN
echo.
pause
