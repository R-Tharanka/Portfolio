require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function addAdmin() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set. Please set it in the .env file.');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

    // Get admin credentials
    console.log('Creating new admin user...');
    const username = await askQuestion('Enter new admin username: ');
    
    // Check if username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log('An admin with this username already exists. Please choose a different username.');
      process.exit(1);
    }
    
    const email = await askQuestion('Enter admin email: ');
    
    // Check if email is valid
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.log('Please provide a valid email address.');
      process.exit(1);
    }
    
    // Check if email already exists
    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
      console.log('An admin with this email already exists. Please use a different email.');
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
    console.log(`Admin user '${username}' created successfully! You can now log in to the admin panel.`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
}

addAdmin();
