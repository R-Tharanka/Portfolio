// environment.js - Environment-specific utilities and helpers

/**
 * Check if the application is running in production mode
 */
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  isProduction
};
