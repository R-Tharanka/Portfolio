import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Skill, SkillCategory } from '../../types';

const mockSkills: Skill[] = [
  { id: '1', name: 'React', category: 'Frontend', proficiency: 9, icon: 'react' },
  { id: '2', name: 'TypeScript', category: 'Frontend', proficiency: 8, icon: 'typescript' },
  { id: '3', name: 'JavaScript', category: 'Frontend', proficiency: 9, icon: 'javascript' },
  { id: '4', name: 'HTML5', category: 'Frontend', proficiency: 9, icon: 'html' },
  { id: '5', name: 'CSS3', category: 'Frontend', proficiency: 8, icon: 'css' },
  { id: '6', name: 'Node.js', category: 'Backend', proficiency: 8, icon: 'node' },
  { id: '7', name: 'Express', category: 'Backend', proficiency: 7, icon: 'express' },
  { id: '8', name: 'MongoDB', category: 'Database', proficiency: 7, icon: 'mongodb' },
  { id: '9', name: 'PostgreSQL', category: 'Database', proficiency: 6, icon: 'postgresql' },
  { id: '10', name: 'Docker', category: 'DevOps', proficiency: 6, icon: 'docker' },
  { id: '11', name: 'AWS', category: 'DevOps', proficiency: 5, icon: 'aws' },
  { id: '12', name: 'Redux', category: 'Frontend', proficiency: 7, icon: 'redux' },
  { id: '13', name: 'GraphQL', category: 'Backend', proficiency: 6, icon: 'graphql' },
  { id: '14', name: 'Figma', category: 'Design', proficiency: 7, icon: 'figma' },
];

const categories: SkillCategory[] = ['Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Other'];

const SkillsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'All'>('All');
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const filteredSkills = activeCategory === 'All' 
    ? mockSkills 
    : mockSkills.filter(skill => skill.category === activeCategory);

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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'All' 
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category 
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
                        {/* This would normally be an actual icon, using emoji as placeholder */}
                        {getSkillEmoji(skill.icon)}
                      </div>
                      <span className="text-xs font-medium text-center">{skill.name}</span>
                      
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-card text-foreground text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-border/50">
                        {skill.name} - {skill.proficiency}/10
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Helper function to return emoji based on skill name (in a real app, this would be proper icons)
const getSkillEmoji = (icon: string): string => {
  const iconMap: Record<string, string> = {
    react: '⚛️',
    typescript: '📘',
    javascript: '📙',
    html: '🌐',
    css: '🎨',
    node: '🟢',
    express: '🚂',
    mongodb: '🍃',
    postgresql: '🐘',
    docker: '🐳',
    aws: '☁️',
    redux: '🔄',
    graphql: '📊',
    figma: '🖌️',
  };
  
  return iconMap[icon] || '🔧';
};

export default SkillsSection;