import React from 'react';
import { Skill } from '../../types';
import { iconMap } from './iconMap';

interface FilteredSkillsGridProps {
  skills: Skill[];
  onClose: () => void;
}

const getIconComponent = (iconName: string) => {
  if (!iconName) return iconMap['default'];
  const normalizedName = iconName.toLowerCase().trim();
  if (iconMap[normalizedName]) return iconMap[normalizedName];
  return iconMap['default'];
};

const FilteredSkillsGrid: React.FC<FilteredSkillsGridProps> = ({ skills, onClose }) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[8px]">
      <div className="w-full flex justify-end px-8 pt-8">
        <button
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-primary font-semibold shadow-lg backdrop-blur border border-white/20"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 p-8 rounded-2xl glassmorph shadow-2xl" style={{background: 'rgba(30,40,60,0.35)', border: '1.5px solid rgba(255,255,255,0.08)'}}>
        {skills.map(skill => {
          const Icon = getIconComponent(skill.icon);
          return (
            <div key={skill.name} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 backdrop-blur-[2px] border border-white/10 shadow-md glassmorph transition-transform hover:scale-105">
              <Icon className="mb-2 w-10 h-10 text-primary" />
              <span className="text-base font-medium text-white/90 text-center" style={{textShadow: '0 1px 8px #0008'}}>{skill.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilteredSkillsGrid;
