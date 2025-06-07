import React, { useState, useEffect } from 'react';
import { Project } from '../../../types';
import { getProjects, createProject, updateProject, deleteProject } from '../../../services/api';
import { deleteProjectFixed } from '../../../services/projectsService';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

interface ProjectsAdminProps {
  token: string | null;
}

const ProjectsAdmin: React.FC<ProjectsAdminProps> = ({ token }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    technologies: [],
    timeline: {
      start: '',
      end: null
    },
    imageUrl: '',
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
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Ensure we're working with an object that can be spread
        const parentObj = prev[parent as keyof typeof prev] as Record<string, any>;
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
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
      repoLink: '',
      demoLink: '',
      tags: []
    });
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

    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      timeline: {
        start: project.timeline.start,
        end: project.timeline.end
      },
      imageUrl: project.imageUrl,
      repoLink: project.repoLink || '',
      demoLink: project.demoLink || '',
      tags: project.tags
    });
    setEditingProject(projectWithId);
    setIsFormOpen(true);

    // Debug log to check the ID
    console.log('Set editingProject with ID:', projectWithId.id);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      if (editingProject) {
        // Get project ID, ensuring we handle both id and _id from MongoDB
        const projectId = editingProject.id || (editingProject as any)._id;

        // Log debugging information
        console.log('Attempting to update project:', editingProject);
        console.log('Using project ID:', projectId);
        console.log('Project data being sent:', formData);

        // Validate ID before update
        if (!projectId) {
          console.error('Missing ID in editingProject:', editingProject);
          setError('Cannot update project: Missing ID');
          setLoading(false);
          return;
        }

        // Double check and verify the projectId is not undefined or empty
        if (projectId === 'undefined' || projectId === '') {
          console.error('Invalid project ID:', projectId);
          setError('Cannot update project: Invalid project ID');
          setLoading(false);
          return;
        }

        // Update existing project with a string ID (ensure it's a string)
        const response = await updateProject(String(projectId), formData, token);

        // Log the response
        console.log('Project update response:', response);

        if (response.error) {
          setError(response.error);
        } else {
          // Update projects list, ensuring we match by the correct ID
          setProjects(prev =>
            prev.map(project => {
              const itemId = project.id || (project as any)._id;
              return String(itemId) === String(projectId) ? response.data : project;
            })
          );
          resetForm();
        }
      } else {
        // Create new project
        const response = await createProject(formData, token);
        if (response.error) {
          setError(response.error);
        } else {
          // Add new project to list
          setProjects(prev => [...prev, response.data]);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Failed to save project:', err);
      setError('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  }; const handleDelete = async (projectId: string) => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }

    // Validate project ID
    if (!projectId || projectId === 'undefined') {
      setError('Cannot delete project: Invalid project ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this project?')) {
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
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update projects list after successful deletion
  const updateProjectsList = (deletedProjectId: string) => {
    setProjects(prev => prev.filter(project => {
      const itemId = project.id || (project as any)._id;
      return String(itemId) !== String(deletedProjectId);
    }));

    // Show success message
    setError(null);
    window.alert('Project deleted successfully');
  };

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
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
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
              <div>                <label htmlFor="timeline.start" className="block text-sm font-medium mb-1">Start Date (YYYY-MM format)</label>
                <input
                  type="text"
                  id="timeline.start"
                  name="timeline.start"
                  placeholder="YYYY-MM"
                  value={formData.timeline.start}
                  onChange={handleChange}
                  required
                  pattern="\d{4}-\d{2}"
                  title="Format: YYYY-MM (e.g. 2023-01)"
                  className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>                <label htmlFor="timeline.end" className="block text-sm font-medium mb-1">End Date (YYYY-MM format or leave empty for ongoing)</label>
                <input
                  type="text"
                  id="timeline.end"
                  name="timeline.end"
                  placeholder="YYYY-MM"
                  value={formData.timeline.end || ''}
                  onChange={handleChange}
                  pattern="\d{4}-\d{2}"
                  title="Format: YYYY-MM (e.g. 2023-01)"
                  className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
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
      )}

      {/* Projects list */}
      {loading && !projects.length ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {projects.length === 0 ? (
            <p className="text-center py-8 text-foreground/70">No projects found. Add your first project!</p>
          ) : (
            projects.map(project => {
              // Ensure we have an ID to use as a key, falling back to index if needed
              const projectId = project.id || (project as any)._id || `project-${Math.random()}`;

              return (
                <div key={projectId} className="flex flex-col md:flex-row gap-4 border border-border/50 rounded-lg overflow-hidden">
                  <div className="md:w-1/4 h-48 md:h-auto">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold">{project.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(project)}
                          className="p-1 text-foreground/70 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(projectId)}
                          className="p-1 text-foreground/70 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/70 mt-1 mb-2">{project.description}</p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 bg-background text-xs rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsAdmin;
