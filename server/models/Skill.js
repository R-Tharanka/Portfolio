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
  },  icon: {
    type: String,
    required: [true, 'Icon reference is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Basic validation to ensure the icon string is in a valid format
        // Allows: 
        // 1. Library icon names (e.g., 'react', 'nodejs')
        // 2. URLs starting with http:// or https://
        // 3. Base64 encoded images starting with data:image/
        return /^[a-zA-Z0-9-]+$/.test(v) || 
               /^https?:\/\/.+/.test(v) || 
               /^data:image\/.+/.test(v);
      },
      message: 'Icon must be a valid reference name, URL, or base64 image'
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

module.exports = mongoose.model('Skill', skillSchema);
