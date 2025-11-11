@echo off
echo Regenerating Prisma Client...
call npx prisma generate

echo Pushing schema changes to database...
call npx prisma db push

echo Schema update complete!
pause
