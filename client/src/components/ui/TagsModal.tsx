import React from 'react';
import { X } from 'lucide-react';
import DocumentPortal from './DocumentPortal';
import { motion } from 'framer-motion';

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: string[];
  title?: string;
}

const TagsModal: React.FC<TagsModalProps> = ({
  isOpen,
  onClose,
  tags,
  title = 'All Tags'
}) => {
  if (!isOpen) return null;

  return (
    <DocumentPortal rootId="tags-modal-portal">
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="bg-card rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold">{title}</h4>
            <button
              onClick={onClose}
              className="text-foreground/70 hover:text-foreground p-1 rounded-full"
              aria-label="Close tags modal"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-primary/90 text-white text-xs rounded-full shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </DocumentPortal>
  );
};

export default TagsModal;
