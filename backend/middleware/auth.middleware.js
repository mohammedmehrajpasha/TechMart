const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || '123456'; // Use environment variable or fallback

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Check if we need to use the mongoId or userId
        const userId = decoded.mongoId || decoded.userId;
        
        // Find user by either MongoDB ID or MySQL ID
        let user;
        if (decoded.mongoId) {
            user = await User.findById(decoded.mongoId).select('-password');
        } else {
            user = await User.findOne({ userId: decoded.userId }).select('-password');
        }

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach both IDs to the request
        req.user = {
            ...user.toObject(),
            mysqlId: decoded.userId,
            mongoId: decoded.mongoId
        };
        
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ 
            message: 'Invalid token',
            error: error.message 
        });
    }
};

module.exports = {
    verifyToken,
    JWT_SECRET
}; 