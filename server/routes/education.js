const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Education = require('../models/Education');
const { protect } = require('../middleware/auth');

// @route   GET /api/education
// @desc    Get all education entries
// @access  Public
router.get('/', async (req, res) => {
  try {
    const education = await Education.find().sort({ 'timeline.start': -1 });
    res.json(education);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/education/:id
// @desc    Get education entry by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);

    if (!education) {
      return res.status(404).json({ msg: 'Education entry not found' });
    }

    res.json(education);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Education entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/education
// @desc    Create an education entry
// @access  Private (Admin only)
router.post('/', [
  protect,
  [
    check('institution', 'Institution name is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    // Description is optional, so we don't validate it here
    check('timeline.start', 'Start date is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      institution,
      title,
      description,
      skills,
      timeline
    } = req.body;

    // Create new education entry
    const education = new Education({
      institution,
      title,
      description,
      skills: skills || [],
      timeline
    });

    const savedEducation = await education.save();
    res.json(savedEducation);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/education/:id
// @desc    Update an education entry
// @access  Private (Admin only)
router.put('/:id', [
  protect, [
    check('institution', 'Institution name is required').optional().not().isEmpty(),
    check('title', 'Title is required').optional().not().isEmpty(),
    // Description is optional and can be empty
    check('skills', 'Skills should be an array').optional().isArray()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const education = await Education.findById(req.params.id);

    if (!education) {
      return res.status(404).json({ msg: 'Education entry not found' });
    }

    const updatedEducation = await Education.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedEducation);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Education entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/education/:id
// @desc    Delete an education entry
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);

    if (!education) {
      return res.status(404).json({ msg: 'Education entry not found' });
    }

    await Education.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Education entry removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Education entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
