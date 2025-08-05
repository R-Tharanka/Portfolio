/**
 * Cloudinary Configuration Checker
 * 
 * This script verifies your Cloudinary configuration and tests connectivity.
 * Run it to make sure your Cloudinary setup is working properly.
 */
require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const env = require('../config/environment');

async function checkCloudinaryConfig() {
  console.log('\n------ Cloudinary Configuration Check ------\n');
  
  // Check if environment variables are set
  const missingVars = [];
  if (!env.CLOUDINARY.CLOUD_NAME) missingVars.push('CLOUDINARY_CLOUD_NAME');
  if (!env.CLOUDINARY.API_KEY) missingVars.push('CLOUDINARY_API_KEY');
  if (!env.CLOUDINARY.API_SECRET) missingVars.push('CLOUDINARY_API_SECRET');
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Cloudinary environment variables:');
    missingVars.forEach(variable => console.error(`   - ${variable}`));
    console.log('\nPlease add these variables to your .env file');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
  console.log(`\nCloud Name: ${env.CLOUDINARY.CLOUD_NAME}`);
  console.log(`API Key: ${env.CLOUDINARY.API_KEY.slice(0, 5)}...[hidden]`);
  console.log(`Folder: ${env.CLOUDINARY.FOLDER || 'Not set (using default)'}`);
  
  // Test Cloudinary connectivity
  try {
    console.log('\nTesting Cloudinary connectivity...');
    
    const result = await cloudinary.api.ping();
    if (result && result.status === 'ok') {
      console.log('✅ Successfully connected to Cloudinary!');
    } else {
      console.error('❌ Connection test returned unexpected result:', result);
    }
  } catch (error) {
    console.error('❌ Failed to connect to Cloudinary:', error.message);
    if (error.error && error.error.message) {
      console.error('   Cloudinary error:', error.error.message);
    }
    process.exit(1);
  }
  
  // Test uploading a test image
  try {
    console.log('\nTesting upload functionality...');
    
    // Create a small 1x1 pixel transparent PNG
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: `${env.CLOUDINARY.FOLDER}/test`,
          public_id: 'connection_test',
          overwrite: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      stream.end(testImageBuffer);
    });
    
    console.log('✅ Test image uploaded successfully!');
    console.log(`   URL: ${uploadResult.secure_url}`);
    
    // Try to delete the test image
    try {
      await cloudinary.uploader.destroy(uploadResult.public_id);
      console.log('✅ Test image deleted successfully');
    } catch (deleteError) {
      console.warn('⚠️ Could not delete test image:', deleteError.message);
    }
    
  } catch (uploadError) {
    console.error('❌ Failed to upload test image:', uploadError.message);
    if (uploadError.error && uploadError.error.message) {
      console.error('   Cloudinary error:', uploadError.error.message);
    }
    process.exit(1);
  }
  
  console.log('\n✅ All tests passed! Your Cloudinary configuration is working correctly.');
  console.log('\n-------------------------------------\n');
}

// Run the check
checkCloudinaryConfig().catch(console.error);
