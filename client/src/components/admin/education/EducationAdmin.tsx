import React, { useState, useEffect } from 'react';
import { Education } from '../../../types';
import { getEducation, createEducation, updateEducation, deleteEducation } from '../../../services/api';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import logger from '../../../utils/logger';

interface EducationAdminProps {
  token: string | null;
}

const EducationAdmin: React.FC<EducationAdminProps> = ({ token }) => {
  const [educationItems, setEducationItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
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
          logger.log('Fetched education items:', response.data);

          // Verify all items have IDs
          const missingIds = response.data.filter(item => !item.id);
          if (missingIds.length > 0) {
            logger.warn('Some education items are missing IDs:', missingIds);
          }

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
    // Ensure we have a valid ID (either id or _id from MongoDB)
    const educationId = education.id || (education as any)._id;
    console.log('Opening edit form for education with ID:', educationId);

    // Ensure the education object has a valid ID
    if (!educationId) {
      console.error('Education item has no ID:', education);
      setError('Cannot edit this education item: Missing ID');
      return;
    }

    // Create a copy of the education object with the properly set ID
    const educationWithId = {
      ...education,
      id: educationId
    };

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
    setEditingEducation(educationWithId);
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
        // Get the education ID (could be in id or _id)
        const educationId = editingEducation.id || (editingEducation as any)._id;

        // Log the education being updated
        console.log('Attempting to update education:', editingEducation);
        console.log('Using education ID:', educationId);

        // Check if we have a valid ID before attempting to update
        if (!educationId) {
          console.error('Missing ID in editingEducation:', editingEducation);
          setError('Cannot update education: Missing ID');
          setLoading(false);
          return;
        }

        // Update existing education item
        const response = await updateEducation(educationId, formData, token);
        if (response.error) {
          setError(response.error);
        } else {
          console.log('Successfully updated education item:', response.data);

          // Update education list, ensuring we match by the correct ID
          setEducationItems(prev =>
            prev.map(item => {
              const itemId = item.id || (item as any)._id;
              return itemId === educationId ? response.data : item;
            })
          );
          resetForm();
        }
      } else {
        // Create new education item
        const response = await createEducation(formData, token);
        if (response.error) {
          setError(response.error);
        } else {
          console.log('Successfully created education item:', response.data);

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
  }; const handleDeleteRequest = (educationId: string) => {
    // Open the confirmation dialog with the ID to delete
    setConfirmDelete({ show: true, id: educationId });
  };

  const handleDelete = async (educationId: string) => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }

    // Ensure we have a valid ID to work with
    if (!educationId) {
      console.error('Attempted to delete education with invalid ID:', educationId);
      setError('Cannot delete this education item: Missing ID');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to delete education with ID:', educationId);

      // Check if the ID format is valid for MongoDB (24 character hex)
      if (!educationId.match(/^[0-9a-fA-F]{24}$/)) {
        console.error(`Invalid MongoDB ObjectId format: ${educationId}`);
        setError('Cannot delete: Invalid ID format');
        setLoading(false);
        return;
      }

      const response = await deleteEducation(educationId, token);

      if (response.error) {
        console.error('Error returned from deleteEducation:', response.error);
        setError(response.error);
      } else {
        console.log('Successfully deleted education item:', educationId);
        // Remove education item from list - match by either id or _id
        setEducationItems(prev => prev.filter(item => {
          const itemId = item.id || (item as any)._id;
          return itemId !== educationId;
        }));
        setError(null); // Clear any existing errors
      }
    } catch (err: any) {
      console.error('Failed to delete education item:', err);
      setError(err?.message || 'Failed to delete education item. Please try again.');
    } finally {
      setLoading(false);
      // Close the confirmation dialog
      setConfirmDelete({ show: false, id: null });
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

      {/* Confirmation Dialog */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-foreground/80 mb-6">Are you sure you want to delete this education item? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete({ show: false, id: null })}
                className="px-4 py-2 bg-background text-foreground rounded-md hover:bg-background/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete.id && handleDelete(confirmDelete.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
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
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description
                <span className="text-foreground/50 text-xs">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
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
              <label htmlFor="skills" className="block text-sm font-medium mb-1">Skills Acquired
                <span className="text-foreground/50 text-xs">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-card border border-border rounded-md focus-within:ring-1 focus-within:ring-primary">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center bg-background/80 px-2 py-1 rounded-md">
                    <span className="text-sm">{skill}</span>
                    <button
                      type="button"
                      className="ml-1 text-foreground/60 hover:text-red-500"
                      onClick={() => {
                        const updatedSkills = [...formData.skills];
                        updatedSkills.splice(index, 1);
                        setFormData(prev => ({ ...prev, skills: updatedSkills }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  id="skillInput"
                  placeholder="Type skill and press Enter or comma"
                  className="flex-grow outline-none bg-transparent min-w-[180px] py-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const value = input.value.trim();

                      if (value) {
                        setFormData(prev => ({
                          ...prev,
                          skills: [...prev.skills, value]
                        }));
                        input.value = '';
                      }
                    } else if (e.key === ',') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const value = input.value.trim();

                      if (value) {
                        setFormData(prev => ({
                          ...prev,
                          skills: [...prev.skills, value]
                        }));
                        input.value = '';
                      }
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    // If user types a comma, create a new skill
                    if (value.includes(',')) {
                      const skillParts = value.split(',');
                      const newSkill = skillParts[0].trim();

                      if (newSkill) {
                        setFormData(prev => ({
                          ...prev,
                          skills: [...prev.skills, newSkill]
                        }));
                        e.target.value = skillParts.slice(1).join(',').trim();
                      } else {
                        e.target.value = skillParts.slice(1).join(',');
                      }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-foreground/60 mt-1">Press Enter or comma to add a skill</p>
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
            educationItems.map(item => {
              // Ensure item has an id for the key and delete operation
              const itemId = item.id || (item as any)._id;
              if (!itemId) {
                console.warn('Education item missing ID:', item);
              }

              return (
                <div key={itemId} className="border border-border/50 rounded-lg p-4 bg-background/50">
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
                      </button>                      <button
                        onClick={() => handleDeleteRequest(itemId)}
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
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default EducationAdmin;
