import { PrismaClient } from '@prisma/client';

// Define enums as string constants for SQLite
const UserRole = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
} as const;

const ResourceCategory = {
  MENTAL_HEALTH: 'MENTAL_HEALTH',
  ACADEMIC_SUPPORT: 'ACADEMIC_SUPPORT',
  CAREER_GUIDANCE: 'CAREER_GUIDANCE',
  FINANCIAL_AID: 'FINANCIAL_AID',
  CRISIS_SUPPORT: 'CRISIS_SUPPORT'
} as const;
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
      role: UserRole.ADMIN,
      emailVerified: true,
      bio: 'Platform administrator',
      privacySettings: {
        allowAnonymousPosts: true,
        allowDirectMessages: true,
        allowMoodTracking: true,
        allowStressAnalysis: true,
      },
    },
  });

  // Create moderator user
  const modPassword = await bcrypt.hash('mod123!', 12);
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@example.com' },
    update: {},
    create: {
      email: 'moderator@example.com',
      username: 'moderator',
      passwordHash: modPassword,
      role: UserRole.MODERATOR,
      emailVerified: true,
      bio: 'Community moderator',
      privacySettings: {
        allowAnonymousPosts: true,
        allowDirectMessages: true,
        allowMoodTracking: true,
        allowStressAnalysis: true,
      },
    },
  });

  // Create sample users
  const userPassword = await bcrypt.hash('user123!', 12);
  const users = [];
  
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        username: `user${i}`,
        passwordHash: userPassword,
        role: UserRole.USER,
        emailVerified: true,
        bio: `Sample user ${i} - Computer Science student`,
        interests: JSON.stringify(['programming', 'web-development', 'machine-learning']),
        privacySettings: JSON.stringify({
          allowAnonymousPosts: true,
          allowDirectMessages: true,
          allowMoodTracking: true,
          allowStressAnalysis: true,
        }),
      },
    });
    users.push(user);
  }

  // Create sample posts
  const samplePosts = [
    {
      content: 'Just finished my final exams! Feeling relieved but also anxious about the results. Anyone else feeling the same way?',
      tags: ['exams', 'stress', 'university'],
      isAnonymous: false,
    },
    {
      content: 'Having trouble sleeping lately due to assignment deadlines. Any tips for managing stress?',
      tags: ['sleep', 'stress', 'assignments'],
      isAnonymous: true,
    },
    {
      content: 'Really enjoying my machine learning course this semester. The projects are challenging but rewarding!',
      tags: ['machine-learning', 'courses', 'programming'],
      isAnonymous: false,
    },
    {
      content: 'Feeling overwhelmed with coursework. Sometimes I wonder if I\'m cut out for this program.',
      tags: ['overwhelmed', 'coursework', 'self-doubt'],
      isAnonymous: true,
    },
    {
      content: 'Study group for CS101 anyone? We could meet at the library this weekend.',
      tags: ['study-group', 'cs101', 'collaboration'],
      isAnonymous: false,
    },
  ];

  for (let i = 0; i < samplePosts.length; i++) {
    const post = samplePosts[i];
    const author = users[i % users.length];
    
    await prisma.post.create({
      data: {
        content: post.content,
        tags: JSON.stringify(post.tags),
        isAnonymous: post.isAnonymous,
        authorId: author.id,
      },
    });
  }

  // Create wellness resources
  const resources = [
    {
      title: 'University Counseling Services',
      description: 'Free confidential counseling services available to all students',
      url: 'https://university.edu/counseling',
      category: ResourceCategory.MENTAL_HEALTH,
    },
    {
      title: 'Crisis Text Line',
      description: '24/7 crisis support via text message',
      url: 'https://crisistextline.org',
      category: ResourceCategory.CRISIS_SUPPORT,
    },
    {
      title: 'Academic Success Center',
      description: 'Tutoring, study skills workshops, and academic coaching',
      url: 'https://university.edu/academic-success',
      category: ResourceCategory.ACADEMIC_SUPPORT,
    },
    {
      title: 'Career Development Office',
      description: 'Resume help, interview prep, and job search assistance',
      url: 'https://university.edu/career',
      category: ResourceCategory.CAREER_GUIDANCE,
    },
    {
      title: 'Financial Aid Office',
      description: 'Information about scholarships, grants, and financial assistance',
      url: 'https://university.edu/financial-aid',
      category: ResourceCategory.FINANCIAL_AID,
    },
    {
      title: 'Mindfulness and Meditation Guide',
      description: 'Learn techniques for stress reduction and mental clarity',
      url: 'https://university.edu/mindfulness',
      category: ResourceCategory.MENTAL_HEALTH,
    },
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { url: resource.url },
      update: {},
      create: resource,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@example.com / admin123!`);
  console.log(`🛡️  Moderator user: moderator@example.com / mod123!`);
  console.log(`👥 Sample users: user1@example.com to user5@example.com / user123!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });