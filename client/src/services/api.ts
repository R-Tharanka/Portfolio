import axios, { AxiosError } from 'axios';
import { isTokenExpired } from '../utils/auth';
import logger from '../utils/logger';

// Create an axios instance with base URL and improved configuration
// Force the API URL to be dynamically loaded on each page load to prevent caching issues
const getApiBaseUrl = () => {
  // Add a random query parameter to the import.meta.env access to prevent browser caching
  const apiUrl = import.meta.env.VITE_API_URL;
  logger.log('Using API URL:', apiUrl);
  return apiUrl;
};

// Define fallback data to use when API is unreachable
const fallbackData = {
  skills: [
    { 
      id: 'fallback-1', 
      name: 'Frontend Development', 
      proficiency: 90, 
      icon: 'react', 
      category: 'Frontend' as SkillCategory 
    },
    { 
      id: 'fallback-2', 
      name: 'Backend Development', 
      proficiency: 85, 
      icon: 'node-js', 
      category: 'Backend' as SkillCategory 
    },
    // Add more fallback skills as needed
  ],
  projects: [
    { 
      id: 'fallback-1', 
      title: 'Portfolio Website', 
      description: 'Currently having trouble connecting to the backend server. Please check back later.',
      technologies: ['React', 'Node.js'],
      timeline: {
        start: '2023-01-01',
        end: null
      },
      imageUrl: '/assets/img/fallback-project.png',
      tags: ['Frontend', 'Backend'],
      featured: true
    }
    // Add more fallback projects if needed
  ],
  education: [
    { 
      id: 'fallback-1', 
      institution: 'Sample University',
      title: 'Computer Science Degree', 
      description: 'Loading education data failed. Please check back later.',
      skills: ['Programming', 'Problem Solving'],
      timeline: {
        start: '2018-01-01',
        end: '2022-01-01'
      }
    }
    // Add more fallback education items if needed
  ]
};

const api = axios.create({
  // Use a function to ensure the baseURL is evaluated fresh each time
  baseURL: getApiBaseUrl(),
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timestamp to prevent browser caching
  params: {
    _t: Date.now()
  }
});

// Central error event dispatcher for component-level error handling
export const apiErrorEvents = {
  dispatch: (errorType: string, errorDetails: any) => {
    const event = new CustomEvent('api:error', {
      detail: { type: errorType, details: errorDetails }
    });
    window.dispatchEvent(event);
    logger.error(`API Error [${errorType}]:`, errorDetails);
  }
};

// Single consolidated request interceptor for debugging, authentication and special headers
api.interceptors.request.use(
  (config) => {
    // Force refresh the baseURL on each request to prevent stale URLs
    config.baseURL = getApiBaseUrl();

    // Add timestamp parameter to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    };

    // Skills update debug log
    if (config.url?.startsWith('/skills/') && config.method === 'put') {
      logger.log('🔄 Skill update request detected');
    }

    // Authentication check
    const authHeader = config.headers?.Authorization as string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      // Verify token is not expired
      if (isTokenExpired(token)) {
        // Token expired, reject request and force logout
        logger.warn('Token expired, request blocked');
        logger.log('Token expiration details:', { token });

        // Clear expired token from localStorage
        localStorage.removeItem('adminToken');

        // Dispatch a custom event to notify app about token expiration
        const tokenExpiredEvent = new CustomEvent('auth:tokenExpired');
        window.dispatchEvent(tokenExpiredEvent);

        // Return a rejected promise to prevent the request
        return Promise.reject(new Error('Authentication token expired'));
      }
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    apiErrorEvents.dispatch('request', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for logging and error handling
api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError) => {
  const { response, message } = error;    // Network errors (no response from server - server down, CORS issues, etc.)
  if (!response) {
    // Check if it's likely a CORS issue
    const isCorsError = message.includes('Network Error') || 
                        message.includes('CORS') || 
                        message.toLowerCase().includes('cross-origin');
    
    // Create appropriate error info based on error type
    const errorInfo = {
      type: 'network',
      subtype: isCorsError ? 'cors' : 'connection',
      message: isCorsError 
        ? 'Server connectivity issue detected. The API server may be down or unreachable.'
        : 'Unable to connect to the server. Please check your internet connection or try again later.',
      originalError: message
    };
    
    // Dispatch event for ApiOfflineNotice to handle - no toast needed
    apiErrorEvents.dispatch('network', errorInfo);
    
    // Just log to console for debugging - no toast notification
    console.warn('API Connection Error: Server is unreachable. Using fallback data.');
  } 
  // Server responded with an error status
  else {
    const status = response.status;
    const errorData = response.data as any;
    
    // Authentication errors
    if (status === 401) {
      console.error('Authentication error:', errorData?.message || 'Unauthorized access');
      
      // Clear token from localStorage
      localStorage.removeItem('adminToken');
      
      // Dispatch a custom event to notify app about token expiration
      const tokenExpiredEvent = new CustomEvent('auth:tokenExpired');
      window.dispatchEvent(tokenExpiredEvent);
      
      apiErrorEvents.dispatch('auth', { status, message: 'Authentication failed. Please login again.' });
    } 
    // Server errors
    else if (status >= 500) {
      console.error('Server Error:', errorData?.message || 'Unknown server error');
      apiErrorEvents.dispatch('server', { 
        status, 
        message: 'The server encountered an error. Please try again later.' 
      });
      
      // Show a toast message for server errors
      showErrorToast('Server Error', 'The server encountered an error. Please try again later.');
    }
    // Other client errors
    else if (status >= 400) {
      console.error('Client Error:', errorData?.message || 'Unknown client error');
      apiErrorEvents.dispatch('client', { 
        status, 
        message: errorData?.message || 'Something went wrong with your request.' 
      });
    }
  }
  
  return Promise.reject(error);
});

// Simple toast error message function
// This should be replaced with your actual toast notification system
function showErrorToast(title: string, message: string) {
  // Check if we have a toast service to use
  const event = new CustomEvent('toast:error', {
    detail: { title, message }
  });
  window.dispatchEvent(event);
  
  // Log to console in case no toast handler is set up
  console.error(`${title}: ${message}`);
}

// Helper function to handle API errors with fallback data
const handleApiError = <T>(error: any, endpoint: string, fallback?: T): ApiResponse<T> => {
  const errorMessage = error.response?.data?.message ||
    error.response?.data?.msg ||
    error.message ||
    `Failed to fetch data from ${endpoint}`;

  console.error(`Error with ${endpoint}:`, error);
  console.error('Detailed error:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    message: errorMessage,
    url: error.config?.url
  });

  return {
    data: fallback as T,
    error: errorMessage
  };
};

// Types from our application
import { Skill, Project, Education, ContactFormData, SkillCategory } from '../types';

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ******************* SKILLS API *******************
export const getSkills = async (): Promise<ApiResponse<Skill[]>> => {
  try {
    // Try to connect to the health endpoint first to check connectivity
    await api.get('/health').catch(() => console.log('Health check failed, continuing anyway'));

    const response = await api.get('/skills');
    return { data: response.data };
  } catch (error: any) {
    return handleApiError<Skill[]>(error, 'skills', fallbackData.skills);
  }
};

// ******************* PROJECTS API *******************
export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  try {
    // Try to connect to the health endpoint first to check connectivity
    await api.get('/health').catch(() => console.log('Health check failed, continuing anyway'));

    const response = await api.get('/projects');

    // Ensure each project has a proper id field
    // MongoDB returns _id, we map it to id for consistency
    const projectsWithIds = response.data.map((item: any) => {
      return {
        ...item,
        id: item.id || item._id
      };
    });

    return { data: projectsWithIds };
  } catch (error: any) {
    return handleApiError<Project[]>(error, 'projects', fallbackData.projects);
  }
};

export const getFeaturedProjects = async (): Promise<ApiResponse<Project[]>> => {
  try {
    const response = await api.get('/projects/featured');
    return { data: response.data };
  } catch (error: any) {
    const featuredFallback = fallbackData.projects.filter(project => project.featured);
    return handleApiError<Project[]>(error, 'featured projects', featuredFallback);
  }
};

// ******************* EDUCATION API *******************
export const getEducation = async (): Promise<ApiResponse<Education[]>> => {
  try {
    const response = await api.get('/education');

    // Ensure each education item has a proper id property 
    // MongoDB returns _id, we need to map it to id if it doesn't exist
    const educationWithIds = response.data.map((item: any) => {
      // Make sure we use a consistent ID field, preferring id but falling back to _id
      const id = item.id || item._id;
      logger.log(`Processing education item with raw ID: ${item._id || 'undefined'}, mapped ID: ${id}`);

      return {
        ...item,
        id
      };
    });

    logger.log('Education items with mapped IDs:', educationWithIds);

    return { data: educationWithIds };
  } catch (error: any) {
    return handleApiError<Education[]>(error, 'education', fallbackData.education);
  }
};

// ******************* CONTACT API *******************
export const submitContactForm = async (formData: ContactFormData): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post('/contact', formData);
    return { data: response.data };
  } catch (error: any) {
    // Special handling for contact form submission
    const isNetworkError = !error.response;
    const errorMsg = isNetworkError 
      ? "We couldn't reach our servers. Please try again later or contact directly via email."
      : error.response?.data?.msg || 'Failed to submit contact form';
    
    // Dispatch event for potential offline message saving
    if (isNetworkError) {
      const event = new CustomEvent('contact:offline', { detail: formData });
      window.dispatchEvent(event);
    }
    
    return {
      data: null,
      error: errorMsg
    };
  }
};

// ******************* ADMIN AUTH API *******************
export const login = async (credentials: { username: string; password: string }): Promise<ApiResponse<{ token: string }>> => {
  try {
    const response = await api.post('/auth/login', credentials);
    return { data: response.data };
  } catch (error: any) {
    console.error('Error during login:', error);
    return {
      data: { token: '' },
      error: error.response?.data?.msg || 'Login failed. Check your credentials.'
    };
  }
};

export const updateCredentials = async (data: {
  currentPassword: string;
  newUsername?: string;
  newPassword?: string
}, token: string): Promise<ApiResponse<{ token: string; msg: string }>> => {
  try {
    const response = await api.put('/auth/update-credentials', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error updating credentials:', error);
    return {
      data: { token: '', msg: '' },
      error: error.response?.data?.msg || 'Failed to update credentials'
    };
  }
};

// ******************* ADMIN SKILLS API *******************
export const createSkill = async (skillData: Omit<Skill, 'id'>, token: string): Promise<ApiResponse<Skill>> => {
  try {
    const response = await api.post('/skills', skillData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error creating skill:', error);
    return {
      data: {} as Skill,
      error: error.response?.data?.msg || 'Failed to create skill'
    };
  }
};

export const updateSkill = async (skillId: string, skillData: Omit<Skill, 'id'>, token: string): Promise<ApiResponse<Skill>> => {
  try {
    // Check if skillId is valid
    if (!skillId) {
      console.error('Invalid skill ID:', skillId);
      return {
        data: {} as Skill,
        error: 'Invalid skill ID. Please try again or refresh the page.'
      };
    }

    // MongoDB might return _id instead of id, so handle both
    // This shouldn't happen due to our fixes above, but let's be extra safe
    const actualId = skillId.toString();

    // Log what we're sending for debugging
    console.log(`Updating skill ${actualId} with data:`, {
      ...skillData,
      icon: skillData.icon.length > 50
        ? `${skillData.icon.substring(0, 50)}... (truncated)`
        : skillData.icon
    });    // Explicitly use PUT method to update
    console.log(`SKILL UPDATE: Making PUT request to /skills/${actualId}`);
    console.log('Request headers:', { 'Authorization': `Bearer ${token ? token.substring(0, 15) + '...' : 'undefined'}` });
    console.log('Request data:', skillData);

    const response = await api.put(`/skills/${actualId}`, skillData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error updating skill:', error);
    return {
      data: {} as Skill,
      error: error.response?.data?.msg || 'Failed to update skill'
    };
  }
};

export const deleteSkill = async (skillId: string, token: string): Promise<ApiResponse<{ msg: string }>> => {
  try {
    const response = await api.delete(`/skills/${skillId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error deleting skill:', error);
    return {
      data: { msg: '' },
      error: error.response?.data?.msg || 'Failed to delete skill'
    };
  }
};

// ******************* ADMIN PROJECTS API *******************
export const createProject = async (projectData: Omit<Project, 'id'>, token: string): Promise<ApiResponse<Project>> => {
  try {
    const response = await api.post('/projects', projectData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return {
      data: {} as Project,
      error: error.response?.data?.msg || 'Failed to create project'
    };
  }
};

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const updateProject = async (projectId: string, projectData: Omit<Project, 'id'>, token: string): Promise<ApiResponse<Project>> => {
  try {
    // Check if projectId is valid
    if (!projectId || projectId === 'undefined') {
      console.error('Invalid project ID:', projectId);
      return {
        data: {} as Project,
        error: 'Invalid project ID. Please try again or refresh the page.'
      };
    }

    // Check if ID format is valid for MongoDB
    if (!isValidObjectId(projectId)) {
      console.error(`Invalid ObjectId format: ${projectId}`);
      return {
        data: {} as Project,
        error: 'Invalid ID format. Please try again or refresh the page.'
      };
    }

    // Enhanced debugging
    console.log(`Updating project with ID: ${projectId}`);
    console.log('Project data:', JSON.stringify(projectData));
    console.log('API token present:', !!token);

    // Log the full request URL for debugging
    const requestUrl = `/projects/${projectId}`;
    console.log(`Making PUT request to: ${requestUrl}`);

    const response = await api.put(requestUrl, projectData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Log successful response
    console.log('Project update successful, response:', response.data);

    // Ensure the returned data has the id field properly mapped
    const projectWithId = {
      ...response.data,
      id: response.data.id || response.data._id
    };

    return { data: projectWithId };
  } catch (error: any) {
    console.error('Error updating project:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.msg || error.message,
      serverError: error.response?.data?.error,
      url: error.config?.url
    });
    return {
      data: {} as Project,
      error: error.response?.data?.msg || 'Failed to update project'
    };
  }
};

export const deleteProject = async (projectId: string, token: string): Promise<ApiResponse<{ msg: string }>> => {
  try {
    // Check if projectId is valid
    if (!projectId || projectId === 'undefined') {
      console.error('Invalid project ID for deletion:', projectId);
      return {
        data: { msg: '' },
        error: 'Invalid project ID. Please try again or refresh the page.'
      };
    }

    // Enhanced validation for MongoDB ObjectId format
    if (!isValidObjectId(projectId)) {
      console.error(`Project ID is not a valid MongoDB ObjectId format: ${projectId}`);
      return {
        data: { msg: '' },
        error: 'Invalid project ID format. Please try again or refresh the page.'
      };
    }

    console.log(`Deleting project with ID: ${projectId}`);
    console.log('Full URL for deletion request:', `${api.defaults.baseURL}/projects/${projectId}`);

    // Ensure projectId is properly encoded if it contains special characters
    const encodedProjectId = encodeURIComponent(projectId.trim());
    console.log(`Using encoded project ID for deletion: ${encodedProjectId}`);

    const response = await api.delete(`/projects/${encodedProjectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Project deletion successful, response:', response.data);
    return { data: response.data };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    console.error('Detailed error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.msg || error.message,
      serverError: error.response?.data?.error,
      url: error.config?.url
    });

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

// ******************* ADMIN EDUCATION API *******************
export const createEducation = async (educationData: Omit<Education, 'id'>, token: string): Promise<ApiResponse<Education>> => {
  try {
    const response = await api.post('/education', educationData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Log the raw response to debug
    console.log('Raw education creation response:', response.data);

    // Ensure the education item has an id property
    // MongoDB returns _id, we need to map it to id if it doesn't exist
    const educationWithId = {
      ...response.data,
      id: response.data.id || response.data._id
    };

    console.log('Processed education with ID:', educationWithId);

    return { data: educationWithId };
  } catch (error: any) {
    console.error('Error creating education:', error);
    return {
      data: {} as Education,
      error: error.response?.data?.msg || 'Failed to create education'
    };
  }
};

export const updateEducation = async (educationId: string, educationData: Omit<Education, 'id'>, token: string): Promise<ApiResponse<Education>> => {
  try {
    // Check if educationId is valid
    if (!educationId || educationId === 'undefined') {
      console.error('Invalid education ID:', educationId);
      return {
        data: {} as Education,
        error: 'Invalid education ID. Please try again or refresh the page.'
      };
    }
    // Log what we're sending for debugging
    logger.log(`Updating education ${educationId} with data:`, educationData);

    const response = await api.put(`/education/${educationId}`, educationData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Ensure the returned data has the id field properly mapped
    const educationWithId = {
      ...response.data,
      id: response.data.id || response.data._id
    };

    logger.log('Successfully updated education, returned data:', educationWithId);

    return { data: educationWithId };
  } catch (error: any) {
    console.error('Error updating education:', error);
    return {
      data: {} as Education,
      error: error.response?.data?.msg || 'Failed to update education'
    };
  }
};

export const deleteEducation = async (educationId: string, token: string): Promise<ApiResponse<{ msg: string }>> => {
  try {
    // Check if educationId is valid
    if (!educationId || educationId === 'undefined') {
      console.error('Invalid education ID for deletion:', educationId);
      return {
        data: { msg: '' },
        error: 'Invalid education ID. Please try again or refresh the page.'
      };
    }

    // Ensure the ID format is valid for MongoDB (24 character hex)
    if (!educationId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(`Invalid ObjectId format: ${educationId}`);
      return {
        data: { msg: '' },
        error: 'Invalid ID format. Please try again or refresh the page.'
      };
    }

    // Log the deletion attempt
    console.log(`Attempting to delete education with ID: ${educationId}`);

    const response = await api.delete(`/education/${educationId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Successfully deleted education:', response.data);
    return { data: response.data };
  } catch (error: any) {
    console.error('Error deleting education:', error);

    // Provide detailed error information for debugging
    console.error('Detailed error info:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.msg || error.message,
      serverError: error.response?.data?.error,
      url: error.config?.url
    });

    // Provide more detailed error information to the user
    const errorMsg = error.response?.data?.msg ||
      (error.response?.status === 500 ? 'Server error occurred. Please try again.' :
        (error.response?.status === 404 ? 'Education record not found.' :
          'Failed to delete education. ' + (error.message || '')));

    return {
      data: { msg: '' },
      error: errorMsg
    };
  }
};

// ******************* ADMIN CONTACT API *******************
export const getContactMessages = async (token: string): Promise<ApiResponse<any[]>> => {
  try {
    const response = await api.get('/contact', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    return {
      data: [],
      error: error.response?.data?.msg || 'Failed to fetch contact messages'
    };
  }
};

export const markMessageAsRead = async (messageId: string, token: string): Promise<ApiResponse<any>> => {
  try {
    // The backend already handles marking a message as read when accessed by ID
    const response = await api.get(`/contact/${messageId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    return {
      data: {},
      error: error.response?.data?.msg || 'Failed to mark message as read'
    };
  }
};

export const toggleMessageReadStatus = async (messageId: string, isRead: boolean, token: string): Promise<ApiResponse<any>> => {
  try {
    const response = await api.put(`/contact/${messageId}/status`, { read: isRead }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error(`Error toggling message read status to ${isRead}:`, error);
    return {
      data: {},
      error: error.response?.data?.msg || `Failed to mark message as ${isRead ? 'read' : 'unread'}`
    };
  }
};

export const deleteContactMessage = async (messageId: string, token: string): Promise<ApiResponse<{ msg: string }>> => {
  try {
    const response = await api.delete(`/contact/${messageId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error deleting contact message:', error);
    return {
      data: { msg: '' },
      error: error.response?.data?.msg || 'Failed to delete contact message'
    };
  }
};

// Debug function for skill operations
export const debugSkillOperations = {
  create: async (skillData: Omit<Skill, 'id'>, token: string): Promise<ApiResponse<Skill>> => {
    console.log('DEBUG: Creating skill with data:', skillData);
    try {
      const response = await api.post('/skills', skillData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('DEBUG: Create skill response:', response.data);
      return { data: response.data };
    } catch (error: any) {
      console.error('DEBUG: Error creating skill:', error);
      console.error('DEBUG: Error response:', error.response?.data);
      return {
        data: {} as Skill,
        error: error.response?.data?.msg || 'Failed to create skill'
      };
    }
  },
  update: async (skillId: string, skillData: Omit<Skill, 'id'>, token: string): Promise<ApiResponse<Skill>> => {
    console.log(`DEBUG: Updating skill with ID: ${skillId}`);
    console.log('DEBUG: Update data:', skillData);
    try {
      const response = await api.put(`/skills/${skillId}`, skillData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('DEBUG: Update skill response:', response.data);
      return { data: response.data };
    } catch (error: any) {
      console.error('DEBUG: Error updating skill:', error);
      console.error('DEBUG: Error response:', error.response?.data);
      return {
        data: {} as Skill,
        error: error.response?.data?.msg || 'Failed to update skill'
      };
    }
  }
};

export default api;