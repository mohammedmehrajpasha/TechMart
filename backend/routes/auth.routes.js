const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Protected routes
// router.get('/profile', authMiddleware, authController.getProfile);
// router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router; 