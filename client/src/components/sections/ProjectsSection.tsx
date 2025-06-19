import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Github, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Project } from '../../types';
import { getProjects } from '../../services/api';

// Custom hook for window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures effect is only run on mount and unmount

  return windowSize;
};

// Empty array for projects data
const fallbackProjects: Project[] = [];

// Maximum description length before truncation
const MAX_DESCRIPTION_LENGTH = 200;

const ProjectsSection: React.FC = () => {
  const [activeTag, setActiveTag] = useState<string | 'All'>('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 640;
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

  // Toggle description expansion for a specific project
  const toggleDescription = (projectId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTag === 'All'
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTag === tag
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
                    <div className="relative h-52 sm:h-48 overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>                      {/* project cover image */}                      <div className="absolute bottom-0 left-0 w-full p-4">
                        <div className="flex flex-wrap gap-2 max-h-10 overflow-hidden">
                          {project.tags.slice(0, isMobile ? 2 : 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-primary/90 text-white text-xs rounded-full shadow-sm"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > (isMobile ? 2 : 3) && (
                            <span className="px-2 py-1 bg-background/80 backdrop-blur-sm text-foreground text-xs rounded-full shadow-sm">
                              +{project.tags.length - (isMobile ? 2 : 3)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>                      <div className="mb-4">
                        <p className={`text-foreground/70 relative overflow-hidden ${expandedDescriptions[project.id] ? '' : 'line-clamp-4 max-h-24'
                          }`}>
                          {expandedDescriptions[project.id]
                            ? project.description
                            : truncateText(project.description, MAX_DESCRIPTION_LENGTH)
                          }
                        </p>

                        {project.description.length > MAX_DESCRIPTION_LENGTH && (
                          <button
                            onClick={() => toggleDescription(project.id)}
                            className="flex items-center gap-1 mt-1 text-sm text-primary font-medium hover:underline"
                          >
                            {expandedDescriptions[project.id] ? (
                              <>
                                Show less
                                <ChevronUp size={16} />
                              </>
                            ) : (
                              <>
                                Read more
                                <ChevronDown size={16} />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-foreground/60 mb-4">
                        <Calendar size={14} />
                        <span>
                          {formatDate(project.timeline.start)} — {project.timeline.end ? formatDate(project.timeline.end) : 'Present'}
                        </span>
                      </div>                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 5).map(tech => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-background text-foreground/80 text-xs rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 5 && (
                          <span className="px-2 py-1 bg-background text-foreground/60 text-xs rounded-md">
                            +{project.technologies.length - 5}
                          </span>
                        )}
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