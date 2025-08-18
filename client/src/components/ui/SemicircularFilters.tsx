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
  const radius = 150; // Radius of the semicircle
  const centerX = 0;
  const centerY = 0;

  // Calculate positions for each button along the semicircle pointing right
  const getButtonPosition = (index: number, total: number) => {
    // Distribute buttons along a semicircle (180 degrees) starting from top going to bottom
    // Rotate the semicircle to point to the right (open side towards page border)
    const angle = (Math.PI * index) / (total - 1) - Math.PI / 2; // -90 to +90 degrees
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
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
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative" style={{ width: Math.min(radius + 100, 300), height: Math.min(radius * 2 + 100, 400) }}>
        {categories.map((category, index) => {
          const { x, y } = getButtonPosition(index, categories.length);
          const isActive = activeCategory === category;
          
          return (
            <motion.button
              key={category}
              className={`absolute px-3 py-2 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                isActive
                  ? 'bg-primary text-white shadow-lg scale-110'
                  : 'bg-card hover:bg-card/80 text-foreground hover:scale-105'
              }`}
              style={{
                left: x + radius / 2 + 50,
                top: y + radius + 50,
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
        
        {/* Visible semicircle circumference line */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
          style={{ left: 0, top: 0 }}
        >
          <defs>
            <linearGradient id="semicircleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d={`M ${radius / 2 + 50} ${50} A ${radius} ${radius} 0 0 1 ${radius / 2 + 50} ${radius * 2 + 50}`}
            stroke="url(#semicircleGradient)"
            strokeWidth="2"
            fill="none"
            className="text-primary"
          />
          {/* Add small dots at the endpoints */}
          <circle 
            cx={radius / 2 + 50} 
            cy={50} 
            r="3" 
            fill="currentColor" 
            className="text-primary opacity-60"
          />
          <circle 
            cx={radius / 2 + 50} 
            cy={radius * 2 + 50} 
            r="3" 
            fill="currentColor" 
            className="text-primary opacity-60"
          />
        </svg>
      </div>
    </div>
  );
};

export default SemicircularFilters;
