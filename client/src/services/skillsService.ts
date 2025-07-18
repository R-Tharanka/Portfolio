import axios from 'axios';
import { Skill } from '../types';
import { ApiResponse } from './api';
import logger from '../utils/logger';

// Function to ensure we always get the fresh API URL
const getApiBaseUrl = () => {
    // Get fresh API URL and log it for debugging
    const apiUrl = import.meta.env.VITE_API_URL;
    logger.log('Skills service using API URL:', apiUrl);
    return apiUrl;
};

// Create a dedicated service just for skills to avoid conflicts
const skillsApi = axios.create({
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
skillsApi.interceptors.request.use(
    (config) => {
        // Add timestamp parameter to prevent caching
        config.params = {
            ...config.params,
            _t: Date.now()
        };
        logger.log('⚡ SKILL SERVICE REQUEST ⚡');
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

skillsApi.interceptors.response.use(
    (response) => {
        logger.log('✅ SKILL SERVICE RESPONSE ✅');
        logger.log('Status:', response.status);
        logger.log('Data:', response.data);
        return response;
    },
    (error) => {
        console.error('❌ SKILL SERVICE ERROR ❌');
        console.error('Error:', error);
        console.error('Response:', error.response?.data);
        return Promise.reject(error);
    }
);

// Update skill function that explicitly uses axios PUT
export const updateSkillFixed = async (
    skillId: string,
    skillData: Omit<Skill, 'id'>,
    token: string
): Promise<ApiResponse<Skill>> => {
    try {
        if (!skillId) {
            console.error('Invalid skill ID:', skillId);
            return {
                data: {} as Skill,
                error: 'Invalid skill ID. Please try again or refresh the page.'
            };
        }

        console.log(`▶️ Using dedicated service to update skill ${skillId}`);
        // Make sure it's a PUT request
        const response = await skillsApi.put(`/skills/${skillId}`, skillData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return { data: response.data };
    } catch (error: any) {
        console.error('Error updating skill with fixed service:', error);
        return {
            data: {} as Skill,
            error: error.response?.data?.msg || 'Failed to update skill'
        };
    }
};

// Delete skill function with improved error handling
export const deleteSkillFixed = async (
    skillId: string,
    token: string
): Promise<ApiResponse<{ msg: string }>> => {
    try {
        if (!skillId) {
            console.error('Invalid skill ID for deletion:', skillId);
            return {
                data: { msg: '' },
                error: 'Invalid skill ID. Please try again or refresh the page.'
            };
        }

        // Ensure skillId is a string and trimmed
        const cleanSkillId = String(skillId).trim();

        if (!cleanSkillId) {
            console.error('Skill ID is empty after cleaning:', skillId);
            return {
                data: { msg: '' },
                error: 'Invalid skill ID format. Please try again or refresh the page.'
            };
        }

        console.log(`▶️ Using dedicated service to delete skill ${cleanSkillId}`);
        const response = await skillsApi.delete(`/skills/${cleanSkillId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return { data: response.data };
    } catch (error: any) {
        console.error('Error deleting skill with fixed service:', error);
        return {
            data: { msg: '' },
            error: error.response?.data?.msg || 'Failed to delete skill'
        };
    }
};
