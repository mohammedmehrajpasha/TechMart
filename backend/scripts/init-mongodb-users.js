require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const initializeUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/feedback_system', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if admin user exists
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (!adminExists) {
            // Create admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created');
        }

        // Check if test customer exists
        const customerExists = await User.findOne({ email: 'customer@example.com' });
        if (!customerExists) {
            // Create test customer
            const hashedPassword = await bcrypt.hash('customer123', 10);
            await User.create({
                email: 'customer@example.com',
                password: hashedPassword,
                role: 'customer'
            });
            console.log('Test customer created');
        }

        console.log('Database initialization complete');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await mongoose.disconnect();
    }
};

initializeUsers(); 