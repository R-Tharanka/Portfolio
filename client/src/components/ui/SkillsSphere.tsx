import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Skill } from '../../types';
import { iconMap } from './iconMap';

// Function to get the closest matching icon component
const getIconComponent = (iconName: string) => {
  if (!iconName) return iconMap['default'];

  // Normalize the icon name (lowercase, trim whitespace)
  const normalizedName = iconName.toLowerCase().trim();

  // Direct match
  if (iconMap[normalizedName]) return iconMap[normalizedName];

  // Check common variations
  const commonVariations: Record<string, string> = {
    'apache tomcat': 'tomcat',
    'express.js': 'express',
    'express js': 'express',
    'node.js': 'node',
    'nodejs': 'node',
    'spring boot': 'springboot',
    'tailwind': 'tailwind',
    'tailwindcss': 'tailwind',
    'tailwind css': 'tailwind',
    'chart.js': 'chartjs',
    'c++': 'c++',
    'c#': 'c#',
    'c sharp': 'c#',
    'js': 'javascript'
  };

  if (commonVariations[normalizedName] && iconMap[commonVariations[normalizedName]]) {
    return iconMap[commonVariations[normalizedName]];
  }

  // Try to find partial match
  const iconKeys = Object.keys(iconMap);
  for (const key of iconKeys) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return iconMap[key];
    }
  }

  // Return default icon if no match found
  return iconMap['default'];
};

interface SkillNodeProps {
  skill: Skill;
  position: [number, number, number];
  isFiltered?: boolean;
  isVisible?: boolean;
}

const SkillNode: React.FC<SkillNodeProps> = ({ 
  skill, 
  position, 
  isFiltered = false,
  isVisible = true 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const IconComponent = getIconComponent(skill.icon);
  useFrame(() => {
    if (meshRef.current && !isFiltered) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.003;
    }
  });
  if (!isVisible) return null;
  // Use much smaller size for separated (filtered) skills
  const isSeparated = position[2] === 6; // z=6 is the front grid
  const minSize = isSeparated ? 10 : 20;
  const maxSize = isSeparated ? 16 : 32;
  const normalized = Math.max(0, Math.min(1, skill.proficiency / 100));
  const iconSize = minSize + (maxSize - minSize) * normalized;
  return (
    <mesh ref={meshRef} position={position}>
      <Html
        center
        distanceFactor={15}
        position={[0, 0, 0]}
        style={{
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          textShadow: '0 0 4px rgba(0,0,0,0.8)',
          filter: isFiltered ? 'opacity(0.4)' : 'opacity(1)',
          transition: 'filter 0.3s ease',
        }}
      >
        <div 
          className="flex flex-col items-center"
          style={{
            backgroundColor: isSeparated ? 'rgba(30, 41, 59, 0.7)' : 'rgba(30, 41, 59, 0.4)', // Added subtle bg for sphere skills
            borderRadius: isSeparated ? '6px' : '4px', // Slightly smaller radius for sphere skills
            padding: isSeparated ? '4px' : '3px', // Smaller padding for sphere skills
            border: isSeparated ? '1px solid rgba(100, 116, 139, 0.3)' : '1px solid rgba(100, 116, 139, 0.15)', // More subtle border for sphere skills
          }}
        >
          <div style={{ width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconComponent className="mb-1 w-full h-full" />
          </div>
          <span className="text-xs" style={{ 
            fontSize: isSeparated ? 4 : Math.min(11, 7.5 + 3.5 * normalized), 
            lineHeight: isSeparated ? '1.1em' : '1.05em' 
          }}>{skill.name}</span>
        </div>
      </Html>
    </mesh>
  );
};

interface SkillsSphereProps {
  skills: Skill[];
  filteredSkills: Skill[];
  activeCategory: string | null;
}

const SphereScene: React.FC<SkillsSphereProps> = ({ 
  skills, 
  filteredSkills, 
  activeCategory
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const separatedGroupRef = useRef<THREE.Group>(null);
  
  // Generate positions on a sphere using Fibonacci spiral
  const skillPositions = useMemo(() => {
    const positions: Array<{ skill: Skill; position: [number, number, number] }> = [];
    const radius = 3.5; // Further reduced from 4.5 to 3.5
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
    
    skills.forEach((skill, index) => {
      const y = 1 - (index / (skills.length - 1)) * 2; // Range from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * index;
      
      const x = Math.cos(theta) * radiusAtY * radius;
      const z = Math.sin(theta) * radiusAtY * radius;
      
      positions.push({
        skill,
        position: [x, y * radius, z]
      });
    });
    
    return positions;
  }, [skills]);

  // Arrange filtered skills in centered horizontal rows (grid) in front of the sphere
  const separatedPositions = useMemo(() => {
    const positions: Array<{ skill: Skill; position: [number, number, number] }> = [];
    const z = 6; // Fixed Z in front of sphere
    const count = filteredSkills.length;
    if (count === 0) return positions;
    // Choose columns per row based on count (4-6 for desktop)
    const maxCols = count <= 4 ? count : count <= 8 ? 4 : 6;
    const cols = Math.min(maxCols, count);
    const rows = Math.ceil(count / cols);
  const spacingX = 0.9; // Horizontal spacing between icons (tighter)
  const spacingY = 1.1; // Vertical spacing between rows (tighter)
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      // Center the grid horizontally and vertically
      const x = (col - (cols - 1) / 2) * spacingX;
      const y = (row - (rows - 1) / 2) * -spacingY;
      positions.push({ skill: filteredSkills[i], position: [x, y, z] });
    }
    return positions;
  }, [filteredSkills]);

  useFrame(() => {
    if (groupRef.current) {
      // Continuous gentle rotation
      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x += 0.001;
      
      // Animation logic based on activeCategory
      if (activeCategory) {
        // Move sphere back and scale down
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, -3, 0.02);
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 0.6, 0.02));
      } else {
        // Return to original position
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.02);
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1, 0.02));
      }
    }

    if (separatedGroupRef.current) {
      if (activeCategory) {
        separatedGroupRef.current.position.z = THREE.MathUtils.lerp(separatedGroupRef.current.position.z, 0, 0.02);
        separatedGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(separatedGroupRef.current.scale.x, 1, 0.02));
      } else {
        separatedGroupRef.current.position.z = THREE.MathUtils.lerp(separatedGroupRef.current.position.z, 20, 0.02);
        separatedGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(separatedGroupRef.current.scale.x, 0.1, 0.02));
      }
    }
  });

  return (
    <group>
      {/* Main rotating sphere */}
      <group ref={groupRef}>
        {skillPositions.map(({ skill, position }) => {
          const isInFilteredCategory = activeCategory 
            ? skill.category !== activeCategory 
            : false;
          
          return (
            <SkillNode
              key={skill.id}
              skill={skill}
              position={position}
              isFiltered={isInFilteredCategory}
              isVisible={!activeCategory || skill.category !== activeCategory}
            />
          );
        })}
      </group>
      
      {/* Separated filtered skills */}
      <group ref={separatedGroupRef}>
        {activeCategory && separatedPositions.map(({ skill, position }) => (
          <SkillNode
            key={`separated-${skill.id}`}
            skill={{ ...skill, proficiency: 0 }} // force minimum size for filtered icons
            position={position}
            isFiltered={false}
          />
        ))}
      </group>
      
      {/* Optimized lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4338ca" />
    </group>
  );
};

const SkillsSphere: React.FC<SkillsSphereProps> = (props) => {
  const { skills } = props;
  
  if (skills.length === 0) {
    return (
      <div className="w-full h-[450px] flex items-center justify-center text-foreground/70">
        <p>No skills available to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[450px] relative" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }} // Moved closer from 12 to 10 for smaller sphere
        style={{ background: 'transparent', zIndex: 1 }}
        dpr={[1, 2]} // Responsive pixel ratio for performance
        performance={{ min: 0.5 }} // Performance monitoring
      >
        <SphereScene {...props} />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>
      
      {/* User guidance */}
      <div className="absolute top-4 left-4 text-xs text-foreground/50">
        Drag to rotate
      </div>
    </div>
  );
};

export default SkillsSphere;
