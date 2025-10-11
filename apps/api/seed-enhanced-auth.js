const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running enhanced authentication database seeding...\n');

try {
  // Change to the API directory
  process.chdir(path.join(__dirname));
  
  // Run the seeding script
  execSync('npx ts-node prisma/seed-enhanced-auth.ts', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✅ Enhanced authentication seeding completed successfully!');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Start the API server: npm run start:dev');
  console.log('   2. Start the web app: cd ../web && npm run dev');
  console.log('   3. Test login with any of the seeded credentials');
  
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}