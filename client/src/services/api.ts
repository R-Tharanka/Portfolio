import axios from 'axios';
import { isTokenExpired } from '../utils/auth';

// Create an axios instance with base URL and improved configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for authentication and logging
api.interceptors.request.use(config => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

  // Check if request has Authorization header (contains a token)
  const authHeader = config.headers?.Authorization as string;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    // Verify token is not expired
    if (isTokenExpired(token)) {
      // Token expired, reject request and force logout
      console.warn('Token expired, request blocked');
      console.log('Token expiration details:', { token });

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
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Add a response interceptor for logging and error handling
api.interceptors.response.use(response => {
  return response;
}, error => {
  const { response } = error;
  if (response?.status === 401) {
    // Unauthorized - token might be invalid or expired
    console.error('Authentication error:', response?.data?.message || 'Unauthorized access');

    // Clear token from localStorage
    localStorage.removeItem('adminToken');

    // Dispatch a custom event to notify app about token expiration
    const tokenExpiredEvent = new CustomEvent('auth:tokenExpired');
    window.dispatchEvent(tokenExpiredEvent);
  } else if (response?.status === 500) {
    console.error('Server Error:', response?.data?.message || 'Unknown server error');
  }
  return Promise.reject(error);
});

// Types from our application
import { Skill, Project, Education, ContactFormData } from '../types';

// API response types
interface ApiResponse<T> {
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
    console.error('Error fetching skills:', error);
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.msg ||
      error.message ||
      'Failed to fetch skills';

    console.error('Detailed error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: errorMessage,
      url: error.config?.url
    });

    return {
      data: [],
      error: errorMessage
    };
  }
};

// ******************* PROJECTS API *******************
export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  try {
    // Try to connect to the health endpoint first to check connectivity
    await api.get('/health').catch(() => console.log('Health check failed, continuing anyway'));

    const response = await api.get('/projects');
    return { data: response.data };
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.msg ||
      error.message ||
      'Failed to fetch projects';

    console.error('Detailed error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: errorMessage,
      url: error.config?.url
    });

    return {
      data: [],
      error: errorMessage
    };
  }
};

export const getFeaturedProjects = async (): Promise<ApiResponse<Project[]>> => {
  try {
    const response = await api.get('/projects/featured');
    return { data: response.data };
  } catch (error: any) {
    console.error('Error fetching featured projects:', error);
    return {
      data: [],
      error: error.response?.data?.msg || 'Failed to fetch featured projects'
    };
  }
};

// ******************* EDUCATION API *******************
export const getEducation = async (): Promise<ApiResponse<Education[]>> => {
  try {
    const response = await api.get('/education');
    return { data: response.data };
  } catch (error: any) {
    console.error('Error fetching education:', error);
    return {
      data: [],
      error: error.response?.data?.msg || 'Failed to fetch education'
    };
  }
};

// ******************* CONTACT API *******************
export const submitContactForm = async (formData: ContactFormData): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post('/contact', formData);
    return { data: response.data };
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    return {
      data: null,
      error: error.response?.data?.msg || 'Failed to submit contact form'
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

    // Log what we're sending for debugging
    console.log(`Updating skill ${skillId} with data:`, {
      ...skillData,
      icon: skillData.icon.length > 50
        ? `${skillData.icon.substring(0, 50)}... (truncated)`
        : skillData.icon
    });

    const response = await api.put(`/skills/${skillId}`, skillData, {
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

export const updateProject = async (projectId: string, projectData: Omit<Project, 'id'>, token: string): Promise<ApiResponse<Project>> => {
  try {
    const response = await api.put(`/projects/${projectId}`, projectData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error updating project:', error);
    return {
      data: {} as Project,
      error: error.response?.data?.msg || 'Failed to update project'
    };
  }
};

export const deleteProject = async (projectId: string, token: string): Promise<ApiResponse<{ msg: string }>> => {
  try {
    const response = await api.delete(`/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return {
      data: { msg: '' },
      error: error.response?.data?.msg || 'Failed to delete project'
    };
  }
};

// ******************* ADMIN EDUCATION API *******************
export const createEducation = async (educationData: Omit<Education, 'id'>, token: string): Promise<ApiResponse<Education>> => {
  try {
    const response = await api.post('/education', educationData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
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
    console.log(`Updating education ${educationId} with data:`, educationData);

    const response = await api.put(`/education/${educationId}`, educationData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
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
    const response = await api.delete(`/education/${educationId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error: any) {
    console.error('Error deleting education:', error);
    return {
      data: { msg: '' },
      error: error.response?.data?.msg || 'Failed to delete education'
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

export default api;