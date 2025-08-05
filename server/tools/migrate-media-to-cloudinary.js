/**
 * Media Migration Tool
 * 
 * This script helps migrate existing media files from the server to Cloudinary.
 * It reads the database for media URLs and uploads them to Cloudinary, then updates
 * the database records with the new Cloudinary URLs and publicIds.
 */
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const cloudinaryService = require('../services/cloudinaryService');
const env = require('../config/environment');

// Media directory (used when migrating from local storage)
const MEDIA_DIR = path.join(__dirname, '..', 'public', 'uploads', 'projects');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

/**
 * Check if a URL is a local file path or external URL
 */
function isLocalFile(url) {
  return !url.startsWith('http') && !url.startsWith('//');
}

/**
 * Resolve local file path from URL
 */
function getLocalPath(url) {
  const filename = url.split('/').pop();
  return path.join(MEDIA_DIR, filename);
}

/**
 * Detect media type from file extension
 */
function getMediaType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExts.includes(ext) ? 'video' : 'image';
}

/**
 * Migrate a single project's media to Cloudinary
 */
async function migrateProjectMedia(project) {
  console.log(`\nMigrating media for project: ${project.title} (${project._id})`);

  const migratedMedia = [];
  let hasChanges = false;

  // Handle legacy imageUrl field
  if (project.imageUrl && !project.imageUrl.includes('cloudinary.com')) {
    try {
      console.log(`- Migrating legacy imageUrl: ${project.imageUrl}`);
      
      if (isLocalFile(project.imageUrl)) {
        const localPath = getLocalPath(project.imageUrl);
        const fileBuffer = await fs.readFile(localPath);
        const result = await cloudinaryService.uploadBuffer(
          fileBuffer, 
          'image', 
          project._id
        );
        
        project.imageUrl = result.secure_url;
        console.log(`  ✅ Migrated to: ${result.secure_url}`);
      } else {
        console.log(`  ⚠️ External URL, skipping: ${project.imageUrl}`);
      }
      
      hasChanges = true;
    } catch (error) {
      console.error(`  ❌ Failed to migrate imageUrl:`, error.message);
    }
  }

  // Handle media array items
  if (project.media && project.media.length > 0) {
    for (let i = 0; i < project.media.length; i++) {
      const mediaItem = project.media[i];
      
      // Skip items that are already on Cloudinary or are external
      if (mediaItem.isExternal || mediaItem.url.includes('cloudinary.com')) {
        migratedMedia.push(mediaItem);
        console.log(`- Skipping ${mediaItem.type} [${i}]: Already on Cloudinary or external`);
        continue;
      }
      
      try {
        console.log(`- Migrating ${mediaItem.type} [${i}]: ${mediaItem.url}`);
        
        if (isLocalFile(mediaItem.url)) {
          const localPath = getLocalPath(mediaItem.url);
          const fileBuffer = await fs.readFile(localPath);
          const mediaType = mediaItem.type || getMediaType(localPath);
          
          const result = await cloudinaryService.uploadBuffer(
            fileBuffer, 
            mediaType, 
            project._id
          );
          
          // Create a new media item with Cloudinary data
          const updatedMediaItem = {
            ...mediaItem,
            url: result.secure_url,
            publicId: result.public_id,
            isExternal: false
          };
          
          migratedMedia.push(updatedMediaItem);
          console.log(`  ✅ Migrated to: ${result.secure_url}`);
          hasChanges = true;
        } else {
          // For external URLs, just keep them as-is
          console.log(`  ⚠️ External URL, skipping: ${mediaItem.url}`);
          migratedMedia.push(mediaItem);
        }
      } catch (error) {
        console.error(`  ❌ Failed to migrate media item:`, error.message);
        // Keep the original item if migration failed
        migratedMedia.push(mediaItem);
      }
    }
    
    // Update the media array with migrated items
    project.media = migratedMedia;
  }
  
  // Save the project if any changes were made
  if (hasChanges) {
    try {
      await project.save();
      console.log(`✅ Project saved with migrated media`);
    } catch (error) {
      console.error(`❌ Failed to save project:`, error.message);
    }
  } else {
    console.log(`ℹ️ No changes needed for this project`);
  }
}

/**
 * Main migration function
 */
async function migrateAllMedia() {
  try {
    console.log('Starting media migration to Cloudinary...');
    console.log(`Using Cloudinary folder: ${env.CLOUDINARY.FOLDER}`);
    
    // Get all projects
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to process`);
    
    // Process each project
    for (let i = 0; i < projects.length; i++) {
      console.log(`\n[${i + 1}/${projects.length}] Processing project...`);
      await migrateProjectMedia(projects[i]);
    }
    
    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
migrateAllMedia().catch(console.error);
