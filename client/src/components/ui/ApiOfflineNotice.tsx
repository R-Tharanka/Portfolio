import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, X } from 'lucide-react';

interface ApiOfflineNoticeProps {
  message?: string;
}

const ApiOfflineNotice: React.FC<ApiOfflineNoticeProps> = ({ 
  message = "API server is currently unavailable. Limited functionality available."
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  useEffect(() => {
    // Listen for network/API error events
    const handleApiError = (event: CustomEvent) => {
      const { type } = event.detail;
      
      // Only show for network errors if not dismissed
      if (type === 'network' && !isDismissed) {
        setIsVisible(true);
      }
    };
    
    // Add event listeners
    window.addEventListener('api:error' as any, handleApiError);
    
    // Clean up
    return () => {
      window.removeEventListener('api:error' as any, handleApiError);
    };
  }, [isDismissed]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Set session storage to remember dismissal
    sessionStorage.setItem('api-offline-notice-dismissed', 'true');
  };
  
  // Don't render anything if not visible
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className="fixed top-16 inset-x-0 mx-auto z-50 max-w-md bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg shadow-lg p-4"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <WifiOff className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{message}</p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
            The site will function with limited capabilities. Data shown may not be current.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss notice"
          className="flex-shrink-0 ml-3 text-amber-400 hover:text-amber-500 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ApiOfflineNotice;
