import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DevelopmentBannerProps {
  message?: string;
}

const DevelopmentBanner: React.FC<DevelopmentBannerProps> = ({ 
  message = "⚠️ Portfolio under development - some features may be incomplete!" 
}) => {  // Check if banner should be shown via environment variable or localStorage
  // You can set this to false to disable the banner temporarily
  const SHOW_DEV_BANNER = import.meta.env.VITE_SHOW_DEV_BANNER !== 'false';
  
  const [isVisible, setIsVisible] = useState(SHOW_DEV_BANNER);
    // Check if the banner was closed before and if the closure is still valid
  useEffect(() => {
    const bannerClosedExpiry = localStorage.getItem('dev-banner-closed');
    
    if (bannerClosedExpiry) {
      const expiryTime = parseInt(bannerClosedExpiry, 10);
      const now = Date.now();
      
      // If the expiry time is in the future, keep the banner hidden
      if (now < expiryTime) {
        setIsVisible(false);
      } else {
        // If expired, remove from localStorage
        localStorage.removeItem('dev-banner-closed');
      }
    }
  }, []);
    const closeBanner = () => {
    setIsVisible(false);
    // Remember the choice for 24 hours
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('dev-banner-closed', expiryTime.toString());
  };
    return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[60] flex justify-center"
        ><div className="bg-accent text-white px-4 py-2 rounded-b-lg shadow-lg flex items-center max-w-3xl mx-auto">
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
