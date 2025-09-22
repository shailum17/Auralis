# MongoDB Setup Guide for Student Community Platform

## 🚀 **Quick Setup Options**

### Option 1: Local MongoDB Installation

1. **Install MongoDB Community Edition**
   ```bash
   # macOS (using Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community

   # Ubuntu/Debian
   sudo apt-get install mongodb

   # Windows - Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**
   ```bash
   # macOS/Linux
   sudo systemctl start mongod
   # or
   brew services start mongodb/brew/mongodb-community

   # Windows - MongoDB starts automatically as a service
   ```

3. **Update Environment Variables**
   ```bash
   # Copy the example file
   cp apps/api/.env.example apps/api/.env
   
   # Edit the DATABASE_URL in apps/api/.env
   DATABASE_URL="mongodb://localhost:27017/student-community"
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier available)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Update Environment Variables**
   ```bash
   # In apps/api/.env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/student-community?retryWrites=true&w=majority"
   ```

## 🔧 **Database Migration & Setup**

1. **Install Dependencies**
   ```bash
   cd apps/api
   npm install
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Push Schema to Database**
   ```bash
   npx prisma db push
   ```

4. **Seed Database (Optional)**
   ```bash
   npx prisma db seed
   ```

## 📊 **MongoDB Schema Benefits**

### **Native JSON Support**
- **Arrays**: `interests: String[]` instead of JSON strings
- **Embedded Documents**: `PrivacySettings` as nested object
- **Flexible Schema**: Easy to add new fields without migrations

### **Better Performance**
- **Indexing**: Automatic indexing on `@unique` fields
- **Aggregation**: Powerful aggregation pipeline for analytics
- **Scalability**: Horizontal scaling with sharding

### **Enhanced Features**
- **ObjectId**: Native MongoDB IDs with timestamp information
- **Enums**: Type-safe enums instead of strings
- **Embedded Types**: Complex nested data structures

## 🛠️ **Development Tools**

### **MongoDB Compass (GUI)**
```bash
# Download from https://www.mongodb.com/products/compass
# Connect using your DATABASE_URL
```

### **MongoDB Shell**
```bash
# Install MongoDB Shell
npm install -g mongosh

# Connect to local database
mongosh "mongodb://localhost:27017/student-community"

# Connect to Atlas
mongosh "your-atlas-connection-string"
```

### **Useful Commands**
```javascript
// Show all collections
show collections

// Find all users
db.users.find()

// Find posts with specific tags
db.posts.find({ tags: { $in: ["study-tips"] } })

// Aggregate user post counts
db.posts.aggregate([
  { $group: { _id: "$authorId", postCount: { $sum: 1 } } }
])
```

## 🔒 **Security Best Practices**

1. **Database User Permissions**
   - Create dedicated database user with minimal permissions
   - Use strong passwords
   - Enable IP whitelisting in Atlas

2. **Connection Security**
   - Use SSL/TLS connections (enabled by default in Atlas)
   - Store connection strings in environment variables
   - Never commit credentials to version control

3. **Data Validation**
   - Prisma provides automatic validation
   - Add custom validation in your NestJS services
   - Use MongoDB schema validation for additional security

## 📈 **Performance Optimization**

### **Indexing Strategy**
```javascript
// Create indexes for frequently queried fields
db.posts.createIndex({ "createdAt": -1 })
db.posts.createIndex({ "tags": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })
db.messages.createIndex({ "channelId": 1, "createdAt": -1 })
```

### **Query Optimization**
- Use projection to limit returned fields
- Implement pagination for large result sets
- Use aggregation pipeline for complex queries
- Monitor slow queries with MongoDB Profiler

## 🚀 **Production Deployment**

### **MongoDB Atlas Production Setup**
1. **Cluster Configuration**
   - Choose appropriate cluster tier
   - Enable backup and point-in-time recovery
   - Set up monitoring and alerts

2. **Security Configuration**
   - Enable database authentication
   - Configure network access rules
   - Set up database auditing

3. **Performance Monitoring**
   - Use MongoDB Atlas monitoring
   - Set up performance alerts
   - Monitor connection pool usage

### **Environment Variables for Production**
```bash
# Production .env
DATABASE_URL="mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/student-community-prod?retryWrites=true&w=majority"
NODE_ENV="production"
JWT_SECRET="super-secure-production-secret"
```

## 🔄 **Migration from SQLite**

If you have existing SQLite data, you can migrate it:

1. **Export SQLite Data**
   ```bash
   # Export to JSON
   npx prisma db seed --preview-feature
   ```

2. **Transform and Import to MongoDB**
   ```bash
   # Use custom migration script
   node scripts/migrate-to-mongodb.js
   ```

## 📚 **Additional Resources**

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Prisma MongoDB Guide](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Connection Timeout**
   - Check network connectivity
   - Verify IP whitelist in Atlas
   - Ensure correct connection string

2. **Authentication Failed**
   - Verify username/password
   - Check database user permissions
   - Ensure user has access to correct database

3. **Schema Validation Errors**
   - Run `npx prisma generate` after schema changes
   - Check for required fields
   - Verify enum values match schema

### **Getting Help**
- Check MongoDB Atlas logs
- Use MongoDB Compass for visual debugging
- Enable Prisma query logging in development
- Monitor application logs for database errors