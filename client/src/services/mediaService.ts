import api from './api';
import { ProjectMedia } from '../types';

/**
 * Upload media files for a project
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
  token: string
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
    
    // Setup config with token
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    
    // Make API request
    const response = await api.post(`/uploads/projects/${projectId}`, formData, config);
    
    return {
      success: true,
      mediaItems: response.data.mediaItems
    };
  } catch (error: any) {
    console.error('Error uploading media:', error);
    
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
 * Delete a media file from a project
 * @param projectId The project ID
 * @param filename The filename to delete
 * @param token The auth token
 * @returns Success status
 */
export const deleteProjectMedia = async (
  projectId: string,
  filename: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get filename from URL if full URL was provided
    const filenameOnly = filename.split('/').pop() || filename;
    
    // Setup config with token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    // Make API request
    await api.delete(`/uploads/projects/${projectId}/${filenameOnly}`, config);
    
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
