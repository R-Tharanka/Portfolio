// passwordReset.js - Routes for password reset functionality
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { isProduction } = require('../utils/environment');

// Store tokens in memory for development
// In production, these should be stored in a database with expiration times
const resetTokens = {};

// Configure nodemailer transporter
// For production, use your actual SMTP credentials
// For development, use a testing service like Ethereal or Mailtrap
const getTransporter = () => {
  if (isProduction) {
    // Use production email service (configure with environment variables)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // For development/testing - log emails instead of sending
    return {
      sendMail: (mailOptions) => {
        console.log('========= DEVELOPMENT EMAIL =========');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Text:', mailOptions.text);
        console.log('HTML:', mailOptions.html);
        console.log('Reset Link:', mailOptions.html.match(/href="([^"]*)/)[1]);
        console.log('======================================');
        return Promise.resolve({ messageId: 'test-message-id' });
      }
    };
  }
};

// Request password reset
router.post('/reset-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find admin with this email
    const admin = await Admin.findOne({ email });
    
    // Don't reveal if email exists or not (security best practice)
    if (!admin) {
      // Return success even if no user found to prevent email enumeration attacks
      return res.status(200).json({ 
        message: 'If a matching account is found, a password reset link will be sent.' 
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3600000; // Token valid for 1 hour
    
    // Store token with admin ID and expiration
    resetTokens[token] = {
      adminId: admin._id.toString(),
      expiresAt
    };
    
    // Create reset link
    const resetLink = `${req.protocol}://${req.get('host')}/admin/reset-password?token=${token}`;
    
    // Send email
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@portfolio.com',
      to: admin.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the following link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${admin.username},</p>
          <p>You requested a password reset for your portfolio admin account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" style="background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>If you did not request this reset, please ignore this email and contact the system administrator.</p>
          <p>This link will expire in 1 hour.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this URL into your browser: ${resetLink}</p>
        </div>
      `
    });

    res.status(200).json({ 
      message: 'If a matching account is found, a password reset link will be sent.' 
    });
    
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Verify reset token
router.get('/verify-reset-token', (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  
  const tokenData = resetTokens[token];
  
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }
  
  res.status(200).json({ valid: true });
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    const tokenData = resetTokens[token];
    
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Find admin by ID
    const admin = await Admin.findById(tokenData.adminId);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    admin.password = hashedPassword;
    await admin.save();
    
    // Invalidate token
    delete resetTokens[token];
    
    res.status(200).json({ msg: 'Password reset successful' });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
