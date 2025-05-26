const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Skill = require('../models/Skill');
const { protect } = require('../middleware/auth');

// @route   GET /api/skills
// @desc    Get all skills
// @access  Public
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, proficiency: -1 });
    res.json(skills);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/skills
// @desc    Add a new skill
// @access  Private (Admin only)
router.post('/', [
  protect,
  [
    check('name', 'Skill name is required').not().isEmpty(),
    check('category', 'Category is required').isIn([
      'Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Other'
    ]),
    check('proficiency', 'Proficiency must be a number between 1 and 10').isInt({ min: 1, max: 10 }),
    check('icon', 'Icon reference is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, category, proficiency, icon } = req.body;

    // Check if skill already exists
    let skill = await Skill.findOne({ name });
    if (skill) {
      return res.status(400).json({ msg: 'Skill already exists' });
    }

    // Create new skill
    skill = new Skill({
      name,
      category,
      proficiency,
      icon
    });

    await skill.save();
    res.json(skill);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/skills/:id
// @desc    Update a skill
// @access  Private (Admin only)
router.put('/:id', [
  protect,
  [
    check('name', 'Skill name is required').optional().not().isEmpty(),
    check('category', 'Invalid category').optional().isIn([
      'Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Other'
    ]),
    check('proficiency', 'Proficiency must be a number between 1 and 10')
      .optional()
      .isInt({ min: 1, max: 10 }),
    check('icon', 'Icon reference is required').optional().not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, category, proficiency, icon } = req.body;
    
    // Build skill object
    const skillFields = {};
    if (name) skillFields.name = name;
    if (category) skillFields.category = category;
    if (proficiency !== undefined) skillFields.proficiency = proficiency;
    if (icon) skillFields.icon = icon;
    
    let skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $set: skillFields },
      { new: true }
    );

    res.json(skill);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/skills/:id
// @desc    Delete a skill
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    await Skill.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Skill removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
