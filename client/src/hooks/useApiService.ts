import { useApi } from '../context/ApiContext';
import { Skill, Project, Education, ContactFormData } from '../types';
import logger from '../utils/logger';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  isOffline?: boolean;
}

// Define fallback data to use when API is unreachable
const fallbackData: {
  skills: Skill[];
  projects: Project[];
  education: Education[];
} = {
  skills: [
    { 
      id: 'fallback-1', 
      name: 'Frontend Development', 
      proficiency: 90, 
      icon: 'react', 
      category: 'Frontend' as any 
    },
    { 
      id: 'fallback-2', 
      name: 'Backend Development', 
      proficiency: 85, 
      icon: 'node-js', 
      category: 'Backend' as any
    },
    { 
      id: 'fallback-3', 
      name: 'Mobile Development', 
      proficiency: 80, 
      icon: 'mobile', 
      category: 'Mobile' as any
    }
  ],
  projects: [
    { 
      id: 'fallback-1', 
      title: 'Portfolio Website', 
      description: 'While the server is unavailable, we\'re showing placeholder content. Please check back later to see my actual projects.',
      technologies: ['React', 'Node.js', 'MongoDB'],
      timeline: {
        start: '2023-01-01',
        end: null
      },
      imageUrl: '/assets/img/icons/react.svg',
      tags: ['Frontend', 'Backend', 'Full-stack'],
      featured: true
    },
    { 
      id: 'fallback-2', 
      title: 'E-Commerce Platform', 
      description: 'This is a placeholder project while the server is unavailable.',
      technologies: ['TypeScript', 'Express', 'MongoDB'],
      timeline: {
        start: '2022-06-01',
        end: '2022-12-01'
      },
      imageUrl: '/assets/img/icons/typescript.svg',
      tags: ['Backend', 'Database'],
      featured: true
    }
  ],
  education: [
    { 
      id: 'fallback-1', 
      institution: 'University',
      title: 'Computer Science Degree', 
      description: 'We\'re currently unable to load education details. Please check back later when our server is available.',
      skills: ['Programming', 'Algorithms', 'Data Structures'],
      timeline: {
        start: '2018-01-01',
        end: '2022-01-01'
      }
    },
    { 
      id: 'fallback-2', 
      institution: 'Online Platform',
      title: 'Web Development Certification', 
      description: 'This is placeholder education content while our server is unavailable.',
      skills: ['HTML', 'CSS', 'JavaScript'],
      timeline: {
        start: '2017-01-01',
        end: '2017-06-01'
      }
    }
  ]
};

// Custom hook for API operations with fallback handling
export function useApiService() {
  const { axiosInstance, isApiOnline } = useApi();

  // SKILLS API
  const getSkills = async (): Promise<ApiResponse<Skill[]>> => {
    try {
      if (!isApiOnline) {
        logger.warn('API offline - returning fallback skills data');
        return { 
          data: fallbackData.skills,
          isOffline: true
        };
      }
      
      const response = await axiosInstance.get('/skills');
      return { data: response.data };
    } catch (error: any) {
      logger.error('Error fetching skills:', error);
      return { 
        data: fallbackData.skills, 
        error: 'Failed to load skills',
        isOffline: true
      };
    }
  };

  // PROJECTS API
  const getProjects = async (): Promise<ApiResponse<Project[]>> => {
    try {
      if (!isApiOnline) {
        logger.warn('API offline - returning fallback projects data');
        return { 
          data: fallbackData.projects,
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
        data: fallbackData.projects, 
        error: 'Failed to load projects',
        isOffline: true
      };
    }
  };
  
  const getFeaturedProjects = async (): Promise<ApiResponse<Project[]>> => {
    try {
      if (!isApiOnline) {
        const featuredProjects = fallbackData.projects.filter(project => project.featured);
        logger.warn('API offline - returning fallback featured projects data');
        return { 
          data: featuredProjects,
          isOffline: true
        };
      }
      
      const response = await axiosInstance.get('/projects/featured');
      return { data: response.data };
    } catch (error: any) {
      const featuredProjects = fallbackData.projects.filter(project => project.featured);
      logger.error('Error fetching featured projects:', error);
      return { 
        data: featuredProjects,
        error: 'Failed to load featured projects',
        isOffline: true
      };
    }
  };

  // EDUCATION API
  const getEducation = async (): Promise<ApiResponse<Education[]>> => {
    try {
      if (!isApiOnline) {
        logger.warn('API offline - returning fallback education data');
        return { 
          data: fallbackData.education,
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
        data: fallbackData.education,
        error: 'Failed to load education',
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
          error: "We're currently unable to send messages. Please try again later or contact directly via email.",
          isOffline: true
        };
      }
      
      const response = await axiosInstance.post('/contact', formData);
      return { data: response.data };
    } catch (error: any) {
      logger.error('Error submitting contact form:', error);
      return {
        data: null,
        error: error.response?.data?.msg || "Something went wrong while sending your message. Please try again later.",
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
