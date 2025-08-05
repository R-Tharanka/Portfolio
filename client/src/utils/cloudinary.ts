/**
 * Cloudinary URL Transformations Helper
 * This utility provides functions for working with Cloudinary URLs.
 */

// Constants for default sizes
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 150, crop: 'fill' },
  SMALL: { width: 300, height: 200, crop: 'fill' },
  MEDIUM: { width: 600, height: 400, crop: 'fill' },
  LARGE: { width: 1200, height: 800, crop: 'fill' },
  HERO: { width: 1920, height: 1080, crop: 'fill' }
};

// Constants for video transformations
export const VIDEO_TRANSFORMS = {
  PREVIEW: { streaming_profile: 'hd', format: 'mp4', quality: 'auto:good' },
  HD: { streaming_profile: 'hd', format: 'mp4', quality: 'auto:best' },
  THUMB: { width: 640, height: 360, crop: 'fill', format: 'jpg' }
};

/**
 * Get a Cloudinary transformed URL for an image
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export const getTransformedImageUrl = (url: string, options: any): string => {
  if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
    // Return original URL if not a Cloudinary URL
    return url;
  }

  // Construct the transformation string
  const transformations = [];

  // Add width if specified
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }

  // Add height if specified
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }

  // Add crop mode
  transformations.push(`c_${options.crop || 'fill'}`);

  // Add quality
  transformations.push(`q_${options.quality || 'auto'}`);

  // Add format if specified
  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  // Put it all together
  const transformString = transformations.join(',');
  
  // Insert transformation into URL
  const parts = url.split('/upload/');
  return `${parts[0]}/upload/${transformString}/${parts[1]}`;
};

/**
 * Get a video thumbnail from a Cloudinary video URL
 * @param {string} videoUrl - Cloudinary video URL
 * @param {Object} options - Thumbnail options
 * @returns {string} - Thumbnail URL
 */
export const getVideoThumbnail = (videoUrl: string, options: any = VIDEO_TRANSFORMS.THUMB): string => {
  if (!videoUrl || !videoUrl.includes('cloudinary.com') || !videoUrl.includes('/upload/')) {
    return videoUrl;
  }

  // Construct thumbnail transformation
  const transformations = [
    `w_${options.width || 640}`,
    `h_${options.height || 360}`,
    `c_${options.crop || 'fill'}`,
    'q_auto',
    `f_${options.format || 'jpg'}`
  ];

  const transformString = transformations.join(',');
  
  // Insert transformation into URL and replace video extension
  const parts = videoUrl.split('/upload/');
  // Remove video extension and replace with image extension
  const path = parts[1].replace(/\.(mp4|webm|mov|ogv)($|\?)/, '.jpg$2');
  
  return `${parts[0]}/upload/${transformString}/${path}`;
};

/**
 * Check if a URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url?.includes('cloudinary.com') || false;
};

/**
 * Get public ID from a Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) return null;
  
  try {
    // Extract the path after /upload/
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    
    // Get everything after /upload/ but before any query string
    const afterUpload = url.substring(uploadIndex + 8);
    const questionMarkIndex = afterUpload.indexOf('?');
    
    const path = questionMarkIndex !== -1 
      ? afterUpload.substring(0, questionMarkIndex) 
      : afterUpload;
    
    // Remove the file extension
    const lastDotIndex = path.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 
      ? path.substring(0, lastDotIndex) 
      : path;
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};
