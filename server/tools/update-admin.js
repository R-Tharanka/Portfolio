require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function updateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));
    
    // Authenticate current admin
    const currentUsername = await askQuestion('Enter current admin username: ');
    const currentPassword = await askQuestion('Enter current admin password: ');
    
    // Find the admin user
    const admin = await Admin.findOne({ username: currentUsername }).select('+password');
    
    if (!admin) {
      console.log('Admin user not found. Please check your username.');
      process.exit(1);
    }
    
    // Verify current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      console.log('Invalid password. Authentication failed.');
      process.exit(1);
    }
    
    console.log('Authentication successful! You can now update your credentials.');
    
    // Get new credentials
    const newUsername = await askQuestion('Enter new username (leave blank to keep current): ');
    const newPassword = await askQuestion('Enter new password (min 6 characters, leave blank to keep current): ');
    
    // Update the admin user
    if (newUsername && newUsername !== admin.username) {
      // Check if username is already taken
      const usernameExists = await Admin.findOne({ username: newUsername });
      if (usernameExists) {
        console.log('This username is already taken. Please choose a different one.');
        process.exit(1);
      }
      
      admin.username = newUsername;
      console.log('Username will be updated.');
    }
    
    if (newPassword) {
      if (newPassword.length < 6) {
        console.log('Password must be at least 6 characters long.');
        process.exit(1);
      }
      
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
      console.log('Password will be updated.');
    }
    
    // Save changes
    await admin.save();
    console.log('Admin credentials updated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
}

updateAdmin();
