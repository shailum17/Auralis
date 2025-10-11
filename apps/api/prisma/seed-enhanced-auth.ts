import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with enhanced authentication users...');

  // Hash password for all demo users
  const password = 'demo123';
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create demo users with both email and username
  const users = [
    {
      email: 'john.doe@university.edu',
      username: 'john_doe',
      passwordHash,
      emailVerified: true,
      bio: 'Computer Science student passionate about web development',
      interests: ['programming', 'web-development', 'javascript'],
    },
    {
      email: 'jane.smith@university.edu',
      username: 'jane_smith',
      passwordHash,
      emailVerified: true,
      bio: 'Psychology major interested in mental health and wellness',
      interests: ['psychology', 'mental-health', 'research'],
    },
    {
      email: 'student123@university.edu',
      username: 'student123',
      passwordHash,
      emailVerified: true,
      bio: 'Engineering student working on innovative projects',
      interests: ['engineering', 'innovation', 'technology'],
    },
    {
      email: 'demo@university.edu',
      username: 'demo_user',
      passwordHash,
      emailVerified: true,
      bio: 'Demo account for testing enhanced authentication features',
      interests: ['testing', 'demo', 'authentication'],
    },
    {
      email: 'alex.wilson@university.edu',
      username: 'alex_wilson',
      passwordHash,
      emailVerified: true,
      bio: 'Business student with a focus on entrepreneurship',
      interests: ['business', 'entrepreneurship', 'startups'],
    }
  ];

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username },
          ],
        },
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.username} (${userData.email}) already exists, skipping...`);
        continue;
      }

      const user = await prisma.user.create({
        data: {
          ...userData,
          privacySettings: {
            allowDirectMessages: true,
            showOnlineStatus: true,
            allowProfileViewing: true,
            dataCollection: true,
          },
          wellnessSettings: {
            trackMood: true,
            trackStress: true,
            shareWellnessData: false,
            crisisAlertsEnabled: true,
            allowWellnessInsights: true,
          },
          preferences: {
            feedAlgorithm: 'personalized',
            privacyLevel: 'public',
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            notifications: {
              emailNotifications: true,
              pushNotifications: true,
              messageNotifications: true,
              postReactions: true,
              commentReplies: true,
              studyGroupInvites: true,
              sessionReminders: true,
              wellnessAlerts: true,
              moderationActions: true,
              systemAnnouncements: true,
            },
          },
        },
      });

      console.log(`✅ Created user: ${user.username} (${user.email})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.username}:`, error);
    }
  }

  console.log('\n🎉 Enhanced authentication seeding completed!');
  console.log('\n📋 Test Credentials:');
  console.log('   Email/Username: john.doe@university.edu or john_doe');
  console.log('   Email/Username: jane.smith@university.edu or jane_smith');
  console.log('   Email/Username: student123@university.edu or student123');
  console.log('   Email/Username: demo@university.edu or demo_user');
  console.log('   Email/Username: alex.wilson@university.edu or alex_wilson');
  console.log('   Password: demo123 (for all accounts)');
  console.log('\n🔐 Features:');
  console.log('   ✅ Login with email or username');
  console.log('   ✅ Password + OTP authentication');
  console.log('   ✅ OTP-only authentication');
  console.log('   ✅ Session duration control');
  console.log('   ✅ Remember me functionality');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });