import React, { useState, useEffect } from 'react';
import { Education } from '../../../types';
import { getEducation, createEducation, updateEducation, deleteEducation } from '../../../services/api';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

interface EducationAdminProps {
  token: string | null;
}

const EducationAdmin: React.FC<EducationAdminProps> = ({ token }) => {
  const [educationItems, setEducationItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  
  const [formData, setFormData] = useState<Omit<Education, 'id'>>({
    institution: '',
    title: '',
    description: '',
    skills: [],
    timeline: {
      start: '',
      end: null
    }
  });

  // Fetch education items
  useEffect(() => {
    const fetchEducation = async () => {
      setLoading(true);
      try {
        const response = await getEducation();
        if (response.error) {
          setError(response.error);
        } else {
          setEducationItems(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch education:', err);
        setError('Failed to load education data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
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
    } else if (name === 'skills') {
      // Handle arrays (comma-separated values), filter out empty items
      const skillArray = value
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      setFormData(prev => ({ 
        ...prev, 
        [name]: skillArray
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      institution: '',
      title: '',
      description: '',
      skills: [],
      timeline: {
        start: '',
        end: null
      }
    });
    setEditingEducation(null);
    setIsFormOpen(false);
  };

  const openEditForm = (education: Education) => {
    setFormData({
      institution: education.institution,
      title: education.title,
      description: education.description,
      skills: education.skills,
      timeline: {
        start: education.timeline.start,
        end: education.timeline.end
      }
    });
    setEditingEducation(education);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }
    
    setLoading(true);
    try {
      if (editingEducation) {
        // Update existing education item
        const response = await updateEducation(editingEducation.id, formData, token);
        if (response.error) {
          setError(response.error);
        } else {
          // Update education list
          setEducationItems(prev => 
            prev.map(item => 
              item.id === editingEducation.id ? response.data : item
            )
          );
          resetForm();
        }
      } else {
        // Create new education item
        const response = await createEducation(formData, token);
        if (response.error) {
          setError(response.error);
        } else {
          // Add new education item to list
          setEducationItems(prev => [...prev, response.data]);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Failed to save education item:', err);
      setError('Failed to save education item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (educationId: string) => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this education item?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await deleteEducation(educationId, token);
      if (response.error) {
        setError(response.error);
      } else {
        // Remove education item from list
        setEducationItems(prev => prev.filter(item => item.id !== educationId));
      }
    } catch (err) {
      console.error('Failed to delete education item:', err);
      setError('Failed to delete education item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Manage Education</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          Add Education
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Form for adding/editing education */}
      {isFormOpen && (
        <div className="mb-8 p-4 bg-background rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-4">
            {editingEducation ? 'Edit Education' : 'Add New Education'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="institution" className="block text-sm font-medium mb-1">Institution</label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">Degree/Certificate Title</label>
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
              <label htmlFor="skills" className="block text-sm font-medium mb-1">Skills Acquired (comma-separated)</label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills.join(', ')}
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
                {editingEducation ? 'Update Education' : 'Add Education'}
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

      {/* Education items list */}
      {loading && !educationItems.length ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {educationItems.length === 0 ? (
            <p className="text-center py-8 text-foreground/70">No education items found. Add your first education item!</p>
          ) : (
            educationItems.map(item => (
              <div key={item.id} className="border border-border/50 rounded-lg p-4 bg-background/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="text-foreground/80">{item.institution}</p>
                    <div className="text-sm text-foreground/60 mt-1">
                      {new Date(item.timeline.start).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} — 
                      {item.timeline.end 
                        ? new Date(item.timeline.end).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                        : 'Present'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(item)}
                      className="p-1 text-foreground/70 hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-foreground/70 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-foreground/70 mt-3 mb-3">{item.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {item.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-card text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EducationAdmin;
