# Prisma Client Regeneration Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prisma Client Regeneration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will regenerate the Prisma Client to fix TypeScript errors." -ForegroundColor Yellow
Write-Host ""

# Step 1: Stop Node processes
Write-Host "Step 1: Stopping any running Node.js processes..." -ForegroundColor Green
try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Node processes stopped" -ForegroundColor Green
} catch {
    Write-Host "✓ No Node processes to stop" -ForegroundColor Green
}
Start-Sleep -Seconds 2

# Step 2: Clean Prisma cache
Write-Host ""
Write-Host "Step 2: Cleaning Prisma cache..." -ForegroundColor Green
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
    Write-Host "✓ Deleted .prisma folder" -ForegroundColor Green
} else {
    Write-Host "✓ .prisma folder not found (already clean)" -ForegroundColor Green
}

# Step 3: Navigate to API directory
Write-Host ""
Write-Host "Step 3: Navigating to API directory..." -ForegroundColor Green
Set-Location "apps\api"
Write-Host "✓ In API directory" -ForegroundColor Green

# Step 4: Regenerate Prisma Client
Write-Host ""
Write-Host "Step 4: Regenerating Prisma Client..." -ForegroundColor Green
Write-Host ""
npx prisma generate

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done! You can now restart your servers." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the servers, run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

# Return to root directory
Set-Location "..\..\"

Read-Host "Press Enter to exit"
