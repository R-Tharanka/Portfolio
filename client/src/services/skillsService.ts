import axios from 'axios';
import { Skill } from '../types';
import { ApiResponse } from './api';

// Create a dedicated service just for skills to avoid conflicts
const skillsApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Debug interceptor
skillsApi.interceptors.request.use(
    (config) => {
        console.log('⚡ SKILL SERVICE REQUEST ⚡');
        console.log(`Method: ${config.method?.toUpperCase()}`);
        console.log(`URL: ${config.baseURL}${config.url}`);
        console.log('Headers:', config.headers);
        console.log('Data:', config.data);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

skillsApi.interceptors.response.use(
    (response) => {
        console.log('✅ SKILL SERVICE RESPONSE ✅');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
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

        console.log(`▶️ Using dedicated service to delete skill ${skillId}`);
        
        const response = await skillsApi.delete(`/skills/${skillId}`, {
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
