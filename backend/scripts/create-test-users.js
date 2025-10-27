const bcrypt = require('bcrypt');
const db = require('../config/db');

async function createTestUsers() {
  try {
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
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers(); 