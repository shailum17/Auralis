# Database Setup Guide

## Option 1: Fix MongoDB Atlas Connection

### Check MongoDB Atlas Status
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Check if your cluster is running
4. Verify network access (IP whitelist)
5. Check database user credentials

### Common MongoDB Atlas Issues:

1. **IP Address Not Whitelisted**
   - Go to Network Access in MongoDB Atlas
   - Add your current IP address or use `0.0.0.0/0` for development

2. **Cluster Paused/Stopped**
   - Go to Clusters in MongoDB Atlas
   - Resume the cluster if it's paused

3. **Wrong Credentials**
   - Verify username and password in the connection string
   - Make sure the user has read/write permissions

4. **Network Issues**
   - Try connecting from a different network
   - Check if your firewall is blocking the connection

## Option 2: Use Local MongoDB with Docker

### Prerequisites
- Docker and Docker Compose installed

### Steps
1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```

2. Start MongoDB and Redis with Docker:
   ```bash
   docker-compose up -d
   ```

3. Update your `.env` file to use local MongoDB:
   ```bash
   # Copy the local configuration
   cp .env.local .env
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Start the API server:
   ```bash
   npm run dev
   ```

### Verify Local MongoDB
```bash
# Check if containers are running
docker ps

# Connect to MongoDB
docker exec -it auralis-mongodb mongosh -u admin -p password123

# In MongoDB shell:
use auralis
show collections
```

## Option 3: Use MongoDB Compass (GUI)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using the connection string
3. Verify the connection and database structure

## Testing the Database Connection

Create a simple test script:

```javascript
// test-db-connection.js
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Run with: `node test-db-connection.js`

## Recommended Solution

For development, I recommend using **Option 2 (Local MongoDB with Docker)** because:
- More reliable than cloud connections
- Faster development cycle
- No network dependency
- Full control over the database

For production, use MongoDB Atlas with proper network configuration.