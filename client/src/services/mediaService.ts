import api from './api';
import { ProjectMedia } from '../types';

/**
 * Upload media files for a project using Cloudinary
 * @param projectId The project ID to upload media for
 * @param files The files to upload
 * @param token The auth token
 * @returns Response with array of created media items
 */
export const uploadProjectMedia = async (
  projectId: string,
  files: { 
    image?: File[], 
    video?: File[] 
  },
  token: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; mediaItems: ProjectMedia[]; error?: string }> => {
  try {
    // Create a form data object
    const formData = new FormData();
    
    // Add image files
    if (files.image && files.image.length > 0) {
      files.image.forEach(file => {
        formData.append('image', file);
      });
    }
    
    // Add video files
    if (files.video && files.video.length > 0) {
      files.video.forEach(file => {
        formData.append('video', file);
      });
    }
    
    // Setup config with token and progress tracking
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          // Calculate the upload progress percentage
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    };
    
    // Make API request - Cloudinary handling happens server-side
    const response = await api.post(`/uploads/projects/${projectId}`, formData, config);
    
    return {
      success: true,
      mediaItems: response.data.mediaItems
    };
  } catch (error: any) {
    console.error('Error uploading media to Cloudinary:', error);
    
    let errorMessage = 'Failed to upload media files';
    
    // Handle specific error messages from API
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || error.response.data.error || errorMessage;
    }
    
    return {
      success: false,
      mediaItems: [],
      error: errorMessage
    };
  }
};

/**
 * Delete a media file from a project using Cloudinary
 * @param projectId The project ID
 * @param mediaItem The media item to delete (needs publicId for Cloudinary deletion)
 * @param token The auth token
 * @returns Success status
 */
export const deleteProjectMedia = async (
  projectId: string,
  mediaItem: ProjectMedia,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // We need the publicId for Cloudinary deletion
    if (!mediaItem.publicId) {
      console.error('Cannot delete media: missing publicId');
      return {
        success: false,
        error: 'Cannot delete media: missing identification'
      };
    }
    
    // Setup config with token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    // Make API request to delete from Cloudinary
    // The API expects the full Cloudinary publicId, not just the filename
    // and no need to include projectId in the URL since it's part of the publicId
    await api.delete(`/uploads/projects/${encodeURIComponent(mediaItem.publicId)}`, config);
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error deleting media file:', error);
    
    let errorMessage = 'Failed to delete media file';
    
    // Handle specific error messages from API
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || error.response.data.error || errorMessage;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};
