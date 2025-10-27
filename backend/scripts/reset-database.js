const db = require('../config/db');
const mongoose = require('mongoose');
require('dotenv').config();

async function resetDatabase() {
    try {
        // Reset MySQL tables
        await db.query('DROP TABLE IF EXISTS reviews');
        await db.query('DROP TABLE IF EXISTS products');
        await db.query('DROP TABLE IF EXISTS users');
        console.log('✅ MySQL tables dropped successfully');

        // Reset MongoDB collections
        await mongoose.connect('mongodb://localhost:27017/feedback_system');
        await mongoose.connection.dropDatabase();
        console.log('✅ MongoDB database reset successfully');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting databases:', error);
        process.exit(1);
    }
}

resetDatabase();