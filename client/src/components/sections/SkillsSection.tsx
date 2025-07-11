import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Skill, SkillCategory } from '../../types';
import { useApiService } from '../../hooks/useApiService';
import { Loader2 } from 'lucide-react';
import { iconMap } from '../ui/iconMap';

// Function to get the closest matching icon component
const getIconComponent = (iconName: string) => {
  if (!iconName) return iconMap['default'];

  // Normalize the icon name (lowercase, trim whitespace)
  const normalizedName = iconName.toLowerCase().trim();

  // Direct match
  if (iconMap[normalizedName]) return iconMap[normalizedName];

  // Check common variations
  const commonVariations: Record<string, string> = {
    'apache tomcat': 'tomcat',
    'express.js': 'express',
    'express js': 'express',
    'node.js': 'node',
    'nodejs': 'node',
    'spring boot': 'springboot',
    'tailwind': 'tailwind',
    'tailwindcss': 'tailwind',
    'tailwind css': 'tailwind',
    'chart.js': 'chartjs',
    'c++': 'c++',
    'c#': 'c#',
    'c sharp': 'c#',
    'js': 'javascript'
  };

  if (commonVariations[normalizedName] && iconMap[commonVariations[normalizedName]]) {
    return iconMap[commonVariations[normalizedName]];
  }

  // Try to find partial match
  const iconKeys = Object.keys(iconMap);
  for (const key of iconKeys) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return iconMap[key];
    }
  }

  // Return default icon if no match found
  return iconMap['default'];
};

const categories: SkillCategory[] = ['Frontend', 'Backend', 'Database', 'DevOps', 'Languages', 'Design', 'Other'];

const SkillsSection: React.FC = () => {
  const { getSkills } = useApiService();
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'All'>('All');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const response = await getSkills();
        if (response.error) {
          setError(response.error);
          setSkills(response.data); // Fallback data is already included in the response
        } else {
          setSkills(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        setError('Failed to load skills. Using fallback data.');
        setSkills([]); // Empty array if all else fails
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const filteredSkills = activeCategory === 'All'
    ? skills
    : skills.filter(skill => skill.category === activeCategory);

  return (
    <section id="skills" className=" bg-background/50 relative">
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Skills & Technologies</h2>
          <p className="section-subtitle">
            Here are the technologies I work with to bring ideas to life
          </p>

          {/* Category Filter Bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'All'
                ? 'bg-primary text-white'
                : 'bg-card hover:bg-card/80 text-foreground'
                }`}
            >
              All
            </button>

            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-card hover:bg-card/80 text-foreground'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Skills Cloud */}
          <div className="relative min-h-[400px] bg-card/30 rounded-xl p-8 flex items-center justify-center">
            {loading ? (
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
            ) : error ? (
              <div className="text-center text-foreground/70 p-8">
                <p className="text-xl mb-2">Could Not Load Skills</p>
                <p>{error}</p>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="text-center text-foreground/70">
                <p>No skills data available for the selected category.</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  className="w-full h-full flex flex-wrap justify-center items-center gap-4 md:gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredSkills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      className="relative group"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        delay: Math.random() * 0.3
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <div
                        className={`flex flex-col items-center justify-center p-4 bg-card rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-border/50 hover:border-primary/30`}
                        style={{
                          width: `${Math.max(skill.proficiency * 12, 80)}px`,
                          height: `${Math.max(skill.proficiency * 12, 80)}px`,
                        }}
                      >
                        <div className="text-4xl mb-2">
                          {React.createElement(getIconComponent(skill.icon), { className: "text-4xl mb-2" })}
                        </div>
                        <span className="text-xs font-medium text-center">{skill.name}</span>

                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-card text-foreground text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-border/50">
                          {/*{skill.name} - {skill.proficiency}/10 */}
                          {skill.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Using React Icons components from iconMap.tsx instead of emojis

export default SkillsSection;