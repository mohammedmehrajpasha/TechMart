const db = require('../config/db');
const bcrypt = require('bcrypt');

async function verifyUsers() {
  try {
    // Check if users exist
    const [users] = await db.query('SELECT * FROM users');
    
    if (users.length === 0) {
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await db.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['admin@example.com', adminPassword, 'admin']
      );

      // Create customer user
      const customerPassword = await bcrypt.hash('customer123', 10);
      await db.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['customer@example.com', customerPassword, 'customer']
      );

      console.log('Test users created successfully');
    } else {
      console.log('Existing users found:', users.length);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error verifying users:', error);
    process.exit(1);
  }
}

verifyUsers(); 