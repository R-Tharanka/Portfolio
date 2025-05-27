// Types for the entire application

// Theme
export type Theme = 'dark' | 'light';

// Skill Type
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number; // 1-10
  icon: string;
}

export type SkillCategory = 
  | 'Frontend' 
  | 'Backend' 
  | 'Database' 
  | 'DevOps' 
  | 'Languages'
  | 'Design' 
  | 'Other';

// Project Type
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  timeline: {
    start: string;
    end: string | null; // null means "Present"
  };
  imageUrl: string;
  repoLink?: string;
  demoLink?: string;
  tags: string[];
}

// Education Type
export interface Education {
  id: string;
  institution: string;
  title: string;
  description: string;
  skills: string[];
  timeline: {
    start: string;
    end: string | null; // null means "Present"
  };
}

// Contact Form Type
export interface ContactFormData {
  name: string;
  email: string;
  title: string;
  message: string;
  recaptchaToken?: string;
}

// Social Media Type
export interface SocialMedia {
  platform: string;
  url: string;
  icon: string;
}