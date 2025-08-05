import React, { useState, useEffect } from 'react';
import { Skill, SkillCategory } from '../../../types';
import { getSkills, createSkill } from '../../../services/api';
import { updateSkillFixed, deleteSkillFixed } from '../../../services/skillsService';
import { Loader2, Plus, Pencil, Trash2, X, BarChart2, Award, Grid, PieChart } from 'lucide-react';
import { iconMap } from '../../ui/iconMap';
import toast from 'react-hot-toast';

// Simple Dialog component for delete confirmation
const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  skill
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  skill: Skill | null
}) => {
  if (!isOpen || !skill) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Confirm Deletion</h3>
          <button
            onClick={onClose}
            className="text-foreground/70 hover:text-foreground"
            aria-label="Close dialog"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-2">Are you sure you want to delete this skill?</p>
          <div className="bg-background/50 p-2 rounded">
            <p className="font-medium">{skill.name}</p>
            <p className="text-sm text-foreground/70">{skill.category}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-background"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Skills Overview component
const SkillsOverview: React.FC<{ skills: Skill[] }> = ({ skills }) => {
  // Calculate statistics
  const totalSkills = skills.length;
  const avgProficiency = totalSkills
    ? Number((skills.reduce((sum, skill) => sum + skill.proficiency, 0) / totalSkills).toFixed(1))
    : 0;

  // Count skills by category
  const categoryCounts = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find highest proficiency skills
  const topSkills = [...skills]
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, 3)
    .map(skill => ({ name: skill.name, proficiency: skill.proficiency }));

  // Calculate proficiency distribution
  const proficiencyDistribution = {
    beginner: skills.filter(skill => skill.proficiency >= 1 && skill.proficiency <= 3).length,
    intermediate: skills.filter(skill => skill.proficiency >= 4 && skill.proficiency <= 6).length,
    advanced: skills.filter(skill => skill.proficiency >= 7 && skill.proficiency <= 9).length,
    expert: skills.filter(skill => skill.proficiency === 10).length
  };

  // Get recently added skills (assuming the skills array is ordered by creation date)
  // In a real app, you might want to sort by creation date if available
  const recentSkills = [...skills].slice(-3);

  return (
    <div className="mb-8 bg-background rounded-lg border border-border p-4">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <BarChart2 className="mr-2 h-5 w-5 text-primary" />
        Skills Overview
      </h3>

      {/* Skills Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Skills Card */}
        <div className="bg-card p-4 rounded-lg border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground/70">Total Skills</h4>
            <Grid className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{totalSkills}</p>
        </div>

        {/* Average Proficiency Card */}
        <div className="bg-card p-4 rounded-lg border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground/70">Avg Proficiency</h4>
            <Award className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{avgProficiency}/10</p>
        </div>

        {/* Category Distribution Card */}
        <div className="bg-card p-4 rounded-lg border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground/70">Categories</h4>
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-2 space-y-1 text-sm">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([category, count]) => (
                <div key={category} className="flex justify-between">
                  <span>{category}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            {Object.keys(categoryCounts).length > 3 && (
              <div className="text-xs text-foreground/60 text-right mt-1">
                +{Object.keys(categoryCounts).length - 3} more
              </div>
            )}
          </div>
        </div>

        {/* Top Skills Card */}
        <div className="bg-card p-4 rounded-lg border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground/70">Top Skills</h4>
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-2 space-y-1 text-sm">
            {topSkills.map(skill => (
              <div key={skill.name} className="flex justify-between">
                <span>{skill.name}</span>
                <span className="font-medium">{skill.proficiency}/10</span>
              </div>
            ))}
            {!topSkills.length && (
              <p className="text-foreground/60">No skills added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">          {/* Proficiency Distribution */}
        <div className="bg-card p-4 rounded-lg border border-border/50 shadow-sm">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <BarChart2 className="mr-2 h-4 w-4 text-primary" />
            Proficiency Distribution
          </h4>
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs">Expert (10)</div>
              <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                <div
                  className={`h-full bg-green-500 rounded-full ${totalSkills ? '' : 'w-0'}`}
                  style={{ width: totalSkills ? `${(proficiencyDistribution.expert / totalSkills) * 100}%` : '0%' }}
                ></div>
              </div>
              <div className="text-xs font-medium w-8 text-right">{proficiencyDistribution.expert}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs">Advanced (7-9)</div>
              <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">                <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: totalSkills ? `${(proficiencyDistribution.advanced / totalSkills) * 100}%` : '0%' }}
              ></div>
              </div>
              <div className="text-xs font-medium w-8 text-right">{proficiencyDistribution.advanced}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs">Intermediate (4-6)</div>
              <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">                <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: totalSkills ? `${(proficiencyDistribution.intermediate / totalSkills) * 100}%` : '0%' }}
              ></div>
              </div>
              <div className="text-xs font-medium w-8 text-right">{proficiencyDistribution.intermediate}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs">Beginner (1-3)</div>
              <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: totalSkills ? `${(proficiencyDistribution.beginner / totalSkills) * 100}%` : '0%' }}
                ></div>
              </div>
              <div className="text-xs font-medium w-8 text-right">{proficiencyDistribution.beginner}</div>
            </div>
          </div>
        </div>

        {/* Recent Skills */}
        <div className="bg-card p-4 rounded-lg border border-border/50 shadow-sm">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <Plus className="mr-2 h-4 w-4 text-primary" />
            Recently Added Skills
          </h4>
          {recentSkills.length > 0 ? (
            <div className="divide-y divide-border/50">
              {recentSkills.map((skill, i) => (
                <div key={skill.id || i} className="py-2 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{skill.name}</div>
                    <div className="text-xs text-foreground/70">{skill.category}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                      {skill.proficiency}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">No skills added yet</p>
          )}
        </div>

        {/* Category Distribution Visualization */}
        <div className="bg-card p-4 rounded-lg border border-border/50 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <PieChart className="mr-2 h-4 w-4 text-primary" />
            Category Distribution
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className="p-3 border border-border/50 rounded-md">
                <div className="text-sm font-medium">{category}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xl font-bold">{count}</div>
                  <div className="text-xs text-foreground/70">
                    {Math.round((count / totalSkills) * 100)}%
                  </div>
                </div>
                <div className="w-full h-1 bg-background mt-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(count / totalSkills) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SkillsAdminProps {
  token: string | null;
}

const SkillsAdmin: React.FC<SkillsAdminProps> = ({ token }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    };
    fetchSkills();
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
    // Ensure we have a valid ID (either id or _id from MongoDB)
    const skillId = skill.id || (skill as any)._id;

    console.log('Opening edit form for skill:', skill);
    console.log('Skill ID:', skillId);

    // Create a copy of the skill object with the properly set ID
    const skillWithId = {
      ...skill,
      id: skillId
    };

    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      icon: skill.icon,
    });
    setEditingSkill(skillWithId);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }

    setLoading(true);
    console.log('Form submission - editingSkill:', editingSkill);
    try {
      if (editingSkill && editingSkill.id) {
        // Update existing skill
        console.log("Updating skill with ID:", editingSkill.id);
        console.log("Skill object being edited:", editingSkill);
        console.log("Form data being sent:", formData);
        console.log("Token available:", !!token);
        const skillId = editingSkill.id;

        // Double check the ID is a valid string
        if (typeof skillId !== 'string' || !skillId.trim()) {
          setError('Invalid skill ID. Cannot update skill.');
          setLoading(false);
          return;
        }

        // Use our fixed update function
        const response = await updateSkillFixed(skillId, formData, token);
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
  }; const handleDeleteRequest = (skill: Skill) => {
    console.log('Delete requested for skill:', skill);

    // Make sure we capture the ID properly (could be id or _id from MongoDB)
    const skillId = skill?.id || (skill as any)?._id;
    console.log('Skill ID:', skillId);

    // Create a normalized skill object with the id properly set
    const normalizedSkill = {
      ...skill,
      id: skillId
    };

    setSkillToDelete(normalizedSkill);
    setIsDeleteDialogOpen(true);
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
    };
    reader.readAsDataURL(file);
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

      {/* Overview section */}
      <SkillsOverview skills={skills} />

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
            </div>

            <div>
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
                    title="Upload icon image"
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
                        </button>                        <button
                          onClick={() => handleDeleteRequest(skill)}
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

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSkillToDelete(null);
        }}
        onConfirm={() => {
          // Store skill in local variable to prevent it from being lost during async operation
          const skillToBeDeleted = skillToDelete;

          console.log('Delete confirmation clicked');
          console.log('Token available:', !!token);
          console.log('skillToDelete:', skillToBeDeleted);
          console.log('skillToDelete.id:', skillToBeDeleted?.id); if (!token) {
            const errorMsg = 'Authentication token is missing. Please log in again.';
            setError(errorMsg);
            toast.error(errorMsg);
            setIsDeleteDialogOpen(false);
            setSkillToDelete(null);
            return;
          }

          if (skillToBeDeleted) {
            // Get skill ID from either id or _id property (MongoDB might return _id)
            const skillId = skillToBeDeleted.id || (skillToBeDeleted as any)._id;

            if (!skillId) {
              const errorMsg = 'Could not determine skill ID. Please refresh the page and try again.';
              console.error('No valid ID found in skill object:', skillToBeDeleted);
              setError(errorMsg);
              toast.error(errorMsg); setIsDeleteDialogOpen(false);
              setSkillToDelete(null);
              return;
            }

            console.log('Proceeding with deletion using ID:', skillId);

            setLoading(true);          // Show loading toast while deleting
            toast.loading('Deleting skill...', { id: 'deleteSkill' });

            // Execute the deletion asynchronously
            deleteSkillFixed(skillId, token)
              .then(response => {
                if (response.error) {
                  setError(response.error);
                  // Show error toast
                  toast.error(`Failed to delete skill: ${response.error}`, { id: 'deleteSkill' });
                } else {
                  // Remove skill from list
                  setSkills(prev => prev.filter(skill => {
                    const currentId = skill.id || (skill as any)._id;
                    return currentId !== skillId;
                  }));
                  // Show success toast
                  toast.success('Skill deleted successfully!', { id: 'deleteSkill' });
                }
              })
              .catch(err => {
                console.error('Failed to delete skill:', err);
                setError('Failed to delete skill. Please try again.');
                // Show error toast
                toast.error('Failed to delete skill. Please try again.', { id: 'deleteSkill' });
              }).finally(() => {
                setLoading(false);
                setIsDeleteDialogOpen(false);
                setSkillToDelete(null);
              });
          } else {
            const errorMsg = 'Invalid skill selected for deletion. Please try again.';
            console.error('No skill object found when trying to delete');
            setError(errorMsg);
            toast.error(errorMsg);
            setIsDeleteDialogOpen(false);
            setSkillToDelete(null);
          }
        }}
        skill={skillToDelete}
      />
    </div>
  );
};

export default SkillsAdmin;
