const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for contact form submissions to prevent spam
// Limited to 5 submissions per hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many requests, please try again later' }
});

// @route   POST /api/contact
// @desc    Submit a contact form message
// @access  Public (with rate limiting)
router.post('/', [
  contactLimiter,
  [
    check('name', 'Name is required').not().isEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('title', 'Subject/title is required').not().isEmpty().trim(),
    check('message', 'Message is required').not().isEmpty().trim(),
    check('captchaToken', 'CAPTCHA verification failed').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, title, message, captchaToken } = req.body;
    
    // TODO: Verify captcha token with Google reCAPTCHA
    // For now, we're just checking if it exists
    if (!captchaToken) {
      return res.status(400).json({ msg: 'CAPTCHA verification failed' });
    }

    // Create new contact message
    const contact = new Contact({
      name,
      email,
      title,
      message
    });

    await contact.save();
    
    // TODO: Send email notification to admin (optional)
    
    res.json({ success: true, msg: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/contact
// @desc    Get all contact form messages
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/contact/:id
// @desc    Get contact message by ID
// @access  Private (Admin only)
router.get('/:id', protect, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    // Mark message as read if it's not already
    if (!message.read) {
      message.read = true;
      await message.save();
    }
    
    res.json(message);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Message not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    await Contact.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Message removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Message not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
