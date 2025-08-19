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
  const radius = 200; // Increased radius for better arc

  // Calculate positions for each button along a proper arc like in your Figma design
  const getButtonPosition = (index: number, total: number) => {
    // Create an arc from top-right to bottom-right (like your design)
    const startAngle = -Math.PI / 2.2; // Start angle (about -82 degrees)
    const endAngle = Math.PI / 2.2; // End angle (about +82 degrees)
    
    // Distribute buttons evenly along the arc
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angle = startAngle + (index * angleStep);
    
    // Calculate position on the arc (opening towards the left/sphere)
    const x = -Math.cos(angle) * radius; // Negative to open towards left
    const y = Math.sin(angle) * radius;
    
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
      <div className="relative" style={{ width: 350, height: 500 }}>
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
                left: x + 250, // Center horizontally with offset
                top: y + 250, // Center vertically
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
        
        {/* Visible arc circumference line matching the button positions */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="350"
          height="500"
          viewBox="0 0 350 500"
        >
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d={`M ${250 + (-Math.cos(-Math.PI / 2.2) * radius)} ${250 + (Math.sin(-Math.PI / 2.2) * radius)} A ${radius} ${radius} 0 0 1 ${250 + (-Math.cos(Math.PI / 2.2) * radius)} ${250 + (Math.sin(Math.PI / 2.2) * radius)}`}
            stroke="url(#arcGradient)"
            strokeWidth="2"
            fill="none"
            className="text-primary"
          />
          {/* Add small dots at the endpoints */}
          <circle 
            cx={250 + (-Math.cos(-Math.PI / 2.2) * radius)} 
            cy={250 + (Math.sin(-Math.PI / 2.2) * radius)} 
            r="3" 
            fill="currentColor" 
            className="text-primary opacity-60"
          />
          <circle 
            cx={250 + (-Math.cos(Math.PI / 2.2) * radius)} 
            cy={250 + (Math.sin(Math.PI / 2.2) * radius)} 
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
