const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register an admin user (should be disabled in production)
// @access  Public (consider restricting in production)
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ msg: 'Username already exists' });
    }
    
    // Check if email already exists
    admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    admin = new Admin({
      username,
      email,
      password
    });

    await admin.save();

    // Return JWT
    const token = admin.getSignedJwtToken();

    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Admin login & get token
// @access  Public
router.post('/login', [
  check('username', 'Username is required').exists(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Check for admin
    const admin = await Admin.findOne({ username }).select('+password');
    if (!admin) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // Return JWT
    const token = admin.getSignedJwtToken();

    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth
// @desc    Get admin user data
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/update-credentials
// @desc    Update admin credentials (username, email and/or password)
// @access  Private
router.put('/update-credentials', [
  protect,
  check('currentPassword', 'Current password is required').exists(),
  check('newPassword', 'New password must be at least 6 characters').optional().isLength({ min: 6 }),
  check('newUsername', 'Username cannot be empty').optional().not().isEmpty(),
  check('newEmail', 'Email must be valid').optional().isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword, newUsername, newEmail } = req.body;

  try {
    // Get admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');

    // Verify current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Current password is incorrect' });
    }

    // Update username if provided
    if (newUsername && newUsername !== admin.username) {
      // Check if new username already exists
      const usernameExists = await Admin.findOne({ username: newUsername });
      if (usernameExists) {
        return res.status(400).json({ msg: 'Username already exists' });
      }

      admin.username = newUsername;
    }
    
    // Update email if provided
    if (newEmail && newEmail !== admin.email) {
      // Check if new email already exists
      const emailExists = await Admin.findOne({ email: newEmail });
      if (emailExists) {
        return res.status(400).json({ msg: 'Email already exists' });
      }

      admin.email = newEmail;
    }

    // Update password if provided
    if (newPassword) {
      admin.password = newPassword;
    }

    // Save changes
    await admin.save();

    // Generate new token with updated info
    const token = admin.getSignedJwtToken();

    res.json({
      msg: 'Credentials updated successfully',
      token
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
