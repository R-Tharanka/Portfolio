import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Skill, SkillCategory } from '../../types';
import { useApiService } from '../../hooks/useApiService';
import { Loader2 } from 'lucide-react';

// Lazy load the 3D component to improve initial page load performance
const SkillsSphere = React.lazy(() => import('../ui/SkillsSphere'));

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

          {/* 3D Skills Sphere */}
          <div className="relative min-h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center h-[600px] bg-card/30 rounded-xl">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-foreground/70 p-8 bg-card/30 rounded-xl h-[600px] flex items-center justify-center">
                <div>
                  <p className="text-xl mb-2">Could Not Load Skills</p>
                  <p>{error}</p>
                </div>
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center text-foreground/70 bg-card/30 rounded-xl h-[600px] flex items-center justify-center">
                <p>No skills data available.</p>
              </div>
            ) : (
              <Suspense fallback={
                <div className="flex items-center justify-center h-[600px] bg-card/30 rounded-xl">
                  <Loader2 className="animate-spin h-10 w-10 text-primary" />
                </div>
              }>
                <SkillsSphere 
                  skills={skills} 
                  activeCategory={activeCategory} 
                  onCategoryChange={(category) => setActiveCategory(
                    category === activeCategory ? null : category
                  )} 
                />
              </Suspense>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Using React Icons components from iconMap.tsx instead of emojis

export default SkillsSection;