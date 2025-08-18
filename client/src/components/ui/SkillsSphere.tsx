import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';
import { Skill, SkillCategory } from '../../types';
import SemicircularFiltersComponent from './SemicircularFilters';

interface SkillsSphereProps {
  skills: Skill[];
  activeCategory: SkillCategory | null;
  onCategoryChange: (category: SkillCategory | null) => void;
}

// Interface for our skill item component
interface SkillItemProps {
  skill: Skill;
  index: number;
  total: number;
  radius: number;
  isFiltered: boolean;
  activeCategory: SkillCategory | null;
}

// THIS COMPONENT MUST BE USED ONLY INSIDE THE CANVAS
const SkillItem = ({ 
  skill, 
  index, 
  total, 
  radius, 
  isFiltered, 
  activeCategory 
}: SkillItemProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate position on the sphere using spherical coordinates
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  
  // Base position on the sphere
  const basePosition = useMemo(() => [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(phi)
  ], [radius, theta, phi]);
  
  // Target position when filtered out
  const filteredPosition = useMemo(() => 
    isFiltered ? 
      [basePosition[0] * 1.5, basePosition[1] * 1.5, basePosition[2] + radius * 0.5] : 
      basePosition,
    [basePosition, isFiltered, radius]
  );
    
  // Scale based on skill proficiency
  const scale = Math.max(skill.proficiency / 10, 0.6);
  
  // Animation parameters
  const animParams = useRef({
    position: [...basePosition] as [number, number, number],
    scale: scale as number,
    opacity: 1
  });
  
  // Update position and appearance based on filtering
  useFrame((state: { clock: { getElapsedTime: () => number }; camera: THREE.Camera }) => {
    if (!meshRef.current) return;
    
    // Rotation around the sphere
    const time = state.clock.getElapsedTime() * 0.1;
    const x = basePosition[0];
    const z = basePosition[2];
    
    // When no category is active, all skills rotate normally
    if (!activeCategory) {
      animParams.current.position[0] = x * Math.cos(time) + z * Math.sin(time);
      animParams.current.position[2] = -x * Math.sin(time) + z * Math.cos(time);
      animParams.current.scale = scale;
      animParams.current.opacity = 1;
    } 
    // When a category is active
    else {
      // If this skill belongs to the active category, move it forward
      if (isFiltered) {
        animParams.current.position[0] += (filteredPosition[0] - animParams.current.position[0]) * 0.05;
        animParams.current.position[1] += (filteredPosition[1] - animParams.current.position[1]) * 0.05;
        animParams.current.position[2] += (filteredPosition[2] - animParams.current.position[2]) * 0.05;
        animParams.current.scale += (scale * 1.2 - animParams.current.scale) * 0.05;
        animParams.current.opacity += (1 - animParams.current.opacity) * 0.05;
      } 
      // If this skill doesn't belong to the active category, keep it rotating but fade it
      else {
        animParams.current.position[0] = x * Math.cos(time) + z * Math.sin(time);
        animParams.current.position[2] = -x * Math.sin(time) + z * Math.cos(time);
        animParams.current.scale += (scale * 0.8 - animParams.current.scale) * 0.05;
        animParams.current.opacity += (0.3 - animParams.current.opacity) * 0.05;
      }
    }
    
    // Apply the calculated position and appearance
    meshRef.current.position.set(
      animParams.current.position[0],
      animParams.current.position[1],
      animParams.current.position[2]
    );
    
    meshRef.current.scale.setScalar(animParams.current.scale);
  });
  
  // Color based on category
  const categoryColors: Record<SkillCategory, THREE.Color> = {
    Frontend: new THREE.Color('#3b82f6'), // blue
    Backend: new THREE.Color('#10b981'), // green
    Database: new THREE.Color('#f59e0b'), // yellow
    DevOps: new THREE.Color('#8b5cf6'), // purple
    Languages: new THREE.Color('#ef4444'), // red
    Design: new THREE.Color('#ec4899'), // pink
    Other: new THREE.Color('#6b7280'), // gray
  };
  
  const color = categoryColors[skill.category] || new THREE.Color('#6b7280');
  
  return (
    <mesh ref={meshRef} position={basePosition as unknown as THREE.Vector3}>
      <sphereGeometry args={[0.4 * scale, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.5}
        transparent
        opacity={1}
      />
      {/* Simplified approach - just show the sphere without text */}
    </mesh>
  );
};

// This component includes the rotating sphere group
// MUST BE USED INSIDE THE CANVAS
const SkillsScene = ({ skills, activeCategory }: {
  skills: Skill[];
  activeCategory: SkillCategory | null;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Animate the entire sphere
  useFrame((state: { clock: { getElapsedTime: () => number } }) => {
    if (groupRef.current) {
      // Subtle overall rotation
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });
  
  // Determine which skills are filtered based on activeCategory
  const filteredSkills = useMemo(() => {
    if (!activeCategory) return skills.map(() => true);
    return skills.map(skill => skill.category === activeCategory);
  }, [skills, activeCategory]);
  
  return (
    <group ref={groupRef}>
      {skills.map((skill, i) => (
        <SkillItem 
          key={skill.id}
          skill={skill}
          index={i}
          total={skills.length}
          radius={5}
          isFiltered={filteredSkills[i]}
          activeCategory={activeCategory}
        />
      ))}
    </group>
  );
};

// The 3D Canvas component - this wraps everything in a Canvas
const SkillsSphereCanvas = ({ skills, activeCategory }: {
  skills: Skill[];
  activeCategory: SkillCategory | null;
}) => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 15], fov: 60 }}
      style={{ height: '600px' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      
      <SkillsScene skills={skills} activeCategory={activeCategory} />
      
      <Preload all />
    </Canvas>
  );
};

// Main component combining the filters and canvas
const SkillsSphere = ({ skills, activeCategory, onCategoryChange }: SkillsSphereProps) => {
  return (
    <div className="w-full">
      <SemicircularFiltersComponent 
        categories={['Frontend', 'Backend', 'Database', 'DevOps', 'Languages', 'Design', 'Other']}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />
      
      <div className="w-full relative min-h-[600px] bg-card/30 rounded-xl overflow-hidden">
        <SkillsSphereCanvas 
          skills={skills} 
          activeCategory={activeCategory}
        />
      </div>
    </div>
  );
};

export default SkillsSphere;
