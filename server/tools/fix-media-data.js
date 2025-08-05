/**
 * Fix Media Data Tool
 * 
 * This script helps identify and fix issues with media data in projects:
 * 1. Remove duplicate displayFirst=true flags
 * 2. Fix incorrect publicId formats
 * 3. Clean up invalid media references
 * 
 * Run with: node tools/fix-media-data.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const cloudinaryService = require('../services/cloudinaryService');
const env = require('../config/environment');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Helper to verify a Cloudinary URL is valid
const isValidCloudinaryUrl = (url) => {
  return url && 
    typeof url === 'string' && 
    url.includes('cloudinary.com') && 
    url.includes('/upload/');
};

// Helper to ensure publicId is properly formatted
const ensureCorrectPublicId = (publicId, url) => {
  if (!publicId && url && isValidCloudinaryUrl(url)) {
    // Extract publicId from URL if missing
    const urlParts = url.split('/upload/v');
    if (urlParts.length === 2) {
      const afterVersion = urlParts[1].split('/');
      // Remove version number
      afterVersion.shift();
      return afterVersion.join('/').replace(/\.[^/.]+$/, ""); // Remove file extension
    }
  }
  return publicId;
};

/**
 * Fix project media data
 */
async function fixProjectMediaData(project) {
  console.log(`\nFixing media for project: ${project.title} (${project._id})`);
  
  let hasChanges = false;
  let hasDisplayFirst = false;
  const fixedMedia = [];
  
  if (project.media && project.media.length > 0) {
    console.log(`Found ${project.media.length} media items`);
    
    for (let i = 0; i < project.media.length; i++) {
      const mediaItem = project.media[i];
      const fixedItem = { ...mediaItem };
      
      // Fix 1: Check and repair publicId if needed
      if (!mediaItem.isExternal && isValidCloudinaryUrl(mediaItem.url) && 
          (!mediaItem.publicId || mediaItem.publicId.indexOf('portfolio/') !== 0)) {
        const correctedPublicId = ensureCorrectPublicId(mediaItem.publicId, mediaItem.url);
        if (correctedPublicId !== mediaItem.publicId) {
          console.log(`  ✅ Fixed publicId for item ${i}: "${mediaItem.publicId || 'MISSING'}" -> "${correctedPublicId}"`);
          fixedItem.publicId = correctedPublicId;
          hasChanges = true;
        }
      }
      
      // Fix 2: Fix displayFirst flags
      if (mediaItem.displayFirst) {
        if (hasDisplayFirst) {
          console.log(`  ✅ Fixed duplicate displayFirst on item ${i}`);
          fixedItem.displayFirst = false;
          hasChanges = true;
        } else {
          hasDisplayFirst = true;
        }
      }
      
      // Add the fixed item to our new array
      fixedMedia.push(fixedItem);
    }
    
    // Fix 3: Ensure at least one item has displayFirst=true if we have media
    if (!hasDisplayFirst && fixedMedia.length > 0) {
      console.log(`  ✅ Set first item to displayFirst`);
      fixedMedia[0].displayFirst = true;
      hasChanges = true;
    }
    
    // Update the project's media array
    project.media = fixedMedia;
  }
  
  // Fix 4: Ensure imageUrl is set to the displayFirst media item
  if (project.media && project.media.length > 0) {
    const displayFirst = project.media.find(m => m.displayFirst);
    if (displayFirst && project.imageUrl !== displayFirst.url) {
      console.log(`  ✅ Updated project imageUrl to match displayFirst media`);
      project.imageUrl = displayFirst.url;
      hasChanges = true;
    }
  }

  // Save the project if changes were made
  if (hasChanges) {
    try {
      await project.save();
      console.log(`✅ Project saved with fixed media data`);
    } catch (error) {
      console.error(`❌ Failed to save project:`, error.message);
    }
  } else {
    console.log(`ℹ️ No changes needed for this project`);
  }
}

/**
 * Main function to process all projects
 */
async function fixAllProjectsMedia() {
  try {
    console.log('Starting media data fix process...');
    
    // Get all projects
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to process`);
    
    // Process each project
    for (let i = 0; i < projects.length; i++) {
      console.log(`\n[${i + 1}/${projects.length}] Processing project...`);
      await fixProjectMediaData(projects[i]);
    }
    
    console.log('\n✅ Media data fix complete!');
  } catch (error) {
    console.error('Error fixing media data:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
fixAllProjectsMedia().catch(console.error);
