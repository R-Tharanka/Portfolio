require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function viewAdmins() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set. Please set it in the .env file.');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Find all admin users
    const admins = await Admin.find({}).select('-password');
    
    if (admins.length === 0) {
      console.log('No admin accounts found.');
      process.exit(0);
    }

    console.log(`\nFound ${admins.length} admin account(s):\n`);
    
    // Display admin details
    admins.forEach((admin, index) => {
      console.log(`--- Admin ${index + 1} ---`);
      console.log(`ID: ${admin._id}`);
      console.log(`Username: ${admin.username}`);
      console.log(`Email: ${admin.email || 'Not set'}`);
      console.log(`Created: ${admin.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

viewAdmins();
