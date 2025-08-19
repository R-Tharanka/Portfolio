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
  const radius = 200;
  const centerX = radius + 50;
  const centerY = radius + 50;

  // Calculate positions for dots along a proper semicircle from top to bottom
  const getDotPosition = (index: number, total: number) => {
    // Create a semicircle from -90° to +90° (top to bottom, curving left)
    const startAngle = -Math.PI / 2; // Start at top (-90 degrees)
    const endAngle = Math.PI / 2;    // End at bottom (90 degrees)
    const angle = startAngle + (index / (total - 1)) * (endAngle - startAngle);
    
    // Calculate position on the semicircle
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
    <div className="relative w-full h-full flex items-center justify-start">
      <div className="relative" style={{ width: radius * 2 + 200, height: radius * 2 + 100 }}>
        
        {/* Semicircle Arc Line */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
        >
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Main semicircle arc */}
          <path
            d={`M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 0 ${centerX} ${centerY + radius}`}
            stroke="url(#arcGradient)"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Category Dots and Labels */}
        {categories.map((category, index) => {
          const { x, y } = getDotPosition(index, categories.length);
          const isActive = activeCategory === category;
          
          return (
            <div key={category} className="absolute" style={{ left: x, top: y }}>
              {/* Clickable Area (includes dot and label) */}
              <motion.div
                className="flex items-center cursor-pointer group"
                style={{ transform: 'translate(-100%, -50%)' }} // Position label to the left of dot
                onClick={() => handleCategoryClick(category)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                
                {/* Category Label */}
                <motion.span
                  className={`text-sm font-medium mr-3 transition-all duration-300 select-none ${
                    isActive 
                      ? 'text-primary font-semibold' 
                      : 'text-foreground/80 group-hover:text-foreground'
                  }`}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    fontWeight: isActive ? 600 : 500
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {category}
                </motion.span>
                
                {/* Dot */}
                <motion.div
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-primary border-primary shadow-lg shadow-primary/30'
                      : 'bg-card border-primary/60 group-hover:border-primary group-hover:bg-primary/10'
                  }`}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    boxShadow: isActive 
                      ? '0 0 12px rgba(59, 130, 246, 0.4)' 
                      : '0 0 0px rgba(59, 130, 246, 0)'
                  }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SemicircularFilters;
