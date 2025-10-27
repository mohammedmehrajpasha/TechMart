const nodemailer = require('nodemailer');
const crypto = require('crypto');

class OTPService {
    constructor() {
        // Configure nodemailer transporter using SMTP settings
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    // Generate a 6-digit OTP
    generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    // Send OTP to email
    async sendOTP(email, otpCode) {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM_EMAIL,
                to: email,
                subject: 'Email Verification - OTP Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0; font-size: 28px;">Email Verification</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Verify your account with the code below</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                            <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h2 style="color: #1e3a8a; margin-bottom: 20px;">Your Verification Code</h2>
                                <div style="background: #1e3a8a; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
                                    ${otpCode}
                                </div>
                                <p style="color: #666; margin: 20px 0;">This code will expire in 10 minutes.</p>
                                <p style="color: #666; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
                            </div>
                        </div>
                        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                            <p>This is an automated message, please do not reply.</p>
                        </div>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('OTP sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending OTP:', error);
            return { success: false, error: error.message };
        }
    }

    // Verify OTP code
    verifyOTP(userOTP, storedOTP, expiryTime) {
        const now = new Date();
        const expiry = new Date(expiryTime);
        
        if (now > expiry) {
            return { valid: false, message: 'OTP has expired' };
        }
        
        if (userOTP !== storedOTP) {
            return { valid: false, message: 'Invalid OTP code' };
        }
        
        return { valid: true, message: 'OTP verified successfully' };
    }

    // Set OTP expiry time (10 minutes from now)
    getOTPExpiry() {
        const now = new Date();
        return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    }
}

module.exports = new OTPService();

