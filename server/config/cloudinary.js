const cloudinary = require('cloudinary').v2;
const env = require('./environment');

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key: env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
  secure: true // Always use HTTPS
});

// Export configured cloudinary instance
module.exports = cloudinary;
