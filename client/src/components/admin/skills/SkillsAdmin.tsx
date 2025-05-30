import React, { useState, useEffect } from 'react';
import { Skill, SkillCategory } from '../../../types';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../../../services/api';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { iconMap } from '../../ui/iconMap';

interface SkillsAdminProps {
  token: string | null;
}

const SkillsAdmin: React.FC<SkillsAdminProps> = ({ token }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [formData, setFormData] = useState<Omit<Skill, 'id'>>({
    name: '',
    category: 'Frontend',
    proficiency: 5,
    icon: 'code',
  });

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const response = await getSkills();
        if (response.error) {
          setError(response.error);
        } else {
          setSkills(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        setError('Failed to load skills.');
      } finally {
        setLoading(false);
      }
    }; fetchSkills();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'proficiency') {
      // Convert to number and clamp between 1-10
      const numValue = Math.max(1, Math.min(10, Number(value) || 1));
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'name') {
      // Auto-suggest an icon based on the skill name
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Only suggest icon if it's currently the default or empty
        ...(prev.icon === 'code' || prev.icon === '' ? { icon: suggestIconName(value) } : {})
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Frontend',
      proficiency: 5,
      icon: 'code',
    });
    setEditingSkill(null);
    setIsFormOpen(false);
  };

  const openEditForm = (skill: Skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      icon: skill.icon,
    });
    setEditingSkill(skill);
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
      if (editingSkill && editingSkill.id) {
        // Update existing skill
        console.log("Updating skill with ID:", editingSkill.id);
        const response = await updateSkill(editingSkill.id, formData, token);
        if (response.error) {
          setError(response.error);
        } else {
          // Update skills list
          setSkills(prev =>
            prev.map(skill =>
              skill.id === editingSkill.id ? response.data : skill
            )
          );
          resetForm();
        }
      } else {
        // Create new skill
        const response = await createSkill(formData, token);
        if (response.error) {
          setError(response.error);
        } else {
          // Add new skill to list
          setSkills(prev => [...prev, response.data]);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Failed to save skill:', err);
      setError('Failed to save skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await deleteSkill(skillId, token);
      if (response.error) {
        setError(response.error);
      } else {
        // Remove skill from list
        setSkills(prev => prev.filter(skill => skill.id !== skillId));
      }
    } catch (err) {
      console.error('Failed to delete skill:', err);
      setError('Failed to delete skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      setError('Icon must be PNG, JPEG, or SVG');
      return;
    }

    // Try to use a simple icon name instead of large base64 data
    // This helps prevent large data uploads
    const simplifiedIconName = file.name
      .toLowerCase()
      .replace(/\.(png|jpg|jpeg|svg)$/, '')
      .replace(/[^a-z0-9-]/g, '-');

    // Only use simplified icon name if it's valid
    if (/^[a-zA-Z0-9-]+$/.test(simplifiedIconName)) {
      setFormData(prev => ({ ...prev, icon: simplifiedIconName }));
      return;
    }

    // If we can't use a simplified name, fall back to base64 but keep it small
    // Validate file size (100KB limit)
    if (file.size > 100 * 1024) {
      setError('Icon file size must be under 100KB');
      return;
    }

    // Convert to base64 (only for small files)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, icon: base64String }));
    }; reader.readAsDataURL(file);
  };

  const skillCategories: SkillCategory[] = [
    'Frontend',
    'Backend',
    'Database',
    'DevOps',
    'Languages',
    'Design',
    'Other'
  ];

  // Helper function to suggest icon name based on skill name
  const suggestIconName = (skillName: string): string => {
    if (!skillName) return 'default';

    const name = skillName.toLowerCase().trim();

    // Common mappings for exact and partial matches
    const commonMappings: Record<string, string> = {
      'apache tomcat': 'tomcat',
      'tomcat': 'tomcat',
      'apache': 'tomcat',
      'php': 'php',
      'express.js': 'express',
      'express js': 'express',
      'express': 'express',
      'node.js': 'node',
      'nodejs': 'node',
      'node': 'node',
      'spring boot': 'springboot',
      'spring': 'springboot',
      'springboot': 'springboot',
      'mongodb': 'mongodb',
      'mongo': 'mongodb',
      'mysql': 'mysql',
      'canva': 'canva',
      'figma': 'figma',
      'illustrator': 'illustrator',
      'adobe illustrator': 'illustrator',
      'photoshop': 'photoshop',
      'adobe photoshop': 'photoshop',
      'git': 'git',
      'github': 'github',
      'vercel': 'vercel',
      'railway': 'railway',
      'docker': 'docker',
      'html': 'html',
      'html5': 'html',
      'css': 'css',
      'css3': 'css',
      'react': 'react',
      'tailwind': 'tailwind',
      'tailwindcss': 'tailwind',
      'tailwind css': 'tailwind',
      'javascript': 'javascript',
      'js': 'javascript',
      'chart.js': 'chartjs',
      'chartjs': 'chartjs',
      'bootstrap': 'bootstrap',
      'java': 'java',
      'python': 'python',
      'javafx': 'javafx',
      'c': 'c',
      'c++': 'c++',
      'c#': 'c#',
      'c sharp': 'c#',
      'csharp': 'c#',
      'kotlin': 'kotlin',
      'postman': 'postman',
      'wordpress': 'wordpress',
      'twilio': 'twilio'
    };

    if (commonMappings[name]) {
      return commonMappings[name];
    }

    // Try to find exact match in iconMap keys
    const availableIcons = Object.keys(iconMap);
    const exactMatch = availableIcons.find(key => key === name);
    if (exactMatch) return exactMatch;

    // Try to find partial match
    // First check if any key contains the name
    let partialMatch = availableIcons.find(key => key.includes(name));
    if (partialMatch) return partialMatch;

    // Then check if name contains any key
    partialMatch = availableIcons.find(key => name.includes(key) && key.length > 2); // Only consider keys longer than 2 chars
    if (partialMatch) return partialMatch;

    return 'default';
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Manage Skills</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          Add Skill
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Form for adding/editing skills */}
      {isFormOpen && (
        <div className="mb-8 p-4 bg-background rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-4">
            {editingSkill ? 'Edit Skill' : 'Add New Skill'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Skill Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {skillCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="proficiency" className="block text-sm font-medium mb-1">Proficiency (1-10)</label>
              <input
                type="number"
                id="proficiency"
                name="proficiency"
                value={formData.proficiency}
                onChange={handleChange}
                required
                min="1"
                max="10"
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>            <div>
              <label htmlFor="icon" className="block text-sm font-medium mb-1">Icon</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="icon-name or URL"
                    className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10"
                    list="iconSuggestions"
                  />
                  {iconMap[formData.icon] && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xl">
                      {React.createElement(iconMap[formData.icon])}
                    </div>
                  )}
                  <datalist id="iconSuggestions">
                    {Object.keys(iconMap).map(iconKey => (
                      <option key={iconKey} value={iconKey} />
                    ))}
                  </datalist>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    id="iconUpload"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleIconUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Upload
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-foreground/60">
                Enter an icon name (e.g., 'react', 'node', 'java'), or select from available options
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {editingSkill ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  editingSkill ? 'Update Skill' : 'Add Skill'
                )}
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

      {/* Skills table */}
      {loading && !skills.length ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-background">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Proficiency</th>
                <th className="py-3 px-4 text-left">Icon</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-foreground/70">
                    No skills found. Add your first skill!
                  </td>
                </tr>
              ) : (
                skills.map(skill => (
                  <tr key={skill.id} className="border-b border-border/50 hover:bg-background/50">
                    <td className="py-3 px-4">{skill.name}</td>
                    <td className="py-3 px-4">{skill.category}</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(skill.proficiency / 10) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">{skill.icon}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(skill)}
                          className="p-1 text-foreground/70 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="p-1 text-foreground/70 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SkillsAdmin;
