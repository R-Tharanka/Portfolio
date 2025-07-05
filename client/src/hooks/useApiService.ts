import { useApi } from '../context/ApiContext';
import { Skill, Project, Education, ContactFormData, SkillCategory } from '../types';
import logger from '../utils/logger';

export interface ApiResponse<T> {
    data: T;
    error?: string;
    isOffline?: boolean;
}

// Error messages for when API is unreachable
const errorMessages = {
    skills: "Unable to load skills data. The server is currently unavailable.",
    projects: "Unable to load project data. The server is currently unavailable.",
    education: "Unable to load education data. The server is currently unavailable.",
    contact: "Unable to send message. The server is currently unavailable."
};

// Custom hook for API operations with fallback handling
export function useApiService() {
    const { axiosInstance, isApiOnline } = useApi();

    // SKILLS API
    const getSkills = async (): Promise<ApiResponse<Skill[]>> => {
        try {
            if (!isApiOnline) {
                logger.warn('API offline - skills data unavailable');
                return {
                    data: [],
                    error: errorMessages.skills,
                    isOffline: true
                };
            }

            const response = await axiosInstance.get('/skills');
            return { data: response.data };
        } catch (error: any) {
            logger.error('Error fetching skills:', error);
            return {
                data: [],
                error: errorMessages.skills,
                isOffline: true
            };
        }
    };

    // PROJECTS API
    const getProjects = async (): Promise<ApiResponse<Project[]>> => {
        try {
            if (!isApiOnline) {
                logger.warn('API offline - projects data unavailable');
                return {
                    data: [],
                    error: errorMessages.projects,
                    isOffline: true
                };
            }

            const response = await axiosInstance.get('/projects');

            // Ensure each project has a proper id field
            const projectsWithIds = response.data.map((item: any) => ({
                ...item,
                id: item.id || item._id
            }));

            return { data: projectsWithIds };
        } catch (error: any) {
            logger.error('Error fetching projects:', error);
            return {
                data: [],
                error: errorMessages.projects,
                isOffline: true
            };
        }
    };

    const getFeaturedProjects = async (): Promise<ApiResponse<Project[]>> => {
        try {
            if (!isApiOnline) {
                logger.warn('API offline - featured projects data unavailable');
                return {
                    data: [],
                    error: errorMessages.projects,
                    isOffline: true
                };
            }

            const response = await axiosInstance.get('/projects/featured');
            return { data: response.data };
        } catch (error: any) {
            logger.error('Error fetching featured projects:', error);
            return {
                data: [],
                error: errorMessages.projects,
                isOffline: true
            };
        }
    };

    // EDUCATION API
    const getEducation = async (): Promise<ApiResponse<Education[]>> => {
        try {
            if (!isApiOnline) {
                logger.warn('API offline - education data unavailable');
                return {
                    data: [],
                    error: errorMessages.education,
                    isOffline: true
                };
            }

            const response = await axiosInstance.get('/education');

            // Ensure each education item has a proper id field
            const educationWithIds = response.data.map((item: any) => ({
                ...item,
                id: item.id || item._id
            }));

            return { data: educationWithIds };
        } catch (error: any) {
            logger.error('Error fetching education:', error);
            return {
                data: [],
                error: errorMessages.education,
                isOffline: true
            };
        }
    };

    // CONTACT API
    const submitContactForm = async (formData: ContactFormData): Promise<ApiResponse<any>> => {
        try {
            if (!isApiOnline) {
                logger.warn('API offline - cannot submit contact form');
                return {
                    data: null,
                    error: errorMessages.contact,
                    isOffline: true
                };
            }

            const response = await axiosInstance.post('/contact', formData);
            return { data: response.data };
        } catch (error: any) {
            logger.error('Error submitting contact form:', error);
            return {
                data: null,
                error: errorMessages.contact,
                isOffline: !error.response
            };
        }
    };

    return {
        getSkills,
        getProjects,
        getFeaturedProjects,
        getEducation,
        submitContactForm
    };
}

export default useApiService;
