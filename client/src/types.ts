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

// Media Type for Projects
export interface ProjectMedia {
  type: 'image' | 'video';
  url: string;
  publicId?: string;  // Cloudinary public ID for media management
  isExternal: boolean;
  order: number;
  displayFirst: boolean;
  showInViewer?: boolean; // Controls whether this media appears in client-side popup viewer
  displayVariant?: 'mobile' | 'desktop'; // Controls how the media should be fitted in containers
  _id?: string; // MongoDB will generate this
}

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
  imageUrl: string; // Kept for backward compatibility
  media?: ProjectMedia[]; // New field for multiple media items
  repoLink?: string;
  demoLink?: string;
  tags: string[];
  featured?: boolean; // Indicates if the project should be featured on the homepage
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