import React from 'react';

interface KeyboardShortcutsHelpProps {
  isVisible: boolean;
  isVideoActive?: boolean;
  canUseFitMode?: boolean;
}

interface ShortcutRow {
  keys: string[];
  description: string;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isVisible,
  isVideoActive = false,
  canUseFitMode = false
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
      <div className="bg-black/80 border border-white/10 rounded-lg p-4 backdrop-blur-sm shadow-2xl flex gap-6">
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
