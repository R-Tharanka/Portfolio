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
  const radius = 200; // Increased radius for more height
  const centerX = 0;
  const centerY = 0;

  // Calculate positions for each button with equal spacing along an arc
  const getButtonPosition = (index: number, total: number) => {
    // Create an arc that's taller than a semicircle for better spacing
    const startAngle = Math.PI / 3; // Start at 60 degrees instead of 90
    const endAngle = (2 * Math.PI) / 3; // End at 120 degrees instead of 90
    const totalAngle = endAngle - startAngle; // Total arc span
    
    // Distribute buttons evenly along this arc
    const angle = startAngle + (totalAngle * index) / (total - 1);
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
      <div className="relative" style={{ width: Math.min(radius + 120, 380), height: Math.min(radius * 1.8 + 120, 500) }}>
        {categories.map((category, index) => {
          const { x, y } = getButtonPosition(index, categories.length);
          const isActive = activeCategory === category;
          
          return (
            <motion.button
              key={category}
              className={`absolute px-4 py-3 lg:px-5 lg:py-3 rounded-full text-sm lg:text-base font-medium transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                isActive
                  ? 'bg-primary text-white shadow-lg scale-110'
                  : 'bg-card hover:bg-card/80 text-foreground hover:scale-105'
              }`}
              style={{
                left: x + radius / 2 + 60,
                top: y + radius / 3 + 60, // Adjusted positioning for the new arc
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
        
        {/* Visible arc circumference line */}
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
          {/* Create an arc that follows the button positions */}
          <path
            d={`M ${radius * 0.25 + 60} ${radius * 0.4 + 60} A ${radius} ${radius} 0 0 1 ${radius * 0.75 + 60} ${radius * 0.4 + 60}`}
            stroke="url(#semicircleGradient)"
            strokeWidth="2"
            fill="none"
            className="text-primary"
          />
          {/* Add small dots at the endpoints */}
          <circle 
            cx={radius * 0.25 + 60} 
            cy={radius * 0.4 + 60} 
            r="3" 
            fill="currentColor" 
            className="text-primary opacity-60"
          />
          <circle 
            cx={radius * 0.75 + 60} 
            cy={radius * 0.4 + 60} 
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
