const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  console.log('🔧 Admin User Creation Script');
  console.log('================================\n');

  try {
    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const fullName = await question('Enter full name: ');
    const password = await question('Enter password: ');
    const roleInput = await question('Enter role (ADMIN/MODERATOR) [ADMIN]: ');
    
    const role = roleInput.toUpperCase() || 'ADMIN';
    
    if (!['ADMIN', 'MODERATOR'].includes(role)) {
      console.error('❌ Invalid role. Must be ADMIN or MODERATOR');
      process.exit(1);
    }

    console.log('\n🚀 Creating admin user...');

    const response = await fetch('http://localhost:3001/api/v1/auth/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        fullName,
        role
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Admin user created successfully!');
      console.log(`   ID: ${result.admin.id}`);
      console.log(`   Username: ${result.admin.username}`);
      console.log(`   Email: ${result.admin.email}`);
      console.log(`   Role: ${result.admin.role}`);
      console.log(`   Created: ${result.admin.createdAt}`);
    } else {
      console.error('❌ Failed to create admin user:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await fetch('http://localhost:3001/api/v1/health');
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

async function main() {
  const backendRunning = await checkBackend();
  
  if (!backendRunning) {
    console.error('❌ Backend server is not running on http://localhost:3001');
    console.log('Please start the backend server first:');
    console.log('  cd apps/api && npm run dev');
    process.exit(1);
  }

  await createAdmin();
}

main().catch(console.error);