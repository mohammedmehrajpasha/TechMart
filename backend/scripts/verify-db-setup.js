const db = require('../config/db');

async function verifyDatabaseSetup() {
  try {
    // Check users table
    const [tables] = await db.query('SHOW TABLES LIKE "users"');
    console.log('Users table exists:', tables.length > 0);

    // Check users in database
    const [users] = await db.query('SELECT id, email, role FROM users');
    console.log('Users in database:', users);

    // Check database connection
    const [result] = await db.query('SELECT 1');
    console.log('Database connection successful');

    process.exit(0);
  } catch (error) {
    console.error('Database verification failed:', error);
    process.exit(1);
  }
}

verifyDatabaseSetup(); 