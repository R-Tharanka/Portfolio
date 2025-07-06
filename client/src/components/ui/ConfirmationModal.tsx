import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle } from 'lucide-react';
import DocumentPortal from './DocumentPortal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-close after 5 seconds for success modals
  useEffect(() => {
    if (isOpen && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, type]);

  return (
    <DocumentPortal rootId="confirmation-modal-portal">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-9000"
              onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto z-9500 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="relative w-full max-w-sm bg-card rounded-lg shadow-xl border border-border overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-muted rounded-full"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center">
                  {/* Animated Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ 
                      type: "spring", 
                      duration: 0.5, 
                      bounce: 0.5 
                    }}
                    className="mb-4"
                  >
                    {type === 'success' ? (
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <div className="relative">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                          >
                            <CheckCircle className="h-12 w-12 text-green-500" />
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <XCircle className="h-12 w-12 text-red-500" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Message */}
                  <p className="text-center text-foreground/80">{message}</p>
                </div>

                {/* Footer */}
                <div className="p-4 bg-card-foreground/5 border-t border-border">
                  <button
                    onClick={onClose}
                    className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-md transition-colors ${
                      type === 'success'
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    <span>{type === 'success' ? 'Great!' : 'Close'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </DocumentPortal>
  );
};

export default ConfirmationModal;
