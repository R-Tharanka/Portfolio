import axios from 'axios';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
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
    const response = await api.get('/skills');
    return { data: response.data };
  } catch (error: any) {
    console.error('Error fetching skills:', error);
    return { 
      data: [], 
      error: error.response?.data?.msg || 'Failed to fetch skills' 
    };
  }
};

// ******************* PROJECTS API *******************
export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  try {
    const response = await api.get('/projects');
    return { data: response.data };
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return { 
      data: [], 
      error: error.response?.data?.msg || 'Failed to fetch projects' 
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
export const createSkill = async (skillData: Omit<Skill, 'id'>, token: string): Promise<ApiResponse<Skill>> => {  try {    const response = await api.post('/skills', skillData, {
      headers: { 'x-auth-token': token }
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
  try {    const response = await api.put(`/skills/${skillId}`, skillData, {
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
  try {    const response = await api.delete(`/skills/${skillId}`, {
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
      headers: { 'x-auth-token': token }
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
      headers: { 'x-auth-token': token }
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
      headers: { 'x-auth-token': token }
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
      headers: { 'x-auth-token': token }
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
    const response = await api.put(`/education/${educationId}`, educationData, {
      headers: { 'x-auth-token': token }
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
      headers: { 'x-auth-token': token }
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
      headers: { 'x-auth-token': token }
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

export default api;