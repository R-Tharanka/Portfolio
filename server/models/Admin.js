const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log(`Password not modified for user ${this._id}, skipping hash`);
    return next();
  }
  
  console.log(`Hashing password for user ${this._id}`);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log(`Password hashed successfully for user ${this._id}`);
  next();
});

// Sign JWT and return
adminSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
adminSchema.methods.matchPassword = async function(enteredPassword) {
  const result = await bcrypt.compare(enteredPassword, this.password);
  console.log(`Password match attempt for user ${this._id}: ${result ? 'SUCCESS' : 'FAILED'}`);
  return result;
};

module.exports = mongoose.model('Admin', adminSchema);
