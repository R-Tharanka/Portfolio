import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Skill, SkillCategory } from '../../types';
import { useApiService } from '../../hooks/useApiService';
import { Loader2 } from 'lucide-react';
import SkillsSphere from '../ui/SkillsSphere';
import SemicircularFilters from '../ui/SemicircularFilters';
import { iconMap } from '../ui/iconMap';

const categories: SkillCategory[] = ['Frontend', 'Backend', 'Database', 'DevOps', 'Languages', 'Design', 'Other'];

const SkillsSection: React.FC = () => {
  const { getSkills } = useApiService();
  const [activeCategory, setActiveCategory] = useState<SkillCategory | null>(null);
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

  const filteredSkills = activeCategory
    ? skills.filter(skill => skill.category === activeCategory)
    : [];

  const handleCategorySelect = (category: SkillCategory | null) => {
    setActiveCategory(category);
  };

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

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-foreground/70 p-8 min-h-[400px] flex items-center justify-center">
              <div>
                <p className="text-xl mb-2">Could Not Load Skills</p>
                <p>{error}</p>
              </div>
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center text-foreground/70 min-h-[400px] flex items-center justify-center">
              <p>No skills data available.</p>
            </div>
          ) : (
            <>
              {/* Main Content Container */}
              <div className="relative min-h-[600px] bg-card/30 rounded-xl overflow-hidden flex flex-col lg:flex-row" style={{ zIndex: 1 }}>
                {/* 3D Skills Sphere - Reduced width */}
                <div className="flex-1 lg:flex-none lg:w-2/3 relative" style={{ zIndex: 1 }}>
                  <div className={activeCategory ? "transition-all duration-500 blur-sm opacity-40 pointer-events-none" : "transition-all duration-500"}>
                    <Suspense fallback={
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" />
                      </div>
                    }>
                      <SkillsSphere
                        skills={skills}
                        filteredSkills={filteredSkills}
                        activeCategory={activeCategory}
                      />
                    </Suspense>
                  </div>
                  {/* Filtered Grid Overlay */}
                  {activeCategory && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 40 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex flex-col items-center justify-center z-20"
                      style={{ background: 'rgba(16,20,30,0.85)', borderRadius: 'inherit' }}
                    >
                      <h3 className="text-xl font-semibold mb-4 text-primary">{activeCategory} Skills & Tech</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-2xl mx-auto">
                        {filteredSkills.map(skill => {
                          const IconComponent = skill.icon && skill.icon in iconMap ? iconMap[skill.icon] : iconMap['default'];
                          return (
                            <div key={skill.name} className="flex flex-col items-center justify-center bg-card/60 rounded-lg p-3 shadow-md">
                              <div className="mb-2 flex items-center justify-center" style={{ width: 40, height: 40 }}>
                                <IconComponent className="w-full h-full text-primary" />
                              </div>
                              <span className="text-xs text-center font-medium text-foreground/90">{skill.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Semicircular Category Filters - Increased width */}
                <div className="w-full lg:w-1/3 flex items-center justify-center lg:justify-start lg:pl-4 py-4 lg:py-0">
                  <SemicircularFilters
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategorySelect={handleCategorySelect}
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;