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
  const radius = 160;
  const svgSize = 400;
  const centerX = 80;  // Position center towards the left of the SVG
  const centerY = svgSize / 2;

  // Calculate positions for dots along a semicircle from top to bottom (right-facing arc)
  const getDotPosition = (index: number, total: number) => {
    // Create a semicircle from -90° to +90° (top to bottom, curving to the right)
    const startAngle = -Math.PI / 2; // Start at top (-90 degrees)
    const angleStep = Math.PI / (total - 1); // Evenly distribute angles
    const angle = startAngle + (index * angleStep);
    
    // Calculate position on the semicircle (right-facing arc)
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return { x, y, angle };
  };

  // Generate SVG path for the semicircle arc
  const getArcPath = () => {
    const startX = centerX;
    const startY = centerY - radius;
    const endX = centerX;
    const endY = centerY + radius;
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  };

  const handleCategoryClick = (category: SkillCategory) => {
    if (activeCategory === category) {
      onCategorySelect(null);
    } else {
      onCategorySelect(category);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative">
        
        {/* SVG Container for Arc */}
        <svg
          width={svgSize}
          height={svgSize}
          className="absolute inset-0 pointer-events-none"
          style={{ left: '-40px', top: '50%', transform: 'translateY(-50%)' }}
        >
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Semicircle Arc */}
          <path
            d={getArcPath()}
            stroke="url(#arcGradient)"
            strokeWidth="2"
            fill="none"
            className="drop-shadow-sm"
          />
        </svg>

        {/* Category Dots and Labels */}
        <div 
          className="relative"
          style={{ 
            width: svgSize, 
            height: svgSize,
            left: '-40px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          {categories.map((category, index) => {
            const { x, y } = getDotPosition(index, categories.length);
            const isActive = activeCategory === category;
            
            return (
              <motion.div
                key={category}
                className="absolute cursor-pointer group"
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => handleCategoryClick(category)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 400,
                  damping: 25
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                
                {/* Container for Label and Dot */}
                <div className="flex items-center">
                  
                  {/* Category Label (positioned to the left of dot) */}
                  <motion.span
                    className={`text-sm font-medium mr-3 transition-all duration-300 select-none whitespace-nowrap ${
                      isActive 
                        ? 'text-primary font-semibold' 
                        : 'text-foreground/70 group-hover:text-foreground'
                    }`}
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      color: isActive ? '#3b82f6' : undefined
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {category}
                  </motion.span>
                  
                  {/* Dot */}
                  <motion.div
                    className={`w-3 h-3 rounded-full border-2 transition-all duration-300 relative ${
                      isActive
                        ? 'bg-primary border-primary'
                        : 'bg-card border-primary/50 group-hover:border-primary group-hover:bg-primary/20'
                    }`}
                    animate={{
                      scale: isActive ? 1.3 : 1,
                      boxShadow: isActive 
                        ? '0 0 16px rgba(59, 130, 246, 0.5), 0 0 8px rgba(59, 130, 246, 0.3)' 
                        : '0 0 0px rgba(59, 130, 246, 0)'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Active indicator pulse */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/30"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SemicircularFilters;
