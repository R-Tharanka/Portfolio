import React from 'react';
import { motion } from 'framer-motion';
import { SkillCategory } from '../../types';

interface SemicircularFiltersProps {
  categories: SkillCategory[];
  activeCategory: SkillCategory | null;
  onCategoryChange: (category: SkillCategory | null) => void;
}

const SemicircularFilters: React.FC<SemicircularFiltersProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="relative w-full h-32 flex items-center justify-center mb-8">
      <div className="absolute w-full flex justify-center">
        {categories.map((category, index) => {
          // Calculate position on semicircle
          const angleStep = Math.PI / (categories.length - 1);
          const angle = index * angleStep;
          
          // Convert to percentage coordinates for positioning
          const left = 50 + 40 * Math.cos(angle);
          const bottom = 40 * Math.sin(angle);
          
          return (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(activeCategory === category ? null : category)}
              className={`absolute px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-card hover:bg-card/80 text-foreground'
              }`}
              style={{
                left: `${left}%`,
                bottom: `${bottom}%`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: index * 0.05 
              }}
            >
              {category}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SemicircularFilters;
