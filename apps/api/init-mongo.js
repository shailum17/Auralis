// MongoDB initialization script
db = db.getSiblingDB('auralis');

// Create a user for the application
db.createUser({
  user: 'auralis_user',
  pwd: 'auralis_password',
  roles: [
    {
      role: 'readWrite',
      db: 'auralis'
    }
  ]
});

console.log('MongoDB initialized for Auralis application');