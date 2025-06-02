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

    // Convert to plain objects and ensure each document has an 'id' field
    // that matches its '_id' for consistency with the client
    const educationWithIds = education.map(doc => {
      const item = doc.toObject();
      item.id = item._id.toString();
      return item;
    });

    console.log(`Returning ${educationWithIds.length} education entries, all with IDs`);
    res.json(educationWithIds);
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

    // Convert to a plain object and ensure it has an 'id' field
    // that matches its '_id' for consistency with the client
    const educationWithId = education.toObject();
    educationWithId.id = educationWithId._id.toString();

    res.json(educationWithId);
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
    } = req.body;    // Create new education entry
    const education = new Education({
      institution,
      title,
      description,
      skills: skills || [],
      timeline
    });

    const savedEducation = await education.save();

    // Convert to a plain object and ensure it has an 'id' field
    // that matches its '_id' for consistency with the client
    const educationWithId = savedEducation.toObject();
    educationWithId.id = educationWithId._id.toString();

    console.log('Created new education entry with ID:', educationWithId.id);
    res.json(educationWithId);
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
    // Log the ID we're trying to update for debugging purposes
    console.log(`Server: Attempting to update education with ID: ${req.params.id}`);

    // Validate that the ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(`Invalid ObjectId format: ${req.params.id}`);
      return res.status(400).json({ msg: 'Invalid ID format' });
    }

    const education = await Education.findById(req.params.id);

    if (!education) {
      console.log(`Education with ID ${req.params.id} not found`);
      return res.status(404).json({ msg: 'Education entry not found' });
    }

    // Log the education entry we found
    console.log(`Found education entry to update:`, education);

    const updatedEducation = await Education.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // Add id field explicitly for the client
    const responseData = updatedEducation.toObject();
    responseData.id = responseData._id;

    console.log(`Successfully updated education:`, responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error updating education:', error.message);
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
    // Log the ID we're trying to delete for debugging purposes
    console.log(`Server: Attempting to delete education with ID: ${req.params.id}`);

    // Validate that the ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(`Invalid ObjectId format: ${req.params.id}`);
      return res.status(400).json({ msg: 'Invalid ID format' });
    }

    const education = await Education.findById(req.params.id);

    if (!education) {
      console.log(`Education with ID ${req.params.id} not found`);
      return res.status(404).json({ msg: 'Education entry not found' });
    }

    // Log the education entry we found
    console.log(`Found education entry to delete:`, education);

    await Education.findByIdAndRemove(req.params.id);
    console.log(`Successfully deleted education with ID: ${req.params.id}`);
    res.json({ msg: 'Education entry removed' });
  } catch (error) {
    console.error('Error deleting education:', error);

    // Check if it's an ObjectID error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Education entry not found - Invalid ID format' });
    }

    // Send back detailed error for debugging
    return res.status(500).json({
      msg: 'Server Error when deleting education',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

module.exports = router;
