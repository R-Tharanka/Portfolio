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
  // Arc configuration - matching the exact design
  const radius = 180; // Arc radius
  const svgWidth = 300;
  const svgHeight = 500;
  const arcX = svgWidth - 80; // Arc center X positioned near right edge
  const arcY = svgHeight / 2; // Arc center Y at vertical middle
  
  // Calculate positions for each dot and label
  const getDotPosition = (index: number, total: number) => {
    // Create a semicircle from -90° (top) to +90° (bottom)
    const angleStep = Math.PI / (total - 1); // Evenly distribute items
    const angle = -Math.PI / 2 + (index * angleStep);
    
    // Position the dot exactly on the arc
    const dotX = arcX + radius * Math.cos(angle);
    const dotY = arcY + radius * Math.sin(angle);
    
    // Position the label to the left of the dot, slightly offset
    const labelOffset = 10; // Space between dot and label
    const labelX = dotX - labelOffset;
    
    return { dotX, dotY, labelX, labelY: dotY, angle };
  };
  
  // Generate the arc SVG path
  const getArcPath = () => {
    const startX = arcX;
    const startY = arcY - radius;
    const endX = arcX;
    const endY = arcY + radius;
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  };

  const handleCategoryClick = (category: SkillCategory) => {
    if (activeCategory === category) {
      onCategorySelect(null); // Deselect if already active
    } else {
      onCategorySelect(category); // Select new category
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-end">
      <div className="relative" style={{ width: svgWidth, height: svgHeight }}>
        {/* SVG for the semicircular arc */}
        <svg
          width={svgWidth}
          height={svgHeight}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Gradient for the arc */}
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          
          {/* The arc line */}
          <path
            d={getArcPath()}
            stroke="url(#arcGradient)"
            strokeWidth="2"
            fill="none"
            className="drop-shadow-md"
          />
        </svg>
        
        {/* Dots and Labels */}
        <div className="absolute inset-0">
          {categories.map((category, index) => {
            const { dotX, dotY, labelX } = getDotPosition(index, categories.length);
            const isActive = activeCategory === category;
            
            return (
              <div
                key={category}
                className="absolute"
                style={{ 
                  left: 0,
                  top: 0,
                  width: svgWidth,
                  height: svgHeight
                }}
              >
                {/* Label positioned to left of dot with right alignment */}
                <motion.div 
                  className="absolute flex items-center justify-end cursor-pointer"
                  style={{
                    left: 0,
                    top: dotY,
                    width: labelX,
                    transform: 'translateY(-50%)'
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                  }}
                  onClick={() => handleCategoryClick(category)}
                >
                  <motion.span
                    className={`text-sm font-medium mr-3 transition-all duration-300 select-none ${
                      isActive 
                        ? 'text-primary font-semibold' 
                        : 'text-foreground/80 hover:text-foreground'
                    }`}
                    animate={{
                      scale: isActive ? 1.05 : 1
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {category}
                  </motion.span>
                </motion.div>
                
                {/* Dot positioned exactly on the arc */}
                <motion.div
                  className="absolute cursor-pointer"
                  style={{
                    left: dotX,
                    top: dotY,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => handleCategoryClick(category)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-primary shadow-lg shadow-primary/40'
                        : 'bg-primary/60 hover:bg-primary'
                    }`}
                    animate={{
                      scale: isActive ? 1.4 : 1,
                      boxShadow: isActive 
                        ? '0 0 12px rgba(59, 130, 246, 0.5)' 
                        : '0 0 0px rgba(59, 130, 246, 0)'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Pulse animation for active dot */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/30"
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.7, 0, 0.7]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SemicircularFilters;
