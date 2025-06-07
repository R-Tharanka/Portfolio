const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ 'timeline.start': -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error in GET /api/projects:', error.message);
    console.error(error.stack);
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
});

// @route   GET /api/projects/featured
// @desc    Get featured projects
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const projects = await Project.find({ featured: true }).sort({ 'timeline.start': -1 });
    res.json(projects);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects
// @desc    Create a project
// @access  Private (Admin only)
router.post('/', [
  protect,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('technologies', 'At least one technology is required').isArray({ min: 1 }),
    check('timeline.start', 'Start date is required').not().isEmpty(),
    check('imageUrl', 'Image URL is required').not().isEmpty(),
    check('tags', 'At least one tag is required').isArray({ min: 1 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      technologies,
      timeline,
      imageUrl,
      repoLink,
      demoLink,
      tags,
      featured
    } = req.body;

    // Create new project
    const project = new Project({
      title,
      description,
      technologies,
      timeline,
      imageUrl,
      repoLink,
      demoLink,
      tags,
      featured: featured || false
    });

    const savedProject = await project.save();
    res.json(savedProject);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private (Admin only)
router.put('/:id', [
  protect,
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('description', 'Description is required').optional().not().isEmpty(),
    check('technologies', 'Technologies should be an array').optional().isArray(),
    check('tags', 'Tags should be an array').optional().isArray()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedProject);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Log the request for debugging
    console.log('Delete project request received for ID:', req.params.id);

    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(`Invalid ObjectId format: ${req.params.id}`);
      return res.status(400).json({ msg: 'Invalid project ID format' });
    }

    // Find the project first to verify it exists
    const project = await Project.findById(req.params.id);

    if (!project) {
      console.log(`Project not found with ID: ${req.params.id}`);
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Log project info before deletion for debugging
    console.log(`Found project to delete: ${project.title}`);

    // Use findOneAndDelete for better error handling
    const deletedProject = await Project.findOneAndDelete({ _id: req.params.id });

    if (!deletedProject) {
      console.error(`Failed to delete project with ID: ${req.params.id}`);
      return res.status(500).json({ msg: 'Failed to delete project' });
    }

    console.log(`Project successfully deleted: ${deletedProject.title}`);
    res.json({ msg: 'Project removed', id: req.params.id });
  } catch (error) {
    console.error('Error deleting project:', error.message);
    console.error('Error stack:', error.stack);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found - invalid ID format' });
    }

    // Provide more detailed error response
    res.status(500).json({
      msg: 'Server error while deleting project',
      error: error.message
    });
  }
});

module.exports = router;
