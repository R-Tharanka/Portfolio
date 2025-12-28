import React from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isVisible: boolean;
  isVideoActive?: boolean;
  canUseFitMode?: boolean;
  onClose?: () => void;
}

interface ShortcutRow {
  keys: string[];
  description: string;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isVisible,
  isVideoActive = false,
  canUseFitMode = false,
  onClose
}) => {
  if (!isVisible) return null;

  const sections: { title: string; rows: ShortcutRow[] }[] = [
    {
      title: 'Navigation',
      rows: [
        { keys: ['←', '→'], description: 'Navigate media' },
        { keys: ['Esc'], description: 'Close viewer' }
      ]
    }
  ];

  const controlRows: ShortcutRow[] = [
    { keys: ['F'], description: 'Toggle fullscreen' }
  ];

  const zoomRows: ShortcutRow[] = [
    { keys: ['1'], description: 'Original layout (Mode 1)' },
    { keys: ['2'], description: 'Fit to viewer (Mode 2)' },
    { keys: ['+ / ='], description: 'Zoom in (Mode 2)' },
    { keys: ['-'], description: 'Zoom out (Mode 2)' },
    { keys: ['0'], description: 'Reset zoom (Mode 2)' }
  ];

  if (isVideoActive) {
    controlRows.unshift({ keys: ['Space'], description: 'Play / Pause video' });
    controlRows.push({ keys: ['M'], description: 'Mute / Unmute video' });
  }

  sections.push({ title: 'Controls', rows: controlRows });

  if (canUseFitMode) {
    sections.push({ title: 'View Modes', rows: zoomRows });
  }

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-16 text-white/80 text-xs z-50">
      <div className="relative bg-black/80 border border-white/10 rounded-lg p-4 backdrop-blur-sm shadow-2xl flex gap-6">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose?.();
          }}
          className="absolute top-2 right-2 p-1 rounded-full text-white/60 hover:text-red-400 transition-colors z-60"
          aria-label="Close keyboard shortcuts"
        >
          <X size={14} />
        </button>
        {sections.map(section => (
          <div key={section.title}>
            <div className="font-semibold mb-2 text-sm text-white">{section.title}</div>
            {section.rows.map(row => (
              <div key={row.description} className="flex items-center gap-2 mb-1 last:mb-0">
                <div className="flex items-center gap-1">
                  {row.keys.map(key => (
                    <span key={key} className="bg-white/15 px-2 py-1 rounded whitespace-nowrap">
                      {key}
                    </span>
                  ))}
                </div>
                <span className="text-white/70 whitespace-nowrap">{row.description}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
