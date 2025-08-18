import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Skill, SkillCategory } from '../../types';
import { useApiService } from '../../hooks/useApiService';
import { Loader2 } from 'lucide-react';
import SkillsSphere from '../ui/SkillsSphere';
import SemicircularFilters from '../ui/SemicircularFilters';

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
                {/* 3D Skills Sphere */}
                <div className="flex-1 lg:flex-1" style={{ zIndex: 1 }}>
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

                {/* Semicircular Category Filters - Right Side on Desktop, Bottom on Mobile */}
                <div className="w-full lg:w-80 flex items-center justify-center lg:justify-start lg:pl-4 py-4 lg:py-0">
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