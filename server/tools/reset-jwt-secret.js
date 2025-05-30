/**
 * Admin JWT Token Reset Utility
 * 
 * This script updates the JWT secret, effectively invalidating all existing tokens
 * Use this if you suspect tokens are not expiring properly or in case of a security incident
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a new secure JWT secret
const generateSecureSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Function to update the JWT secret in the .env file
const updateJwtSecret = () => {
  const envFilePath = path.join(__dirname, '..', '.env');
  
  try {
    // Read current .env file
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Generate new JWT secret
    const newSecret = generateSecureSecret();
    
    // Replace existing JWT_SECRET with new one
    envContent = envContent.replace(
      /JWT_SECRET=.*/,
      `JWT_SECRET=${newSecret}`
    );
    
    // Write updated content back to .env file
    fs.writeFileSync(envFilePath, envContent);
    
    console.log('\n✅ JWT secret has been successfully updated.');
    console.log('⚠️ All existing tokens have been invalidated.');
    console.log('👉 Users will need to log in again to get new tokens.');
    
  } catch (error) {
    console.error('Error updating JWT secret:', error);
  }
};

// Start script with confirmation
console.log('\n⚠️  WARNING: This utility will invalidate ALL existing JWT tokens ⚠️');
console.log('All users will be logged out and need to sign in again');

rl.question('\nAre you sure you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    updateJwtSecret();
  } else {
    console.log('Operation cancelled.');
  }
  rl.close();
});
