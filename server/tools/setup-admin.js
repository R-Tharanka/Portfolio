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
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set. Please set it in the .env file.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
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
    const email = await askQuestion('Enter admin email: ');
    
    // Check if email is valid
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.log('Please provide a valid email address.');
      process.exit(1);
    }
    
    const password = await askQuestion('Enter admin password (min 6 characters): ');

    if (password.length < 6) {
      console.log('Password must be at least 6 characters long.');
      process.exit(1);
    }

    // Create admin user
    const admin = new Admin({
      username,
      email,
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
