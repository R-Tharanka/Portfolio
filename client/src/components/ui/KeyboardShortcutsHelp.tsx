import React from 'react';

interface KeyboardShortcutsHelpProps {
  isVisible: boolean;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-16 text-white/80 text-xs z-50">
      <div className="bg-black/80 border border-white/10 rounded-lg p-4 backdrop-blur-sm shadow-2xl flex gap-6">
        <div>
          <div className="font-semibold mb-2 text-sm text-white">Navigation</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/15 px-2 py-1 rounded">←</span>
            <span className="bg-white/15 px-2 py-1 rounded">→</span>
            <span className="text-white/70">Navigate media</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/15 px-2 py-1 rounded">Esc</span>
            <span className="text-white/70">Close viewer</span>
          </div>
        </div>
        
        <div>
          <div className="font-semibold mb-2 text-sm text-white">Controls</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/15 px-2 py-1 rounded">Space</span>
            <span className="text-white/70">Play/Pause</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/15 px-2 py-1 rounded">F</span>
            <span className="text-white/70">Fullscreen</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/15 px-2 py-1 rounded">M</span>
            <span className="text-white/70">Mute/Unmute</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
