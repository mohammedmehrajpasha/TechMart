const User = require("../models/User");
const jwt = require("jsonwebtoken");
const otpService = require("../services/otpService");

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Check for missing email or password
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            // Find user in MongoDB
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Verify password
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Check if user is verified
            if (!user.isVerified) {
                return res.status(401).json({ message: "Please verify your email before logging in" });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            res.status(200).json({
                message: "Login successful",
                token,
                role: user.role,
                userId: user._id
            });

        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "An error occurred during login" });
        }
    },

    register: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            // Check for existing user
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({ message: "Email already registered" });
            }

            // Generate OTP
            const otpCode = otpService.generateOTP();
            const otpExpiry = otpService.getOTPExpiry();

            // Create and save the user
            const user = new User({
                email: email.toLowerCase(),
                password,
                role: 'customer', // Default role
                otpCode,
                otpExpiry
            });

            await user.save();

            // Send OTP email
            const emailResult = await otpService.sendOTP(email, otpCode);
            
            if (!emailResult.success) {
                // If email fails, delete the user
                await User.findByIdAndDelete(user._id);
                return res.status(500).json({ 
                    message: "Failed to send verification email. Please try again." 
                });
            }

            res.status(201).json({
                message: "User registered successfully. Please check your email for verification code.",
                userId: user._id,
                emailSent: true
            });

        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ message: "An error occurred during registration" });
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const { email, otpCode } = req.body;

            // Validate input
            if (!email || !otpCode) {
                return res.status(400).json({ message: "Email and OTP code are required" });
            }

            // Find user
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check if user is already verified
            if (user.isVerified) {
                return res.status(400).json({ message: "Email is already verified" });
            }

            // Verify OTP
            const verification = otpService.verifyOTP(otpCode, user.otpCode, user.otpExpiry);
            
            if (!verification.valid) {
                return res.status(400).json({ message: verification.message });
            }

            // Mark user as verified and clear OTP data
            user.isVerified = true;
            user.otpCode = null;
            user.otpExpiry = null;
            await user.save();

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: "Email verified successfully",
                token,
                role: user.role,
                userId: user._id
            });

        } catch (error) {
            console.error("OTP verification error:", error);
            res.status(500).json({ message: "An error occurred during verification" });
        }
    },

    resendOTP: async (req, res) => {
        try {
            const { email } = req.body;

            // Validate input
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            // Find user
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check if user is already verified
            if (user.isVerified) {
                return res.status(400).json({ message: "Email is already verified" });
            }

            // Generate new OTP
            const otpCode = otpService.generateOTP();
            const otpExpiry = otpService.getOTPExpiry();

            // Update user with new OTP
            user.otpCode = otpCode;
            user.otpExpiry = otpExpiry;
            await user.save();

            // Send new OTP email
            const emailResult = await otpService.sendOTP(email, otpCode);
            
            if (!emailResult.success) {
                return res.status(500).json({ 
                    message: "Failed to send verification email. Please try again." 
                });
            }

            res.status(200).json({
                message: "Verification code sent successfully",
                emailSent: true
            });

        } catch (error) {
            console.error("Resend OTP error:", error);
            res.status(500).json({ message: "An error occurred while resending verification code" });
        }
    }
};

module.exports = authController;
