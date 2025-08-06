/**
 * CloudinaryService handles all Cloudinary operations
 * This service encapsulates all Cloudinary interactions and provides error handling
 */
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const env = require('../config/environment');

class CloudinaryService {
  constructor() {
    // Verify Cloudinary configuration on initialization
    this.verifyConfig();
  }
  
  /**
   * Verify Cloudinary configuration is properly set
   */
  verifyConfig() {
    const { CLOUD_NAME, API_KEY, API_SECRET } = env.CLOUDINARY;
    
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error('⚠️ Missing Cloudinary configuration. Media operations will fail.');
      console.error('Make sure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set in your environment.');
    } else {
      console.log('✓ Cloudinary configuration verified');
    }
  }
  /**
   * Upload a buffer to Cloudinary
   * @param {Buffer} fileBuffer - The file buffer to upload
   * @param {String} fileType - The type of file ('image' or 'video')
   * @param {String} projectId - The project ID to associate with the upload
   * @returns {Promise} The Cloudinary upload result
   */
  async uploadBuffer(fileBuffer, fileType, projectId) {
    return new Promise((resolve, reject) => {
      // Validate inputs
      if (!fileBuffer || fileBuffer.length === 0) {
        return reject(new Error('No file data provided for upload'));
      }
      
      // Determine file size in MB
      const fileSizeMB = fileBuffer.length / (1024 * 1024);
      const maxSizeMB = fileType === 'image' ? 5 : 50; // 5MB for images, 50MB for videos
      
      // Check file size
      if (fileSizeMB > maxSizeMB) {
        return reject(new Error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum allowed size of ${maxSizeMB}MB`));
      }
      
      // Create upload options with better defaults for web delivery
      const uploadOptions = {
        resource_type: fileType === 'image' ? 'image' : 'video',
        folder: `${env.CLOUDINARY.FOLDER}/projects/${projectId}`,
        public_id: `${Date.now()}`, // Unique identifier
        overwrite: true,
        // Add CORS settings to ensure videos can be played cross-origin
        access_mode: 'public',
        // Add better quality settings for web delivery
        quality: 'auto', 
        fetch_format: 'auto'
      };
      
      // Add video-specific options
      if (fileType === 'video') {
        // Enhanced video settings for better web delivery
        uploadOptions.eager = [
          // Use basic video optimization instead of streaming profile
          { quality: 'auto', format: 'mp4' }
        ];
        uploadOptions.eager_async = true;
        // Add automatic audio normalization
        uploadOptions.audio_codec = 'aac';
        // Add accessibility features
        uploadOptions.resource_type = 'video';
      }

      // Create upload stream to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            const errorDetails = this.handleCloudinaryError(error, 'upload');
            return reject(new Error(JSON.stringify(errorDetails)));
          }
          resolve(result);
        }
      );
      
      try {
        // Convert buffer to stream and pipe to Cloudinary
        const stream = new Readable();
        stream.push(fileBuffer);
        stream.push(null);
        stream.pipe(uploadStream);
      } catch (streamError) {
        reject(new Error(`Error processing file stream: ${streamError.message}`));
      }
    });
  }

  /**
   * Handle Cloudinary errors with detailed information
   * @param {Error} error - The error object from Cloudinary
   * @param {String} operation - The operation that failed (upload, delete, etc.)
   * @returns {Object} Standardized error object
   */
  handleCloudinaryError(error, operation) {
    console.error(`Cloudinary ${operation} error:`, error);
    
    // Extract error details from Cloudinary error format
    const errorDetails = {
      message: error.message || `Cloudinary ${operation} failed`,
      code: error.http_code || error.code || 500,
      operation: operation,
      timestamp: new Date().toISOString()
    };
    
    // Add specific error handling based on operation type
    if (operation === 'upload') {
      // Handle upload-specific errors
      if (error.message?.includes('resource_type')) {
        errorDetails.message = 'Invalid file type for upload';
        errorDetails.suggestion = 'Check that you are using the correct resource_type (image/video)';
      } else if (error.http_code === 401) {
        errorDetails.message = 'Unauthorized: Invalid Cloudinary credentials';
        errorDetails.suggestion = 'Verify your Cloudinary API key and secret';
      } else if (error.message?.includes('rate limit')) {
        errorDetails.message = 'Rate limit exceeded on Cloudinary';
        errorDetails.suggestion = 'Try again later or check your plan limits';
      }
    } else if (operation === 'delete') {
      // Handle delete-specific errors
      if (error.message?.includes('not found')) {
        errorDetails.message = 'File not found in Cloudinary';
        errorDetails.suggestion = 'The file may have already been deleted';
      }
    }
    
    // Log full error for debugging
    console.error('Cloudinary error details:', errorDetails);
    
    return errorDetails;
  }

  /**
   * Delete a file from Cloudinary
   * @param {String} publicId - The Cloudinary public_id of the file to delete
   * @param {String} resourceType - The resource type ('image' or 'video')
   * @returns {Promise} The Cloudinary deletion result
   */
  async deleteFile(publicId, resourceType = 'image') {
    try {
      if (!publicId) {
        throw new Error('No publicId provided for deletion');
      }
      
      return await cloudinary.uploader.destroy(publicId, { 
        resource_type: resourceType
      });
    } catch (error) {
      const errorDetails = this.handleCloudinaryError(error, 'delete');
      throw new Error(JSON.stringify(errorDetails));
    }
  }

  /**
   * Create a Cloudinary URL with transformations
   * @param {String} publicId - The Cloudinary public_id
   * @param {Object} options - Transformation options
   * @returns {String} The transformed URL
   */
  getTransformedUrl(publicId, options = {}) {
    if (!publicId) return null;
    
    try {
      return cloudinary.url(publicId, options);
    } catch (error) {
      console.error('Error creating transformed URL:', error);
      return null;
    }
  }
  
  /**
   * Generate responsive image sources for different viewports
   * @param {String} publicId - The Cloudinary public_id
   * @returns {Object} Object containing different size URLs
   */
  getResponsiveImageSources(publicId) {
    if (!publicId) return null;
    
    try {
      return {
        thumbnail: this.getTransformedUrl(publicId, { 
          width: 150, 
          height: 150, 
          crop: 'fill', 
          quality: 'auto', 
          fetch_format: 'auto' 
        }),
        small: this.getTransformedUrl(publicId, { 
          width: 300, 
          height: 200, 
          crop: 'fill', 
          quality: 'auto', 
          fetch_format: 'auto' 
        }),
        medium: this.getTransformedUrl(publicId, { 
          width: 600, 
          height: 400, 
          crop: 'fill', 
          quality: 'auto', 
          fetch_format: 'auto' 
        }),
        large: this.getTransformedUrl(publicId, { 
          width: 1200, 
          height: 800, 
          crop: 'fill', 
          quality: 'auto', 
          fetch_format: 'auto' 
        })
      };
    } catch (error) {
      console.error('Error generating responsive image sources:', error);
      return null;
    }
  }
  
  /**
   * Get a video thumbnail from Cloudinary
   * @param {String} publicId - The Cloudinary public_id of the video
   * @param {Object} options - Thumbnail options
   * @returns {String} - Thumbnail URL
   */
  getVideoThumbnail(publicId, options = {}) {
    if (!publicId) return null;
    
    try {
      const defaultOptions = {
        width: 640,
        height: 360,
        crop: 'fill',
        quality: 'auto',
        format: 'jpg'
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      // Add video-specific transformation to extract thumbnail
      mergedOptions.resource_type = 'video';
      mergedOptions.format = 'jpg';
      
      return this.getTransformedUrl(publicId, mergedOptions);
    } catch (error) {
      console.error('Error generating video thumbnail:', error);
      return null;
    }
  }
}

module.exports = new CloudinaryService();
