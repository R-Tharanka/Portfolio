import axios from 'axios';
import { Project } from '../types';
import { ApiResponse } from './api';
import logger from '../utils/logger';

// Function to ensure we always get the fresh API URL
const getApiBaseUrl = () => {
    // Get fresh API URL and log it for debugging
    const apiUrl = import.meta.env.VITE_API_URL;
    logger.log('Projects service using API URL:', apiUrl);
    return apiUrl;
};

// Create a dedicated service just for projects to avoid conflicts
const projectsApi = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
    // Add timestamp to prevent browser caching
    params: {
        _t: Date.now()
    }
});

// Debug interceptor
projectsApi.interceptors.request.use(
    (config) => {
        // Add timestamp parameter to prevent caching
        config.params = {
            ...config.params,
            _t: Date.now()
        };
        logger.log('⚡ PROJECT SERVICE REQUEST ⚡');
        logger.log(`Method: ${config.method?.toUpperCase()}`);
        logger.log(`URL: ${config.baseURL}${config.url}`);
        logger.log('Headers:', config.headers);
        logger.log('Data:', config.data);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

projectsApi.interceptors.response.use(
    (response) => {
        logger.log('✅ PROJECT SERVICE RESPONSE ✅');
        logger.log('Status:', response.status);
        logger.log('Data:', response.data);
        return response;
    },
    (error) => {
        logger.error('❌ PROJECT SERVICE ERROR ❌');
        logger.error('Error:', error);
        logger.error('Response:', error.response?.data);
        return Promise.reject(error);
    }
);

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

// Delete project function with improved error handling
export const deleteProjectFixed = async (
    projectId: string,
    token: string
): Promise<ApiResponse<{ msg: string }>> => {
    try {
        if (!projectId) {
            console.error('Invalid project ID for deletion:', projectId);
            return {
                data: { msg: '' },
                error: 'Invalid project ID. Please try again or refresh the page.'
            };
        }

        // Ensure projectId is a string and trimmed
        const cleanProjectId = String(projectId).trim();

        if (!cleanProjectId) {
            console.error('Project ID is empty after cleaning:', projectId);
            return {
                data: { msg: '' },
                error: 'Invalid project ID format. Please try again or refresh the page.'
            };
        }

        // Validate MongoDB ObjectId format
        if (!isValidObjectId(cleanProjectId)) {
            console.error(`Project ID is not a valid MongoDB ObjectId: ${cleanProjectId}`);
            return {
                data: { msg: '' },
                error: 'Invalid project ID format. Please try again.'
            };
        }

        logger.log(`▶️ Using dedicated service to delete project ${cleanProjectId}`);

        const response = await projectsApi.delete(`/projects/${cleanProjectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return { data: response.data };
    } catch (error: any) {
        console.error('Error deleting project with fixed service:', error);

        // Provide more specific error message based on error status
        let errorMsg = 'Failed to delete project';
        if (error.response?.status === 500) {
            errorMsg = 'Server error occurred while deleting project. Please try again later.';
        } else if (error.response?.status === 404) {
            errorMsg = 'Project not found or already deleted.';
        } else if (error.response?.status === 401) {
            errorMsg = 'Authentication error. Please log in again.';
        }

        return {
            data: { msg: '' },
            error: error.response?.data?.msg || errorMsg
        };
    }
};

// Update project function with improved error handling
export const updateProjectFixed = async (
    projectId: string,
    projectData: Omit<Project, 'id'>,
    token: string
): Promise<ApiResponse<Project>> => {
    try {
        if (!projectId) {
            console.error('Invalid project ID for update:', projectId);
            return {
                data: {} as Project,
                error: 'Invalid project ID. Please try again or refresh the page.'
            };
        }

        // Ensure projectId is a string and trimmed
        const cleanProjectId = String(projectId).trim();

        if (!cleanProjectId) {
            console.error('Project ID is empty after cleaning:', projectId);
            return {
                data: {} as Project,
                error: 'Invalid project ID format. Please try again or refresh the page.'
            };
        }

        // Validate MongoDB ObjectId format
        if (!isValidObjectId(cleanProjectId)) {
            console.error(`Project ID is not a valid MongoDB ObjectId: ${cleanProjectId}`);
            return {
                data: {} as Project,
                error: 'Invalid project ID format. Please try again.'
            };
        }

        console.log(`▶️ Using dedicated service to update project ${cleanProjectId}`);
        console.log('Project data being sent:', projectData);

        const response = await projectsApi.put(`/projects/${cleanProjectId}`, projectData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Ensure the returned data has the id field properly mapped
        const projectWithId = {
            ...response.data,
            id: response.data.id || response.data._id
        };

        return { data: projectWithId };
    } catch (error: any) {
        console.error('Error updating project with fixed service:', error);

        // Provide more specific error message based on error status
        let errorMsg = 'Failed to update project';
        if (error.response?.status === 500) {
            errorMsg = 'Server error occurred while updating project. Please try again later.';
        } else if (error.response?.status === 404) {
            errorMsg = 'Project not found.';
        } else if (error.response?.status === 401) {
            errorMsg = 'Authentication error. Please log in again.';
        }

        return {
            data: {} as Project,
            error: error.response?.data?.msg || errorMsg
        };
    }
};
