require('dotenv').config();
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

    console.log(`\n=== Found ${admins.length} admin account(s) ===\n`);
    
    // Display admin details in a table format
    console.log('ID'.padEnd(25) + ' | ' + 
                'USERNAME'.padEnd(20) + ' | ' + 
                'EMAIL'.padEnd(30) + ' | ' + 
                'CREATED AT');
    console.log('-'.repeat(90));

    // Process each admin
    for (const admin of admins) {
      const createdDate = new Date(admin.createdAt).toLocaleString();
      console.log(
        `${admin._id}`.padEnd(25) + ' | ' +
        `${admin.username || 'N/A'}`.padEnd(20) + ' | ' +
        `${admin.email || 'N/A'}`.padEnd(30) + ' | ' +
        createdDate
      );
    }

    console.log('\n=== End of admin accounts list ===');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

viewAdmins();
