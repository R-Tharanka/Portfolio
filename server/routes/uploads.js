const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const cloudinaryService = require('../services/cloudinaryService');

const router = express.Router();

// Configure temporary storage for multer
// We'll use multer to handle the file upload, but we won't save to disk
const storage = multer.memoryStorage();

// File type validation
const fileFilter = (req, file, cb) => {
  // Allow only specific types of images and videos
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  if (file.fieldname === 'image' && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, WEBP images or MP4, WEBM, OGG videos are allowed.'), false);
  }
};

// Size limits
const limits = {
  fileSize: (req, file) => {
    return file.fieldname === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
  }
};

// Upload middleware
const upload = multer({ 
  storage,
  fileFilter,
  limits
});

// @route   POST /api/uploads/projects/:projectId
// @desc    Upload project media files to Cloudinary
// @access  Private (Admin only)
router.post('/projects/:projectId', protect, upload.fields([
  { name: 'image', maxCount: 5 },
  { name: 'video', maxCount: 3 }
]), async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const files = req.files;
    
    // Format response with file info
    const mediaItems = [];
    
    // Process uploaded images
    if (files.image) {
      const imagePromises = files.image.map(async (file, index) => {
        const result = await cloudinaryService.uploadBuffer(file.buffer, 'image', projectId);
        
        return {
          type: 'image',
          url: result.secure_url, // Use the secure URL from Cloudinary
          publicId: result.public_id, // Store Cloudinary public_id for later manipulation
          isExternal: false,
          order: index,
          displayFirst: index === 0 && !files.video // First image is display first only if no videos
        };
      });
      
      const uploadedImages = await Promise.all(imagePromises);
      mediaItems.push(...uploadedImages);
    }
    
    // Process uploaded videos
    if (files.video) {
      const videoPromises = files.video.map(async (file, index) => {
        const result = await cloudinaryService.uploadBuffer(file.buffer, 'video', projectId);
        
        return {
          type: 'video',
          url: result.secure_url, // Use the secure URL from Cloudinary
          publicId: result.public_id, // Store Cloudinary public_id for later manipulation
          isExternal: false,
          order: files.image ? files.image.length + index : index,
          displayFirst: index === 0 // First video is display first by default
        };
      });
      
      const uploadedVideos = await Promise.all(videoPromises);
      mediaItems.push(...uploadedVideos);
    }
    
    res.json({
      success: true,
      mediaItems
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Try to parse error details if it's from our Cloudinary service
    let errorMessage = error.message;
    let statusCode = 500;
    
    try {
      const errorDetails = JSON.parse(error.message);
      if (errorDetails.message) {
        errorMessage = errorDetails.message;
      }
      if (errorDetails.code && typeof errorDetails.code === 'number') {
        statusCode = errorDetails.code;
      }
      
      res.status(statusCode).json({
        error: 'Cloudinary Error',
        message: errorMessage,
        details: errorDetails
      });
    } catch (parseError) {
      // If error is not in our JSON format, return standard error
      res.status(500).json({
        error: 'Server Error',
        message: error.message
      });
    }
  }
});

// @route   DELETE /api/uploads/projects/:publicId
// @desc    Delete project media file from Cloudinary
// @access  Private (Admin only)
router.delete('/projects/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Check if it's an image or video based on the public_id path
    const resourceType = publicId.includes('video') ? 'video' : 'image';
    
    // Delete file from Cloudinary using our service
    const result = await cloudinaryService.deleteFile(publicId, resourceType);
    
    if (result.result === 'ok') {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found or could not be deleted' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
});

module.exports = router;
