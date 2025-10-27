const express = require('express');
const connectDB = require('./config/mongodb.config');
const authRoutes = require('./routes/auth.routes');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'MongoDB server is running' });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: err.message 
    });
});

const PORT =5003;

// Start server and connect to MongoDB
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();
        
        // Then start the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('MongoDB connected');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app; 