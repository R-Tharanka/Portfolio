require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function addEmailToAdmins() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set. Please set it in the .env file.');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

    // Find all admin users without email
    const admins = await Admin.find({});
    
    if (admins.length === 0) {
      console.log('No admin accounts found.');
      process.exit(0);
    }

    console.log(`Found ${admins.length} admin account(s).`);
    
    // Process each admin
    for (const admin of admins) {
      console.log(`\nProcessing admin: ${admin.username}`);
      
      if (admin.email) {
        console.log(`Admin ${admin.username} already has an email: ${admin.email}`);
        const updateAnyway = await askQuestion('Do you want to update this email? (yes/no): ');
        if (updateAnyway.toLowerCase() !== 'yes') {
          console.log('Skipping this admin.');
          continue;
        }
      }
      
      const email = await askQuestion(`Enter email for admin "${admin.username}": `);
      
      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        console.log('Please provide a valid email address. Skipping this admin.');
        continue;
      }
      
      // Check if email is already used by another admin
      const emailExists = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (emailExists) {
        console.log('This email is already used by another admin. Skipping this admin.');
        continue;
      }
      
      // Update the admin with the email
      admin.email = email;
      await admin.save();
      console.log(`Email for admin "${admin.username}" updated successfully to "${email}"!`);
    }
    
    console.log('\nEmail update process completed.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
}

addEmailToAdmins();
