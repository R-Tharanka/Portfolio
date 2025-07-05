import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Github, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Project } from '../../types';
import { useApiService } from '../../hooks/useApiService';
import ScrollableTagRow from '../ui/ScrollableTagRow';

// Maximum description length before truncation
const MAX_DESCRIPTION_LENGTH = 200;

const ProjectsSection: React.FC = () => {
  const { getProjects } = useApiService();
  const [activeTag, setActiveTag] = useState<string | 'All'>('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
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
          setProjects(response.data); // Fallback data is already included in the response
        } else {
          setProjects(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Using fallback data.');
        setProjects([]); // Empty array if all else fails
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);  // Toggle description expansion for a specific project
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
              <p className="text-xl mb-2">Could Not Load Projects</p>
              <p className="text-foreground/70">{error}</p>
            </div>
          )}
          
          {/* No Data State */}
          {!error && !loading && filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-foreground/70">No projects found for the selected filter.</p>
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
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      {/* project cover image */}
                      <div className="absolute bottom-0 left-0 w-full px-4 pb-5 pt-2">
                        {/* Scrollable tag container */}
                        <ScrollableTagRow
                          tags={project.tags}
                          className="mx-0.5"
                        />
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
            </AnimatePresence>)}
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