/**
 * Multi-User Setup Diagnostic Tool
 * 
 * This script checks if your system is properly configured for multi-user support.
 * It verifies database schema, authentication, and data isolation mechanisms.
 * 
 * Usage: node check-multi-user-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Multi-User Setup Diagnostic Tool\n');
console.log('='.repeat(70));

let allChecks = [];

function check(name, passed, details = '') {
  allChecks.push({ name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Check 1: Prisma Schema
console.log('\n📋 Checking Database Schema...\n');

try {
  const schemaPath = path.join(__dirname, 'apps', 'api', 'prisma', 'schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Check for userId fields
  const hasUserIdInMoodEntry = schema.includes('model MoodEntry') && schema.match(/userId\s+String/);
  check('MoodEntry has userId field', !!hasUserIdInMoodEntry);

  const hasUserIdInStressEntry = schema.includes('model StressEntry') && schema.match(/userId\s+String/);
  check('StressEntry has userId field', !!hasUserIdInStressEntry);

  const hasUserIdInSleepEntry = schema.includes('model SleepEntry') && schema.match(/userId\s+String/);
  check('SleepEntry has userId field', !!hasUserIdInSleepEntry);

  const hasUserIdInSocialEntry = schema.includes('model SocialEntry') && schema.match(/userId\s+String/);
  check('SocialEntry has userId field', !!hasUserIdInSocialEntry);

  const hasUserIdInWeeklyGoal = schema.includes('model WeeklyGoal') && schema.match(/userId\s+String/);
  check('WeeklyGoal has userId field', !!hasUserIdInWeeklyGoal);

  // Check for foreign key relationships
  const hasForeignKeys = schema.match(/user\s+User\s+@relation\(fields:\s*\[userId\]/g);
  check('Foreign key relationships defined', hasForeignKeys && hasForeignKeys.length >= 5, 
    `Found ${hasForeignKeys ? hasForeignKeys.length : 0} user relationships`);

  // Check for indexes
  const hasIndexes = schema.match(/@@index\(\[userId/g);
  check('Database indexes for userId', !!hasIndexes, 
    hasIndexes ? `Found ${hasIndexes.length} userId indexes` : 'No indexes found');

} catch (error) {
  check('Prisma schema file exists', false, error.message);
}

// Check 2: Authentication
console.log('\n🔐 Checking Authentication Setup...\n');

try {
  const jwtStrategyPath = path.join(__dirname, 'apps', 'api', 'src', 'modules', 'auth', 'strategies', 'jwt.strategy.ts');
  const jwtStrategy = fs.readFileSync(jwtStrategyPath, 'utf8');

  const hasValidateMethod = jwtStrategy.includes('async validate(payload');
  check('JWT strategy has validate method', hasValidateMethod);

  const extractsUserId = jwtStrategy.includes('payload.sub') || jwtStrategy.includes('payload.id');
  check('JWT strategy extracts user ID', extractsUserId);

  const returnsUser = jwtStrategy.includes('return');
  check('JWT strategy returns user object', returnsUser);

} catch (error) {
  check('JWT strategy file exists', false, error.message);
}

try {
  const jwtGuardPath = path.join(__dirname, 'apps', 'api', 'src', 'common', 'guards', 'jwt-auth.guard.ts');
  const jwtGuard = fs.readFileSync(jwtGuardPath, 'utf8');

  const extendsAuthGuard = jwtGuard.includes('AuthGuard');
  check('JWT guard extends AuthGuard', extendsAuthGuard);

} catch (error) {
  check('JWT guard file exists', false, error.message);
}

// Check 3: Wellness Controller
console.log('\n🎮 Checking Wellness Controller...\n');

try {
  const controllerPath = path.join(__dirname, 'apps', 'api', 'src', 'modules', 'wellness', 'wellness.controller.ts');
  const controller = fs.readFileSync(controllerPath, 'utf8');

  const hasJwtGuard = controller.includes('@UseGuards(JwtAuthGuard)');
  check('Controller uses JWT authentication guard', hasJwtGuard);

  const extractsUserFromRequest = controller.match(/req\.user\.id/g);
  check('Controller extracts user ID from request', !!extractsUserFromRequest, 
    extractsUserFromRequest ? `Found ${extractsUserFromRequest.length} usages` : 'Not found');

  const passesUserIdToService = controller.match(/this\.wellnessService\.\w+\(req\.user\.id/g);
  check('Controller passes user ID to service methods', !!passesUserIdToService,
    passesUserIdToService ? `Found ${passesUserIdToService.length} method calls` : 'Not found');

} catch (error) {
  check('Wellness controller file exists', false, error.message);
}

// Check 4: Wellness Service
console.log('\n⚙️  Checking Wellness Service...\n');

try {
  const servicePath = path.join(__dirname, 'apps', 'api', 'src', 'modules', 'wellness', 'wellness.service.ts');
  const service = fs.readFileSync(servicePath, 'utf8');

  const methodsWithUserId = service.match(/async \w+\(userId: string/g);
  check('Service methods accept userId parameter', !!methodsWithUserId,
    methodsWithUserId ? `Found ${methodsWithUserId.length} methods` : 'Not found');

  const queriesWithUserId = service.match(/where:\s*\{[^}]*userId[^}]*\}/g);
  check('Database queries filter by userId', !!queriesWithUserId,
    queriesWithUserId ? `Found ${queriesWithUserId.length} filtered queries` : 'Not found');

  const createWithUserId = service.match(/create\(\s*\{[^}]*data:\s*\{[^}]*userId[^}]*\}/g);
  check('Create operations include userId', !!createWithUserId,
    createWithUserId ? `Found ${createWithUserId.length} create operations` : 'Not found');

} catch (error) {
  check('Wellness service file exists', false, error.message);
}

// Check 5: Environment Configuration
console.log('\n🔧 Checking Environment Configuration...\n');

try {
  const envPath = path.join(__dirname, 'apps', 'api', '.env');
  const env = fs.readFileSync(envPath, 'utf8');

  const hasJwtSecret = env.includes('JWT_SECRET');
  check('JWT_SECRET is configured', hasJwtSecret);

  const hasDatabaseUrl = env.includes('DATABASE_URL');
  check('DATABASE_URL is configured', hasDatabaseUrl);

} catch (error) {
  check('Environment file exists', false, 'Create apps/api/.env file');
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('DIAGNOSTIC SUMMARY');
console.log('='.repeat(70));

const passed = allChecks.filter(c => c.passed).length;
const total = allChecks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\n✅ Passed: ${passed}/${total} checks (${percentage}%)\n`);

if (percentage === 100) {
  console.log('🎉 PERFECT! Your system is fully configured for multi-user support!\n');
  console.log('Next steps:');
  console.log('1. Run: node test-multi-user-isolation.js');
  console.log('2. Test with real users in your application');
  console.log('3. Deploy to production with confidence!\n');
} else if (percentage >= 80) {
  console.log('✅ GOOD! Your system has multi-user support with minor issues.\n');
  console.log('Review the failed checks above and fix any issues.');
  console.log('Then run: node test-multi-user-isolation.js\n');
} else {
  console.log('⚠️  ATTENTION NEEDED! Some critical components are missing.\n');
  console.log('Please review the failed checks above.');
  console.log('Refer to docs/USER_DATA_ISOLATION.md for guidance.\n');
}

// Failed checks details
const failedChecks = allChecks.filter(c => !c.passed);
if (failedChecks.length > 0) {
  console.log('Failed Checks:');
  failedChecks.forEach(c => {
    console.log(`  ❌ ${c.name}`);
    if (c.details) {
      console.log(`     ${c.details}`);
    }
  });
  console.log();
}
