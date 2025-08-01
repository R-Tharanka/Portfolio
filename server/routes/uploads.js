const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectId = req.params.projectId || 'temp';
    const uploadDir = path.join(__dirname, '../public/uploads/projects', projectId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// File type validation
const fileFilter = (req, file, cb) => {
  // Allow only specific types of images and videos
  const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const allowedVideoTypes = ['.mp4', '.webm', '.ogg'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'image' && allowedImageTypes.includes(ext)) {
    cb(null, true);
  } else if (file.fieldname === 'video' && allowedVideoTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, WEBP images or MP4, WEBM, OGG videos are allowed.'), false);
  }
};

// Size limits
const limits = {
  // 5MB for images, 50MB for videos
  fileSize: (req, file) => {
    return file.fieldname === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
  }
};

// Upload middleware
const upload = multer({ 
  storage,
  fileFilter,
  limits
});

// @route   POST /api/uploads/projects/:projectId
// @desc    Upload project media files
// @access  Private (Admin only)
router.post('/projects/:projectId', protect, upload.fields([
  { name: 'image', maxCount: 5 },
  { name: 'video', maxCount: 3 }
]), async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const files = req.files;
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/projects/${projectId}/`;
    
    // Format response with file info
    const mediaItems = [];
    
    // Process uploaded images
    if (files.image) {
      files.image.forEach((file, index) => {
        mediaItems.push({
          type: 'image',
          url: baseUrl + file.filename,
          isExternal: false,
          order: index,
          displayFirst: index === 0 && !files.video // First image is display first only if no videos
        });
      });
    }
    
    // Process uploaded videos
    if (files.video) {
      files.video.forEach((file, index) => {
        mediaItems.push({
          type: 'video',
          url: baseUrl + file.filename,
          isExternal: false,
          order: files.image ? files.image.length + index : index,
          displayFirst: index === 0 // First video is display first by default
        });
      });
    }
    
    res.json({
      success: true,
      mediaItems
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
});

// @route   DELETE /api/uploads/projects/:projectId/:filename
// @desc    Delete project media file
// @access  Private (Admin only)
router.delete('/projects/:projectId/:filename', protect, async (req, res) => {
  try {
    const { projectId, filename } = req.params;
    const filePath = path.join(__dirname, '../public/uploads/projects', projectId, filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete file
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
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
