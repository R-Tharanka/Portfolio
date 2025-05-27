import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DevelopmentBannerProps {
  message?: string;
}

const DevelopmentBanner: React.FC<DevelopmentBannerProps> = ({ 
  message = "🚧 Portfolio under development - some features may be incomplete 🚧" 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Check if the banner was closed before
  useEffect(() => {
    const bannerClosed = localStorage.getItem('dev-banner-closed');
    if (bannerClosed) {
      setIsVisible(false);
    }
  }, []);
  
  const closeBanner = () => {
    setIsVisible(false);
    // Remember the choice for 24 hours
    localStorage.setItem('dev-banner-closed', 'true');
    setTimeout(() => {
      localStorage.removeItem('dev-banner-closed');
    }, 24 * 60 * 60 * 1000);
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        >
          <div className="bg-accent text-white px-4 py-2 rounded-b-lg shadow-lg flex items-center max-w-3xl mx-auto">
            <span className="mr-4 text-sm font-medium">{message}</span>
            <button 
              onClick={closeBanner}
              className="text-white hover:text-white/80 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DevelopmentBanner;
