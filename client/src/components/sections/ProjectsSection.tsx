import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Github, Calendar, Loader2 } from 'lucide-react';
import { Project } from '../../types';
import { getProjects } from '../../services/api';

// Fallback mock data in case API fails
const fallbackProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'A full-featured e-commerce platform with product management, shopping cart, and payment processing.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
    timeline: {
      start: '2023-01',
      end: '2023-04'
    },
    imageUrl: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    repoLink: 'https://github.com/yourusername/ecommerce-platform',
    demoLink: 'https://ecommerce-demo.yourdomain.com',
    tags: ['Web App', 'E-commerce', 'Full Stack']
  },
  {
    id: '2',
    title: 'Task Management System',
    description: 'A Kanban-style task management application with real-time updates and team collaboration features.',
    technologies: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
    timeline: {
      start: '2022-08',
      end: '2022-12'
    },
    imageUrl: 'https://images.pexels.com/photos/3243/pen-calendar-to-do-checklist.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    repoLink: 'https://github.com/yourusername/task-management',
    demoLink: 'https://tasks-demo.yourdomain.com',
    tags: ['Web App', 'Productivity', 'Frontend']
  },
  {
    id: '3',
    title: 'Weather Dashboard',
    description: 'A weather application that displays current and forecasted weather data with beautiful visualizations.',
    technologies: ['JavaScript', 'Chart.js', 'OpenWeather API', 'CSS3'],
    timeline: {
      start: '2022-05',
      end: '2022-07'
    },
    imageUrl: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    repoLink: 'https://github.com/yourusername/weather-dashboard',
    demoLink: 'https://weather-demo.yourdomain.com',
    tags: ['Web App', 'API Integration', 'Frontend']
  },
  {
    id: '4',
    title: 'Social Media App',
    description: 'A social networking platform with user profiles, posts, comments, and real-time notifications.',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'AWS S3'],
    timeline: {
      start: '2021-09',
      end: '2022-02'
    },
    imageUrl: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    repoLink: 'https://github.com/yourusername/social-media-app',
    demoLink: 'https://social-demo.yourdomain.com',
    tags: ['Web App', 'Social Media', 'Full Stack']
  }
];

const ProjectsSection: React.FC = () => {
  const [activeTag, setActiveTag] = useState<string | 'All'>('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Get all unique tags from projects
  const allTags = Array.from(
    new Set(projects.flatMap(project => project.tags))
  );

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await getProjects();
        if (response.error) {
          setError(response.error);
          setProjects(fallbackProjects); // Use fallback data in case of error
        } else {
          setProjects(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Using fallback data.');
        setProjects(fallbackProjects); // Use fallback data in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = activeTag === 'All' 
    ? projects 
    : projects.filter(project => project.tags.includes(activeTag));

  return (
    <section id="projects" className=" bg-background relative">
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            Check out some of my recent work
          </p>
          
          {/* Tags Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button
              onClick={() => setActiveTag('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTag === 'All' 
                  ? 'bg-primary text-white' 
                  : 'bg-card hover:bg-card/80 text-foreground'
              }`}
            >
              All Projects
            </button>
            
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTag === tag 
                    ? 'bg-primary text-white' 
                    : 'bg-card hover:bg-card/80 text-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-foreground/70">{error}</p>
            </div>
          )}
          
          {/* Projects Grid */}
          {!loading && (
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTag}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    className="bg-card rounded-xl overflow-hidden shadow-lg border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 w-full p-4 flex flex-wrap gap-2">
                        {project.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-1 bg-primary/90 text-white text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      
                      <p className="text-foreground/70 mb-4">{project.description}</p>
                      
                      <div className="flex items-center gap-1 text-xs text-foreground/60 mb-4">
                        <Calendar size={14} />
                        <span>
                          {formatDate(project.timeline.start)} — {project.timeline.end ? formatDate(project.timeline.end) : 'Present'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map(tech => (
                          <span 
                            key={tech} 
                            className="px-2 py-1 bg-background text-foreground/80 text-xs rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-4 mt-4">
                        {project.demoLink && (
                          <a 
                            href={project.demoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                          >
                            <ExternalLink size={16} />
                            Live Demo
                          </a>
                        )}
                        
                        {project.repoLink && (
                          <a 
                            href={project.repoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                          >
                            <Github size={16} />
                            Source Code
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </section>
  );
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

export default ProjectsSection;