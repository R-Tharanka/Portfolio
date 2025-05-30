/**
 * Utility script to verify JWT token settings
 * Run with: node tools/verify-token-settings.js
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('JWT Token Configuration Verification');
console.log('-----------------------------------');
console.log(`JWT_SECRET length: ${process.env.JWT_SECRET?.length || 'Not set'}`);
console.log(`JWT_EXPIRE setting: ${process.env.JWT_EXPIRE || 'Not set'}`);

// Create a test token
const payload = { id: 'test-user-id' };
const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
  expiresIn: process.env.JWT_EXPIRE || '1h'
});

// Decode token to verify expiration
const decoded = jwt.decode(token);
if (decoded) {
  const issuedAt = new Date(decoded.iat * 1000).toISOString();
  const expiresAt = new Date(decoded.exp * 1000).toISOString();
  const durationMs = (decoded.exp - decoded.iat) * 1000;
  const durationHours = durationMs / (1000 * 60 * 60);
  
  console.log('\nTest Token Details:');
  console.log(`Issued at: ${issuedAt}`);
  console.log(`Expires at: ${expiresAt}`);
  console.log(`Duration: ${durationHours.toFixed(2)} hours (${(durationMs / 1000).toFixed(0)} seconds)`);
} else {
  console.error('Failed to decode token');
}
