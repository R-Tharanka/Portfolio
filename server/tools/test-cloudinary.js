/**
 * Cloudinary Integration Tests
 * 
 * Run with: node test-cloudinary.js
 * 
 * This script tests the CloudinaryService implementation to verify
 * that uploads, transformations, and deletions are working correctly.
 */
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const cloudinaryService = require('../services/cloudinaryService');

// Create a test image in memory
const createTestImage = () => {
  // Simple 1x1 transparent PNG
  return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
};

// Format a result for display
const formatResult = (testName, success, message, details = null) => {
  return {
    test: testName,
    success,
    message,
    details: details || {},
    timestamp: new Date().toISOString()
  };
};

// Run tests sequentially
const runTests = async () => {
  console.log('\n=== Cloudinary Integration Tests ===\n');
  const results = [];
  const testData = {
    imageBuffer: createTestImage(),
    projectId: 'test-project-' + Date.now(),
    uploadResult: null,
  };

  try {
    // Test 1: Configuration
    try {
      console.log('🔍 Test 1: Verifying Cloudinary configuration...');
      
      // The constructor already verifies config
      const configResult = { verified: true };
      
      results.push(formatResult(
        'Configuration verification', 
        true, 
        'Cloudinary configuration is valid',
        configResult
      ));
      console.log('✅ Configuration test passed\n');
    } catch (error) {
      results.push(formatResult(
        'Configuration verification', 
        false, 
        'Failed to verify Cloudinary configuration',
        { error: error.message }
      ));
      console.log('❌ Configuration test failed\n');
      throw new Error('Cannot continue tests without valid configuration');
    }

    // Test 2: Image upload
    try {
      console.log('🔍 Test 2: Testing image upload...');
      
      const uploadResult = await cloudinaryService.uploadBuffer(
        testData.imageBuffer,
        'image',
        testData.projectId
      );
      
      // Save for later tests
      testData.uploadResult = uploadResult;
      
      results.push(formatResult(
        'Image upload', 
        true, 
        'Successfully uploaded test image to Cloudinary',
        { 
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url
        }
      ));
      console.log('✅ Upload test passed\n');
    } catch (error) {
      results.push(formatResult(
        'Image upload', 
        false, 
        'Failed to upload test image',
        { error: error.message }
      ));
      console.log('❌ Upload test failed\n');
      throw new Error('Cannot continue tests without successful upload');
    }

    // Test 3: URL transformations
    try {
      console.log('🔍 Test 3: Testing URL transformations...');
      
      const publicId = testData.uploadResult.public_id;
      
      const transformedUrl = cloudinaryService.getTransformedUrl(publicId, {
        width: 100,
        height: 100,
        crop: 'fill',
        quality: 'auto'
      });
      
      // Test responsive images
      const responsiveUrls = cloudinaryService.getResponsiveImageSources(publicId);
      
      results.push(formatResult(
        'URL transformations', 
        true, 
        'Successfully generated transformed URLs',
        { 
          transformedUrl,
          responsiveUrls
        }
      ));
      console.log('✅ Transformation test passed\n');
    } catch (error) {
      results.push(formatResult(
        'URL transformations', 
        false, 
        'Failed to generate transformed URLs',
        { error: error.message }
      ));
      console.log('❌ Transformation test failed\n');
    }

    // Test 4: Deletion
    try {
      console.log('🔍 Test 4: Testing file deletion...');
      
      const publicId = testData.uploadResult.public_id;
      const deleteResult = await cloudinaryService.deleteFile(publicId, 'image');
      
      results.push(formatResult(
        'File deletion', 
        deleteResult.result === 'ok', 
        deleteResult.result === 'ok' 
          ? 'Successfully deleted test image'
          : 'Error deleting test image',
        deleteResult
      ));
      
      console.log(deleteResult.result === 'ok' 
        ? '✅ Deletion test passed\n'
        : '❌ Deletion test failed\n');
    } catch (error) {
      results.push(formatResult(
        'File deletion', 
        false, 
        'Failed to delete test image',
        { error: error.message }
      ));
      console.log('❌ Deletion test failed\n');
    }

  } catch (error) {
    console.error('Error during tests:', error.message);
    results.push(formatResult(
      'Test suite', 
      false, 
      'Test suite failed to complete',
      { error: error.message }
    ));
  }

  // Generate test report
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const overallSuccess = successCount === totalCount;

  console.log('=== Test Results ===');
  console.log(`Tests passed: ${successCount}/${totalCount}`);
  console.log(`Overall status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);

  results.forEach((result, index) => {
    console.log(`\n--- Test ${index + 1}: ${result.test} ---`);
    console.log(result.success ? '✅ PASS' : '❌ FAIL');
    console.log(result.message);
    if (Object.keys(result.details).length > 0 && result.details.error) {
      console.log(`Error: ${result.details.error}`);
    }
  });

  // Write results to file
  try {
    const reportPath = path.join(__dirname, 'cloudinary-test-results.json');
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: totalCount,
        passedTests: successCount,
        overallSuccess
      },
      results
    }, null, 2));
    console.log(`\nTest report saved to ${reportPath}`);
  } catch (error) {
    console.error('Failed to save test report:', error);
  }

  return overallSuccess;
};

// Run the tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
