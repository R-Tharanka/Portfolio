const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // Automatically remove documents after 15 minutes (in seconds)
  }
});

module.exports = mongoose.model('ResetToken', resetTokenSchema);
