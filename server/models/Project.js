const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: [true, 'Media type is required']
  },
  url: {
    type: String,
    required: [true, 'Media URL is required'],
    trim: true
  },
  publicId: {
    type: String,
    trim: true
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  displayFirst: {
    type: Boolean,
    default: false
  },
  showInViewer: {
    type: Boolean,
    default: true
  }
});

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
  // Keep imageUrl for backward compatibility
  imageUrl: {
    type: String,
    trim: true
  },
  // New field for multiple media items
  media: {
    type: [mediaSchema],
    default: []
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
