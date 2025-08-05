/**
 * Centralized environment variable management
 */
const environment = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Server configuration
  PORT: process.env.PORT || 5000,
  
  // MongoDB URI
  MONGODB_URI: process.env.MONGODB_URI,
  
  // JWT settings
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Cloudinary configuration
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
    FOLDER: process.env.CLOUDINARY_FOLDER || 'portfolio',
  },
  
  // CORS settings
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : []
};

module.exports = environment;
