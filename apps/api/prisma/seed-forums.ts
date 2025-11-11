import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const forums = [
  {
    forumId: 'academic-help',
    name: 'Academic Help',
    description: 'Get help with assignments, study tips, and academic guidance from fellow students',
    icon: 'book',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    memberCount: 0, // Will be calculated from real user interests
    postCount: 0,   // Will be calculated from real posts
    isPopular: true,
  },
  {
    forumId: 'career-guidance',
    name: 'Career Guidance',
    description: 'Discuss career paths, internships, job opportunities, and professional development',
    icon: 'briefcase',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    memberCount: 0, // Will be calculated from real user interests
    postCount: 0,   // Will be calculated from real posts
    isPopular: true,
  },
  {
    forumId: 'mental-wellness',
    name: 'Mental Wellness',
    description: 'Share experiences, support each other, and discuss mental health resources',
    icon: 'heart',
    color: 'bg-green-100 text-green-700 border-green-200',
    memberCount: 0, // Will be calculated from real user interests
    postCount: 0,   // Will be calculated from real posts
  },
  {
    forumId: 'tech-innovation',
    name: 'Tech & Innovation',
    description: 'Explore latest technologies, coding projects, and innovative ideas',
    icon: 'computer',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    memberCount: 0, // Will be calculated from real user interests
    postCount: 0,   // Will be calculated from real posts
    isPopular: true,
  },
  {
    forumId: 'creative-arts',
    name: 'Creative Arts',
    description: 'Share your creative work, get feedback, and collaborate on artistic projects',
    icon: 'palette',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    memberCount: 0, // Will be calculated from real user interests
    postCount: 0,   // Will be calculated from real posts
  },
  {
    forumId: 'sports-fitness',
    name: 'Sports & Fitness',
    description: 'Discuss fitness routines, sports events, and healthy lifestyle tips',
    icon: 'fitness',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    memberCount: 0, // Will be calculated from real user interests
    postCount: 0,   // Will be calculated from real posts
  },
  {
    forumId: 'campus-life',
    name: 'Campus Life',
    description: 'Share campus experiences, events, and connect with fellow students',
    icon: 'building',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    memberCount: 0, // Will be calculated from real user interests
    postCount: 0,   // Will be calculated from real posts
  },
  {
    forumId: 'study-groups',
    name: 'Study Groups',
    description: 'Form study groups, share notes, and collaborate on academic projects',
    icon: 'users',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    memberCount: 0, // Will be calculated from real user interests
    postCount: 0,   // Will be calculated from real posts
  },
];

async function main() {
  console.log('🌱 Starting forum seeding...');

  // Delete existing forums
  await prisma.forum.deleteMany({});
  console.log('🗑️  Cleared existing forums');

  // Create forums with real-time data
  for (const forum of forums) {
    // Calculate real member count (users who have this forum in their interests)
    const memberCount = await prisma.user.count({
      where: {
        interests: {
          has: forum.forumId
        }
      }
    });

    // Calculate real post count
    const postCount = await prisma.post.count({
      where: {
        forumId: forum.forumId,
        isPublished: true
      }
    });

    const created = await prisma.forum.create({
      data: {
        ...forum,
        memberCount,
        postCount
      },
    });
    
    console.log(`✅ Created forum: ${created.name} (${created.forumId})`);
    console.log(`   📊 Members: ${memberCount}, Posts: ${postCount}`);
  }

  console.log('🎉 Forum seeding completed!');
  console.log(`📊 Total forums created: ${forums.length}`);
  
  // Summary statistics
  const totalMembers = await prisma.user.count();
  const totalPosts = await prisma.post.count({ where: { isPublished: true } });
  console.log(`\n📈 Database Statistics:`);
  console.log(`   Total Users: ${totalMembers}`);
  console.log(`   Total Posts: ${totalPosts}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding forums:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
