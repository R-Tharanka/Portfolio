const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Education title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
    // Made description optional by removing required field
  },
  skills: {
    type: [String],
    default: []
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
