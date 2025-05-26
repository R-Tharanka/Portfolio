const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Other'],
    trim: true
  },
  proficiency: {
    type: Number,
    required: [true, 'Proficiency level is required'],
    min: 1,
    max: 10
  },
  icon: {
    type: String,
    required: [true, 'Icon reference is required'],
    trim: true
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

module.exports = mongoose.model('Skill', skillSchema);
