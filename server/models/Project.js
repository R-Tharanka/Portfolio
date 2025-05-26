const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  technologies: {
    type: [String],
    required: [true, 'At least one technology is required']
  },
  timeline: {
    start: {
      type: String,
      required: [true, 'Start date is required'],
      trim: true
    },
    end: {
      type: String,
      default: null,
      trim: true
    }
  },
  imageUrl: {
    type: String,
    required: [true, 'Project image URL is required'],
    trim: true
  },
  repoLink: {
    type: String,
    trim: true
  },
  demoLink: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    required: [true, 'At least one tag is required']
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
