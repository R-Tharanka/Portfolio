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
  // Define the exact coordinates from your HTML structure - scaled down for reduced height
  const coordinates = [
    { x: 327.91, y: 44.56, labelX: 300, labelY: 44.56 },      // Frontend
    { x: 240.0, y: 84.36, labelX: 214.0, labelY: 84.36 },     // Backend
    { x: 178.0, y: 154.36, labelX: 156.0, labelY: 154.36 },   // DevOps
    { x: 154.0, y: 230.00, labelX: 134.0, labelY: 230.00 },   // Languages
    { x: 178.0, y: 305.64, labelX: 156.0, labelY: 305.64 },   // Database
    { x: 240.0, y: 375.64, labelX: 214.0, labelY: 375.64 },   // Design
    { x: 327.91, y: 415.44, labelX: 300, labelY: 415.44 }     // Other
  ];

  const handleCategoryClick = (category: SkillCategory) => {
    if (activeCategory === category) {
      onCategorySelect(null);
    } else {
      onCategorySelect(category);
    }
  };

  // CSS variables to match your HTML
  const cssVars = {
    accent: '#2f7bff',
    text: '#d7e1ee',
  };

  return (
    <div className="relative w-full h-full" style={{ height: '460px', overflow: 'hidden' }}>
      <svg className="w-full h-full block" viewBox="0 0 360 460">
        {/* Arc with glow effect */}
        <g className="arc-group">
          <path 
            className="arc-glow" 
            d="M 327.91 44.56 A 200 200 0 0 0 327.91 415.44" 
            style={{
              fill: 'none',
              stroke: `rgba(47,123,255,0.12)`,
              strokeWidth: 8,
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          />
          <path 
            className="arc" 
            d="M 327.91 44.56 A 200 200 0 0 0 327.91 415.44" 
            style={{
              fill: 'none',
              stroke: cssVars.accent,
              strokeWidth: 2.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          />
        </g>
        
        {/* Dots and labels */}
        {categories.map((category, index) => {
          if (index >= coordinates.length) return null; // Safety check
          
          const { x, y, labelX, labelY } = coordinates[index];
          const isActive = activeCategory === category;
          
          return (
            <React.Fragment key={category}>
              {/* Dot */}
              <motion.circle
                className="cursor-pointer"
                cx={x}
                cy={y}
                r={isActive ? 4.5 : 3.5}
                style={{
                  fill: isActive ? cssVars.accent : `${cssVars.accent}`,
                  stroke: 'rgba(255,255,255,0.06)',
                  strokeWidth: 1
                }}
                onClick={() => handleCategoryClick(category)}
                whileHover={{ scale: 1.2, r: 4.5 }}
                animate={{
                  fill: isActive ? cssVars.accent : `${cssVars.accent}`,
                  boxShadow: isActive ? '0 0 10px rgba(47,123,255,0.6)' : 'none'
                }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Background for active label */}
              {isActive && (
                <rect
                  x={labelX - (category.length * 9 + 12)} // Reduced offset to move rectangle rightward
                  y={labelY - 14} // Center vertically
                  width={category.length * 9 + 20} // Width based on text length plus padding
                  height={28} // Height of the background
                  rx={10} // Rounded corners
                  ry={10}
                  style={{
                    fill: 'rgba(47, 123, 255, 0.15)',
                    stroke: 'rgba(47, 123, 255, 0.4)',
                    strokeWidth: 1,
                    pointerEvents: 'none'
                  }}
                />
              )}
              
              {/* Label */}
              <motion.text
                className={`cursor-pointer select-none ${isActive ? 'filter drop-shadow-lg' : ''}`}
                x={labelX}
                y={labelY}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: isActive ? '17px' : '16px', // Slightly larger font for active
                  fill: isActive ? cssVars.accent : cssVars.text,
                  fontWeight: isActive ? 600 : 500,
                  paintOrder: 'stroke',
                  stroke: isActive ? cssVars.accent : 'none',
                  strokeWidth: isActive ? 0.5 : 0
                }}
                onClick={() => handleCategoryClick(category)}
                whileHover={{ scale: 1.08 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: isActive ? 1.05 : 1, // Slight scale for active buttons
                  fill: isActive ? cssVars.accent : cssVars.text,
                  fontWeight: isActive ? 600 : 500
                }}
                transition={{
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25
                }}
              >
                {category}
              </motion.text>
              
              {/* Active indicator - pulsing circle */}
              {isActive && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={3.5}
                  style={{
                    fill: 'transparent',
                    stroke: cssVars.accent,
                    strokeWidth: 1.5,
                    pointerEvents: 'none'
                  }}
                  animate={{
                    r: [3.5, 9, 3.5],
                    opacity: [0.8, 0, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

export default SemicircularFilters;
