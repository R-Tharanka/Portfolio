import React from 'react';
import { motion } from 'framer-motion';
import { SkillCategory } from '../../types';

interface SemicircularFiltersProps {
  categories: SkillCategory[];
  activeCategory: SkillCategory | null;
  onCategorySelect: (category: SkillCategory | null) => void;
}

const SemicircularFilters: React.FC<SemicircularFiltersProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
}) => {
  const radius = 200; // Radius of the semicircle
  const centerX = 0;
  const centerY = 0;

  // Calculate positions for each button along the semicircle
  const getButtonPosition = (index: number, total: number) => {
    // Distribute buttons along a semicircle (180 degrees)
    const angle = (Math.PI * index) / (total - 1);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY - radius * Math.sin(angle) + radius; // Flip and offset
    
    return { x, y, angle };
  };

  const handleCategoryClick = (category: SkillCategory) => {
    if (activeCategory === category) {
      // Deactivate if clicking the same category
      onCategorySelect(null);
    } else {
      // Activate the new category
      onCategorySelect(category);
    }
  };

  return (
    <div className="relative w-full h-64 flex items-center justify-center mb-12">
      <div className="relative" style={{ width: radius * 2 + 200, height: radius + 100 }}>
        {categories.map((category, index) => {
          const { x, y } = getButtonPosition(index, categories.length);
          const isActive = activeCategory === category;
          
          return (
            <motion.button
              key={category}
              className={`absolute px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                isActive
                  ? 'bg-primary text-white shadow-lg scale-110'
                  : 'bg-card hover:bg-card/80 text-foreground hover:scale-105'
              }`}
              style={{
                left: x + radius + 100,
                top: y + 50,
              }}
              onClick={() => handleCategoryClick(category)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: index * 0.1,
              }}
              whileHover={{ 
                scale: isActive ? 1.1 : 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
        
        {/* Decorative semicircle line */}
        <svg
          className="absolute inset-0 pointer-events-none opacity-20"
          width="100%"
          height="100%"
          style={{ left: 0, top: 0 }}
        >
          <defs>
            <linearGradient id="semicircleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d={`M ${100} ${radius + 50} A ${radius} ${radius} 0 0 1 ${radius * 2 + 100} ${radius + 50}`}
            stroke="url(#semicircleGradient)"
            strokeWidth="2"
            fill="none"
            className="text-primary"
          />
        </svg>
      </div>
    </div>
  );
};

export default SemicircularFilters;
