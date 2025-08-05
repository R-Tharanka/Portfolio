/**
 * Media Cleanup Tool
 * 
 * This script checks for and removes any unnecessary files/directories from the old
 * local storage implementation after migrating to Cloudinary.
 * 
 * Run with: node tools/cleanup-local-media.js
 */
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

// Define directories that might contain legacy media files
const legacyDirectories = [
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', 'public', 'uploads'),
  path.join(__dirname, '..', 'public', 'uploads', 'projects')
];

/**
 * Check if directory exists
 */
async function directoryExists(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Get all files in a directory recursively
 */
async function getFilesRecursively(dirPath) {
  const fileList = [];
  
  try {
    const exists = await directoryExists(dirPath);
    if (!exists) {
      return fileList;
    }
    
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        const subFiles = await getFilesRecursively(filePath);
        fileList.push(...subFiles);
      } else {
        fileList.push(filePath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err.message);
  }
  
  return fileList;
}

/**
 * Clean up unnecessary files and directories
 */
async function cleanupLocalMedia() {
  console.log('\n=== Media Cleanup Tool ===\n');
  
  let removedFiles = 0;
  let removedDirs = 0;
  
  // Check each potential legacy directory
  for (const dirPath of legacyDirectories) {
    try {
      const exists = await directoryExists(dirPath);
      
      if (exists) {
        console.log(`Checking directory: ${dirPath}`);
        
        // Get all files in this directory
        const files = await getFilesRecursively(dirPath);
        
        if (files.length > 0) {
          console.log(`Found ${files.length} files to remove`);
          
          // Remove each file
          for (const file of files) {
            try {
              await fs.unlink(file);
              console.log(`✅ Removed file: ${file}`);
              removedFiles++;
            } catch (err) {
              console.error(`❌ Failed to remove file ${file}:`, err.message);
            }
          }
        } else {
          console.log(`No files found in ${dirPath}`);
        }
      } else {
        console.log(`Directory doesn't exist (already cleaned up): ${dirPath}`);
      }
    } catch (err) {
      console.error(`Error processing directory ${dirPath}:`, err.message);
    }
  }
  
  // Now try to remove the directories themselves, starting from deepest
  for (const dirPath of [...legacyDirectories].reverse()) {
    try {
      const exists = await directoryExists(dirPath);
      
      if (exists) {
        try {
          await fs.rmdir(dirPath);
          console.log(`✅ Removed empty directory: ${dirPath}`);
          removedDirs++;
        } catch (err) {
          if (err.code === 'ENOTEMPTY') {
            console.log(`Directory not empty, skipping: ${dirPath}`);
          } else {
            console.error(`❌ Failed to remove directory ${dirPath}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error(`Error checking directory ${dirPath}:`, err.message);
    }
  }
  
  console.log('\n=== Cleanup Summary ===');
  console.log(`Files removed: ${removedFiles}`);
  console.log(`Directories removed: ${removedDirs}`);
  console.log('\nCleanup complete!\n');
}

// Run the cleanup
cleanupLocalMedia().catch(console.error);
