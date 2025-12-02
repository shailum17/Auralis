@echo off
echo Updating Weekly Goals Schema...
echo.

echo Step 1: Generating Prisma Client...
call npx prisma generate

echo.
echo Step 2: Pushing schema changes to database...
call npx prisma db push

echo.
echo Step 3: Updating existing goals with new fields...
node update-existing-goals.js

echo.
echo ✅ Schema update complete!
echo.
echo New features:
echo - Goals auto-remove when completed
echo - Goals marked as overdue if not completed within the week
echo - New endpoints: /goals/history and /goals/overdue
echo.
pause
