const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('Testing database connection...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('🔄 Attempting to connect to database...');
    console.log(`📍 Database URL: ${process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@')}`);
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');
    
    // Test a simple query
    console.log('🔄 Testing database query...');
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    // Test creating a simple record (will fail if user exists, that's OK)
    console.log('\n🔄 Testing database write...');
    try {
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash: 'test-hash',
          privacySettings: {
            allowDirectMessages: true,
            showOnlineStatus: true,
            allowProfileViewing: true,
            dataCollection: true,
          },
        },
      });
      console.log('✅ Database write test successful');
      console.log(`👤 Created test user: ${testUser.email}`);
    } catch (writeError) {
      if (writeError.code === 'P2002') {
        console.log('✅ Database write test successful (user already exists)');
      } else {
        console.log('❌ Database write test failed:', writeError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.message.includes('Server selection timeout')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if MongoDB Atlas cluster is running');
      console.log('2. Verify IP address is whitelisted in MongoDB Atlas');
      console.log('3. Check network connectivity');
      console.log('4. Try using local MongoDB with Docker (see setup-database.md)');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

testDatabaseConnection().catch(console.error);