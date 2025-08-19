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
  // Define the exact coordinates from your HTML structure
  const coordinates = [
    { x: 327.91, y: 54.56, labelX: 300, labelY: 54.56 },    // Frontend
    { x: 200.85, y: 109.36, labelX: 175, labelY: 109.36 },  // Backend
    { x: 111.91, y: 215.36, labelX: 90, labelY: 215.36 },   // DevOps
    { x: 80.00, y: 350.00, labelX: 60, labelY: 350.00 },    // Languages
    { x: 111.91, y: 484.64, labelX: 90, labelY: 484.64 },   // Database
    { x: 200.85, y: 590.64, labelX: 175, labelY: 590.64 },  // Design
    { x: 327.91, y: 645.44, labelX: 300, labelY: 645.44 }   // Other
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
    <div className="relative w-full h-full" style={{ height: '720px', overflow: 'hidden' }}>
      <svg className="w-full h-full block" viewBox="0 0 360 720">
        {/* Arc with glow effect */}
        <g className="arc-group">
          <path 
            className="arc-glow" 
            d="M 327.91 54.56 A 300 300 0 0 0 327.91 645.44" 
            style={{
              fill: 'none',
              stroke: `rgba(47,123,255,0.12)`,
              strokeWidth: 10,
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          />
          <path 
            className="arc" 
            d="M 327.91 54.56 A 300 300 0 0 0 327.91 645.44" 
            style={{
              fill: 'none',
              stroke: cssVars.accent,
              strokeWidth: 3,
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
                r={isActive ? 5.5 : 4.5}
                style={{
                  fill: isActive ? cssVars.accent : `${cssVars.accent}`,
                  stroke: 'rgba(255,255,255,0.06)',
                  strokeWidth: 1
                }}
                onClick={() => handleCategoryClick(category)}
                whileHover={{ scale: 1.2, r: 5.5 }}
                animate={{
                  fill: isActive ? cssVars.accent : `${cssVars.accent}`,
                  boxShadow: isActive ? '0 0 10px rgba(47,123,255,0.6)' : 'none'
                }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Label */}
              <motion.text
                className={`cursor-pointer select-none ${isActive ? 'filter drop-shadow-lg' : ''}`}
                x={labelX}
                y={labelY}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: '18px',
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
                  r={4.5}
                  style={{
                    fill: 'transparent',
                    stroke: cssVars.accent,
                    strokeWidth: 1.5,
                    pointerEvents: 'none'
                  }}
                  animate={{
                    r: [4.5, 12, 4.5],
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
