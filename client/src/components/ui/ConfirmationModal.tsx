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

  // Auto-close after 10 seconds for all modals
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

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
                className="relative w-full max-w-[250px] bg-card rounded-2xl shadow-xl border border-border/30 overflow-hidden"
              >
                {/* Close icon (top-right corner) */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 hover:bg-muted/50 rounded-full transition-colors z-10"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-foreground/70" />
                </button>
                
                {/* Content */}
                <div className="pt-7 pb-5 px-[22px] flex flex-col items-center">
                  {/* Progress bar for auto-close */}
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 10, ease: "linear" }}
                    className={`absolute top-0 left-0 h-1 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                
                  {/* Animated Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ 
                      type: "spring", 
                      duration: 0.6, 
                      bounce: 0.5 
                    }}
                    className="mb-4"
                  >
                    {type === 'success' ? (
                      <motion.div>
                        <div className="relative">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                          >
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2, duration: 0.5 }}
                            >
                              <CheckCircle className="h-12 w-12 text-green-500" />
                            </motion.div>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div>
                        <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          >
                            <XCircle className="h-12 w-12 text-red-500" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Title with increased prominence */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-bold mb-1 text-center"
                  >
                    {title}
                  </motion.h3>

                  {/* Message */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center text-foreground/80"
                  >
                    {message}
                  </motion.p>
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
