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
    default: () => {
      const minutes = parseInt(process.env.PASSWORD_RESET_EXPIRY) || 15;
      return new Date(Date.now() + minutes * 60 * 1000);
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: () => (parseInt(process.env.PASSWORD_RESET_EXPIRY) || 15) * 60 // Automatically remove documents after expiry (in seconds)
  }
});

module.exports = mongoose.model('ResetToken', resetTokenSchema);
