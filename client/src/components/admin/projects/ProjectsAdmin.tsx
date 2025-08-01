import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectMedia } from '../../../types';
import { getProjects, createProject, updateProject, deleteProject } from '../../../services/api';
import { deleteProjectFixed } from '../../../services/projectsService';
import MediaUploader from './MediaUploader';
import MediaViewer from './MediaViewer';
import {
  Loader2, Plus, Pencil, Trash2, ChevronDown, ChevronUp, ExternalLink,
  Github, Calendar, LayoutGrid, List, ArrowUpDown, BarChart2,
  Code, Tag, Clock, PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';

// Maximum description length before truncation (approximately 4 lines)
const MAX_ADMIN_DESCRIPTION_LENGTH = 300;

// Helper function for progress bar widths
const getWidthClass = (percentage: number): string => {
  if (percentage <= 0) return 'w-0';
  if (percentage <= 5) return 'w-[5%]';
  if (percentage <= 10) return 'w-[10%]';
  if (percentage <= 20) return 'w-[20%]';
  if (percentage <= 30) return 'w-[30%]';
  if (percentage <= 40) return 'w-[40%]';
  if (percentage <= 50) return 'w-[50%]';
  if (percentage <= 60) return 'w-[60%]';
  if (percentage <= 70) return 'w-[70%]';
  if (percentage <= 80) return 'w-[80%]';
  if (percentage <= 90) return 'w-[90%]';
  return 'w-full';
};

interface ProjectsAdminProps {
  token: string | null;
}

function ProjectsAdmin({ token }: ProjectsAdminProps): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  // Add states for the delete confirmation popup and expanded descriptions
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string, title: string, description: string } | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  // Add state for view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  // Add state for sorting
  const [sortBy, setSortBy] = useState<string>('newest');

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  // Toggle description expansion for a specific project
  const toggleDescription = (projectId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // State for media items
  const [mediaItems, setMediaItems] = useState<ProjectMedia[]>([]);
  
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    technologies: [],
    timeline: {
      start: '',
      end: null
    },
    imageUrl: '',
    media: [],
    repoLink: '',
    demoLink: '',
    tags: []
  });

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await getProjects();
        if (response.error) {
          setError(response.error);
        } else {
          // Add additional logging to debug project IDs
          console.log('Projects loaded:', response.data);
          console.log('Project IDs:', response.data.map((p: Project) => ({ id: p.id, _id: (p as any)._id })));

          // Ensure each project has a proper id property
          const projectsWithIds = response.data.map((project: any) => ({
            ...project,
            id: project.id || project._id
          }));

          setProjects(projectsWithIds);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []); const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Ensure we're working with an object that can be spread
        const parentObj = prev[parent as keyof typeof prev] as Record<string, any>;

        // Special handling for end date - if empty, set to null (indicating "Present")
        if (child === 'end' && value === '') {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: null
            }
          };
        } else {
          // For all other nested fields
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value
            }
          };
        }
      });
    } else if (name === 'technologies' || name === 'tags') {
      // Handle arrays (comma-separated values)
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim())
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Debug log for date values
    if (name === 'timeline.start' || name === 'timeline.end') {
      console.log(`Date field ${name} changed to:`, value);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      technologies: [],
      timeline: {
        start: '',
        end: null
      },
      imageUrl: '',
      media: [],
      repoLink: '',
      demoLink: '',
      tags: []
    });
    setMediaItems([]);
    setEditingProject(null);
    setIsFormOpen(false);
  };
  const openEditForm = (project: Project) => {
    // Log to debug the project object
    console.log('Opening edit form with project:', project);

    // Ensure we have an ID (either id or _id)
    if (!project.id && !(project as any)._id) {
      console.error('Project has no ID:', project);
      setError('Cannot edit project: Missing ID');
      return;
    }

    // Make sure we have a proper id saved in the editingProject
    const projectWithId = {
      ...project,
      id: project.id || (project as any)._id
    };

    // Set form data with media items
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      timeline: {
        start: project.timeline.start,
        end: project.timeline.end
      },
      imageUrl: project.imageUrl,
      media: project.media || [],
      repoLink: project.repoLink || '',
      demoLink: project.demoLink || '',
      tags: project.tags
    });
    
    // Initialize media items state
    if (project.media && project.media.length > 0) {
      setMediaItems(project.media);
    } else if (project.imageUrl) {
      // If no media items but imageUrl exists, create one from it
      setMediaItems([
        {
          type: 'image',
          url: project.imageUrl,
          isExternal: true,
          order: 0,
          displayFirst: true
        }
      ]);
    } else {
      setMediaItems([]);
    }
    setEditingProject(projectWithId);
    setIsFormOpen(true);

    // Debug log to check the ID
    console.log('Set editingProject with ID:', projectWithId.id);
  }; const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      const errorMsg = 'Authentication token is missing. Please log in again.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    try {
      // Prepare form data with media items
      const formDataWithMedia = {
        ...formData,
        media: mediaItems
      };
      
      if (editingProject) {
        // Get project ID, ensuring we handle both id and _id from MongoDB
        const projectId = editingProject.id || (editingProject as any)._id;

        // Log debugging information
        console.log('Attempting to update project:', editingProject);
        console.log('Using project ID:', projectId);
        console.log('Project data being sent:', formDataWithMedia);

        // Validate ID before update
        if (!projectId) {
          console.error('Missing ID in editingProject:', editingProject);
          const errorMsg = 'Cannot update project: Missing ID';
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }

        // Double check and verify the projectId is not undefined or empty
        if (projectId === 'undefined' || projectId === '') {
          console.error('Invalid project ID:', projectId);
          const errorMsg = 'Cannot update project: Invalid project ID';
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }

        // Update existing project with a string ID (ensure it's a string)
        const response = await updateProject(String(projectId), formDataWithMedia, token);

        // Log the response
        console.log('Project update response:', response);

        if (response.error) {
          setError(response.error);
          toast.error(`Failed to update project: ${response.error}`);
        } else {
          // Update projects list, ensuring we match by the correct ID
          setProjects(prev =>
            prev.map(project => {
              const itemId = project.id || (project as any)._id;
              return String(itemId) === String(projectId) ? response.data : project;
            })
          );
          toast.success('Project updated successfully');
          resetForm();
        }
      } else {
        // Create new project
        const response = await createProject(formData, token);
        if (response.error) {
          setError(response.error);
          toast.error(`Failed to create project: ${response.error}`);
        } else {
          // Add new project to list
          setProjects(prev => [...prev, response.data]);
          toast.success('Project created successfully');
          resetForm();
        }
      }
    } catch (err: any) {
      console.error('Failed to save project:', err);
      const errorMsg = err.message || 'Failed to save project. Please try again.';
      setError(`Failed to save project: ${errorMsg}`);
      toast.error(`Failed to save project: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };// Initiates the delete confirmation process
  const initiateDelete = (id: string, title: string, description: string) => {
    if (!token) {
      const errorMsg = 'Authentication token is missing. Please log in again.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate project ID
    if (!id || id === 'undefined') {
      const errorMsg = 'Cannot delete project: Invalid project ID';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Set the project to delete and show the confirmation dialog
    setProjectToDelete({ id, title, description });
    setShowDeleteConfirm(true);
  };// Handle the actual deletion after confirmation
  const handleDelete = async (projectToDelete: { id: string, title: string, description: string }) => {
    const projectId = projectToDelete.id;
    if (!token) {
      const errorMsg = 'Authentication token is missing. Please log in again.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    try {
      console.log(`Attempting to delete project with ID: ${projectId}`);

      // Make sure we're using a clean string version of the ID
      const cleanProjectId = String(projectId).trim();
      console.log(`Clean project ID for deletion: ${cleanProjectId}`);

      // First try with the specialized service
      console.log('Using specialized project service for deletion');
      const response = await deleteProjectFixed(cleanProjectId, token);

      console.log('Delete project response:', response);

      if (response.error) {
        console.error('Error from specialized service:', response.error);

        // Fallback to original method if specialized service fails
        console.log('Falling back to standard delete method');
        const fallbackResponse = await deleteProject(cleanProjectId, token);

        if (fallbackResponse.error) {
          setError(fallbackResponse.error);
          toast.error(`Failed to delete project: ${fallbackResponse.error}`);
        } else {
          // Success with fallback
          updateProjectsList(cleanProjectId);
        }
      } else {
        // Success with specialized service
        updateProjectsList(cleanProjectId);
      }
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      const errorMsg = err.message || 'Failed to delete project. Please try again.';
      setError(`Failed to delete project: ${errorMsg}`);
      toast.error(`Failed to delete project: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };// Helper function to update projects list after successful deletion
  const updateProjectsList = (deletedProjectId: string) => {
    setProjects(prev => prev.filter((project: Project) => {
      const itemId = project.id || (project as any)._id;
      return String(itemId) !== String(deletedProjectId);
    }));

    // Show success message with toast notification
    setError(null);
    toast.success('Project deleted successfully', {
      duration: 3000,
      position: 'top-center',
      icon: '🗑️',
    });
  };

  // Get sorted projects
  const getSortedProjects = () => {
    if (sortBy === 'newest') {
      return [...projects].sort((a, b) => {
        return new Date(b.timeline.start).getTime() - new Date(a.timeline.start).getTime();
      });
    } else if (sortBy === 'oldest') {
      return [...projects].sort((a, b) => {
        return new Date(a.timeline.start).getTime() - new Date(b.timeline.start).getTime();
      });
    } else if (sortBy === 'a-z') {
      return [...projects].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'z-a') {
      return [...projects].sort((a, b) => b.title.localeCompare(a.title));
    }
    return projects;
  };

  // Function to get most used technologies
  const getMostUsedTechnologies = () => {
    const techCount: Record<string, number> = {};

    projects.forEach(project => {
      project.technologies.forEach(tech => {
        techCount[tech] = (techCount[tech] || 0) + 1;
      });
    });

    return Object.entries(techCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tech, count]) => ({ tech, count }));
  };

  // Function to get most used tags
  const getMostUsedTags = () => {
    const tagCount: Record<string, number> = {};

    projects.forEach(project => {
      project.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }));
  };

  // Function to format date string
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const sortedProjects = getSortedProjects();
  const mostUsedTechnologies = getMostUsedTechnologies();
  const mostUsedTags = getMostUsedTags();

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Manage Projects</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          Add Project
        </button>
      </div>      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}
      {/* Project Overview */}
      {!loading && (
        <div className="mb-8">
          <div className="bg-background/50 rounded-lg border border-border/40 shadow-sm">
            {/* Top section with stats */}
            <div className="p-6 border-b border-border/30">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold">Portfolio Projects</h3>
                    {projects.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                        {projects.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-foreground/70">
                      <span className="font-medium text-primary">{projects.length}</span> total projects •
                      <span className="ml-1 font-medium text-green-500">{projects.filter(p => !p.timeline.end).length}</span> ongoing
                    </p>
                  </div>
                </div>
                {/* View mode and sort controls */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                  <div className="flex rounded-md overflow-hidden border border-border/60">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 text-xs flex items-center justify-center ${viewMode === 'list'
                        ? 'bg-primary text-white'
                        : 'bg-card hover:bg-card/80'
                        }`}
                      aria-label="List view"
                    >
                      <List size={14} className="mr-1" />
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 text-xs flex items-center justify-center ${viewMode === 'grid'
                        ? 'bg-primary text-white'
                        : 'bg-card hover:bg-card/80'
                        }`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid size={14} className="mr-1" />
                      Grid
                    </button>
                  </div>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-card border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label="Sort projects by"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                  </select>
                </div>
              </div>              {/* Project stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="p-5 rounded-lg bg-card border border-border/40 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground/70">Total Projects</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                      <BarChart2 size={16} />
                    </div>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-foreground">{projects.length}</p>
                  <div className="mt-3 text-xs text-foreground/60 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {projects.length > 0 ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                </div>

                <div className="p-5 rounded-lg bg-card border border-border/40 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground/70">Demo Links</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500">
                      <ExternalLink size={15} />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {projects.filter(p => p.demoLink).length}
                    </p>
                    <span className="text-sm ml-1 text-foreground/60">of {projects.length}</span>
                  </div>
                  <div className="flex items-center mt-3">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={`bg-blue-500 h-full rounded-full ${getWidthClass(projects.length ? (projects.filter(p => p.demoLink).length / projects.length) * 100 : 0)}`}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 text-xs font-medium text-foreground/70">
                      {Math.round(projects.length ? (projects.filter(p => p.demoLink).length / projects.length) * 100 : 0)}%
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-lg bg-card border border-border/40 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground/70">Repo Links</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-500">
                      <Github size={15} />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {projects.filter(p => p.repoLink).length}
                    </p>
                    <span className="text-sm ml-1 text-foreground/60">of {projects.length}</span>
                  </div>
                  <div className="flex items-center mt-3">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={`bg-purple-500 h-full rounded-full ${getWidthClass(projects.length ? (projects.filter(p => p.repoLink).length / projects.length) * 100 : 0)}`}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 text-xs font-medium text-foreground/70">
                      {Math.round(projects.length ? (projects.filter(p => p.repoLink).length / projects.length) * 100 : 0)}%
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-lg bg-card border border-border/40 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground/70">Ongoing Projects</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/10 text-green-500">
                      <Calendar size={15} />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {projects.filter(p => !p.timeline.end).length}
                    </p>
                    <span className="text-sm ml-1 text-foreground/60">of {projects.length}</span>
                  </div>
                  <div className="flex items-center mt-3">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={`bg-green-500 h-full rounded-full ${getWidthClass(projects.length ? (projects.filter(p => !p.timeline.end).length / projects.length) * 100 : 0)}`}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 text-xs font-medium text-foreground/70">
                      {Math.round(projects.length ? (projects.filter(p => !p.timeline.end).length / projects.length) * 100 : 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Technology and tag visualization */}
            {projects.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Technology breakdown */}
                <div>
                  <div className="flex items-center mb-4">
                    <Code size={16} className="text-blue-500 mr-2" />
                    <h4 className="text-sm font-medium">Top Technologies</h4>
                  </div>
                  <div className="space-y-2">
                    {getMostUsedTechnologies().map(({ tech, count }) => (
                      <div key={tech} className="flex items-center">
                        <div className="w-24 truncate text-xs">{tech}</div>
                        <div className="flex-1 h-2.5 bg-background rounded-full overflow-hidden mx-2">
                          <div
                            className={`h-full bg-blue-500 rounded-full ${getWidthClass((count / projects.length) * 100)}`}
                          ></div>
                        </div>
                        <div className="text-xs font-medium w-6 text-right">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tag breakdown */}
                <div>
                  <div className="flex items-center mb-4">
                    <Tag size={16} className="text-primary mr-2" />
                    <h4 className="text-sm font-medium">Top Tags</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getMostUsedTags().map(({ tag, count }) => (
                      <div
                        key={tag}
                        className="px-2 py-1 bg-background rounded-md border border-border/40 flex items-center gap-1.5"
                      >
                        <span className="text-xs font-medium">{tag}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-primary/10 rounded-full text-primary">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form for adding/editing projects */}
      {isFormOpen && (
        <div className="mb-8 p-4 bg-background rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-4">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeline.start" className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="month"
                  id="timeline.start"
                  name="timeline.start"
                  value={formData.timeline.start}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="timeline.end" className="block text-sm font-medium mb-1">End Date (leave empty for ongoing)</label>
                <input
                  type="month"
                  id="timeline.end"
                  name="timeline.end"
                  value={formData.timeline.end || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                Image URL <span className="text-xs text-foreground/60">(Alternative to media uploads)</span>
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Optional if using media uploads"
              />
            </div>
            
            {/* Media uploader */}
            <div>
              <MediaUploader 
                projectId={editingProject?.id || null}
                token={token}
                initialMedia={mediaItems}
                onMediaChange={setMediaItems}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="repoLink" className="block text-sm font-medium mb-1">Repository Link (optional)</label>
                <input
                  type="text"
                  id="repoLink"
                  name="repoLink"
                  value={formData.repoLink}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="demoLink" className="block text-sm font-medium mb-1">Demo Link (optional)</label>
                <input
                  type="text"
                  id="demoLink"
                  name="demoLink"
                  value={formData.demoLink}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="technologies" className="block text-sm font-medium mb-1">Technologies (comma-separated)</label>
              <input
                type="text"
                id="technologies"
                name="technologies"
                value={formData.technologies.join(', ')}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags.join(', ')}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                {editingProject ? 'Update Project' : 'Add Project'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-background text-foreground rounded-md hover:bg-background/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}      {/* Projects list */}
      {loading && !projects.length ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div>
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border/50">
              <div className="mb-4 text-foreground/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-foreground/70">Add your first project to showcase your skills and experience.</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-4 flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors mx-auto"
              >
                <Plus size={16} />
                Add Project
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
              {sortedProjects.map(project => {
                // Ensure we have an ID to use as a key, falling back to index if needed
                const projectId = project.id || (project as any)._id || `project-${Math.random()}`;

                return viewMode === 'grid' ? (
                  // Grid view
                  <div
                    key={projectId}
                    className="bg-card rounded-lg border border-border/50 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48">
                      <MediaViewer 
                        mediaItems={project.media || []}
                        autoplay={false}
                      />
                      <div className="absolute top-0 right-0 p-2 flex gap-1 z-10">
                        <button
                          onClick={() => openEditForm(project)}
                          className="p-1.5 bg-black/60 hover:bg-primary text-white rounded-full transition-colors"
                          title="Edit project"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => initiateDelete(String(projectId), project.title, project.description)}
                          className="p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors"
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent z-10">
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-primary/90 text-white text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-foreground/30 text-white text-xs rounded-full">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-2 truncate">{project.title}</h3>
                      <div className="mb-3 h-12">
                        <p className="text-sm text-foreground/70 line-clamp-2">
                          {truncateText(project.description, MAX_ADMIN_DESCRIPTION_LENGTH)}
                        </p>
                      </div>

                      <div className="flex items-center text-xs text-foreground/60 mb-3">
                        <Calendar size={14} className="mr-1.5" />
                        {project.timeline.start ? (
                          <>
                            {new Date(project.timeline.start).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            {' - '}
                            {project.timeline.end
                              ? new Date(project.timeline.end).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                              : 'Present'
                            }
                          </>
                        ) : 'No date'}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.technologies.slice(0, 4).map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 bg-background text-xs rounded-full">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="px-2 py-0.5 bg-background text-xs rounded-full">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3 mt-3 pt-3 border-t border-border/50">
                        {project.repoLink && (
                          <a
                            href={project.repoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center text-foreground/70 hover:text-primary"
                          >
                            <Github size={14} className="mr-1" />
                            Repository
                          </a>
                        )}
                        {project.demoLink && (
                          <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center text-foreground/70 hover:text-primary"
                          >
                            <ExternalLink size={14} className="mr-1" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // List view
                  <div
                    key={projectId}
                    className="flex flex-col md:flex-row gap-4 border border-border/50 rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="md:w-1/4 h-48 md:h-auto relative group">
                      <MediaViewer 
                        mediaItems={project.media || []}
                        autoplay={false}
                      />
                      <div className="hidden group-hover:flex absolute top-0 right-0 p-2 gap-1 z-10">
                        <button
                          onClick={() => openEditForm(project)}
                          className="p-1.5 bg-black/60 hover:bg-primary text-white rounded-full transition-colors"
                          title="Edit project"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => initiateDelete(String(projectId), project.title, project.description)}
                          className="p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors"
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold">{project.title}</h3>
                        <div className="md:hidden flex gap-2">
                          <button
                            onClick={() => openEditForm(project)}
                            className="p-1 text-foreground/70 hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => initiateDelete(String(projectId), project.title, project.description)}
                            className="p-1 text-foreground/70 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-foreground/60 mt-1 mb-2">
                        <Calendar size={14} className="mr-1.5" />
                        {project.timeline.start ? (
                          <>
                            {new Date(project.timeline.start).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            {' - '}
                            {project.timeline.end
                              ? new Date(project.timeline.end).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                              : 'Present'
                            }
                          </>
                        ) : 'No date'}
                      </div>

                      <div className="mt-1 mb-3">
                        <div className="text-sm text-foreground/70 max-w-none">
                          {expandedDescriptions[projectId]
                            ? project.description
                            : (
                              <>
                                {truncateText(project.description, MAX_ADMIN_DESCRIPTION_LENGTH)}
                              </>
                            )
                          }
                        </div>

                        {project.description.length > MAX_ADMIN_DESCRIPTION_LENGTH && (
                          <button
                            onClick={() => toggleDescription(projectId)}
                            className="flex items-center gap-1 mt-1.5 text-xs text-primary font-medium hover:underline"
                          >
                            {expandedDescriptions[projectId] ? (
                              <>
                                Show less
                                <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                Show more
                                <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 bg-background text-xs rounded-full border border-border/40">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-4 mt-3 pt-3 border-t border-border/20">
                        {project.repoLink && (
                          <a
                            href={project.repoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center text-foreground/70 hover:text-primary"
                          >
                            <Github size={16} className="mr-1.5" />
                            Repository
                          </a>
                        )}
                        {project.demoLink && (
                          <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center text-foreground/70 hover:text-primary"
                          >
                            <ExternalLink size={16} className="mr-1.5" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}{/* Delete Confirmation Dialog */}
      {showDeleteConfirm && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-2">
              Are you sure you want to delete the following project?
            </p>
            <div className="mb-4">
              <p className="text-primary font-medium text-lg">
                {projectToDelete.title}
              </p>
            </div>
            <p className="text-red-500 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-background text-foreground rounded-md hover:bg-background/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(projectToDelete);
                  setShowDeleteConfirm(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsAdmin;
