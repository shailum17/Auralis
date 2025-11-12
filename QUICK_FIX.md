# Quick Fix for "Failed to save mood entry"

## Most Likely Cause

The Prisma client needs to be regenerated after the schema changes.

## Quick Fix (Run these commands):

```bash
# Step 1: Navigate to API directory
cd apps/api

# Step 2: Regenerate Prisma Client (IMPORTANT!)
npx prisma generate

# Step 3: Push schema to MongoDB
npx prisma db push

# Step 4: Restart API server
# Press Ctrl+C to stop the current server, then:
npm run start:dev
```

## Verify the Fix

1. Open your browser and go to the dashboard
2. Open Developer Console (F12)
3. Click "Add Entry" or any mood button (1-5)
4. Fill in the modal and click "Save Entry"
5. Check the console for logs:

**If it works**, you'll see:
```
Saving mood entry: { moodScore: 4, notes: "...", tags: [...] }
==================================================
MOOD ENTRY SAVED - ANALYSIS RESULTS
==================================================
```

**If it still fails**, you'll see:
```
Saving mood entry: { moodScore: 4, notes: "...", tags: [...] }
Failed to save mood entry: { status: 500, statusText: "...", error: {...} }
```

## If Still Not Working

### Check 1: Is the API server running?
Look for this in your API terminal:
```
[Nest] INFO [NestApplication] Nest application successfully started
```

### Check 2: Is MongoDB connected?
Look for this in your API terminal:
```
[Nest] INFO [PrismaService] Successfully connected to database
```

### Check 3: Check the API logs
When you click "Save Entry", you should see in the API terminal:
```
[Nest] LOG [WellnessController] POST /api/wellness/mood
```

If you see an error instead, that's the issue!

### Check 4: Test with minimal data
Try saving a mood entry with just the mood score (no notes or tags):
1. Select a mood
2. Don't add any tags or notes
3. Click Save

If this works, the issue might be with the stress analysis service.

## Common Error Messages

### "PrismaClientValidationError"
**Fix**: Run `npx prisma generate` again

### "Cannot find module '@prisma/client'"
**Fix**: 
```bash
cd apps/api
npm install
npx prisma generate
```

### "Unauthorized" or 401
**Fix**: Log out and log back in to get a fresh authentication token

### "Internal Server Error" or 500
**Fix**: Check the API server terminal for the actual error message

## Still Stuck?

Share these details:
1. What you see in the browser console (F12)
2. What you see in the API server terminal
3. The output of: `cd apps/api && npx prisma --version`
4. The output of: `cd apps/api && npm list @prisma/client`

---

**TL;DR**: Run `npx prisma generate` in `apps/api` and restart the server!
