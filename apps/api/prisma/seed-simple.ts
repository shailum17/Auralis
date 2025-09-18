import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      bio: 'Platform administrator',
      privacySettings: JSON.stringify({
        allowAnonymousPosts: true,
        allowDirectMessages: true,
        allowMoodTracking: true,
        allowStressAnalysis: true,
      }),
    },
  });

  // Create sample user
  const userPassword = await bcrypt.hash('user123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      username: 'user1',
      passwordHash: userPassword,
      role: 'USER',
      emailVerified: true,
      bio: 'Sample user - Computer Science student',
      interests: JSON.stringify(['programming', 'web-development']),
      privacySettings: JSON.stringify({
        allowAnonymousPosts: true,
        allowDirectMessages: true,
        allowMoodTracking: true,
        allowStressAnalysis: true,
      }),
    },
  });

  // Create sample post
  await prisma.post.create({
    data: {
      content: 'Welcome to the Student Community Platform! This is a sample post.',
      tags: JSON.stringify(['welcome', 'community']),
      isAnonymous: false,
      authorId: user.id,
    },
  });

  // Create sample resource
  await prisma.resource.create({
    data: {
      title: 'University Counseling Services',
      description: 'Free confidential counseling services available to all students',
      url: 'https://university.edu/counseling',
      category: 'MENTAL_HEALTH',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@example.com / admin123!`);
  console.log(`👥 Sample user: user1@example.com / user123!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });