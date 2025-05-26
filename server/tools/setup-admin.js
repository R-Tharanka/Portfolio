require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
    console.log('Connected to MongoDB...');

    const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

    // Check if any admin exists
    const adminExists = await Admin.findOne({});
    if (adminExists) {
      console.log('An admin user already exists. For security reasons, use the password reset functionality if needed.');
      process.exit(0);
    }

    // Get admin credentials
    console.log('Creating first admin user...');
    const username = await askQuestion('Enter admin username: ');
    const password = await askQuestion('Enter admin password (min 6 characters): ');

    if (password.length < 6) {
      console.log('Password must be at least 6 characters long.');
      process.exit(1);
    }

    // Create admin user
    const admin = new Admin({
      username,
      password
    });

    await admin.save();
    console.log('Admin user created successfully! You can now log in to the admin panel.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
}

setupAdmin();
