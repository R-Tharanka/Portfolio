import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-scroll';
import { ArrowUp, Code, Shield, Settings, RefreshCw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../utils/serviceWorkerCleanup'; // Import the file that declares the global function
import { useServiceWorker } from '../../context/ServiceWorkerContext';
import Toast from '../ui/Toast';

// Define our toast config interface
interface ToastConfig {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  action?: { label: string; onClick: () => void };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    cleanupServiceWorker: (options?: { 
      showToast?: boolean; 
      redirectToHome?: boolean;
      noAutoRefresh?: boolean;
    }) => Promise<ToastConfig | null>;
    _serviceWorkerToastState?: ToastConfig;
  }
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    action: undefined as { label: string; onClick: () => void } | undefined
  });
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);
  // Refs to store timeouts
  const timers = useRef<NodeJS.Timeout[]>([]);
  
  // Use the global service worker context
  const { updateModalStatus, setShowRefreshButtons, showConfirmationModal } = useServiceWorker();

  // Clear all timers and mark unmounted when component is destroyed
  useEffect(() => {
    return () => {
      isMounted.current = false;
      timers.current.forEach(timer => clearTimeout(timer));
      timers.current = [];
    };
  }, []);
  
  // This function will be called if the user confirms they want to proceed
  const handleConfirmedCleanup = useCallback(async () => {
    // Update modal status to show progress
    updateModalStatus({
      message: 'Checking service workers...',
      type: 'loading',
      details: ['Initializing cleanup process...']
    });

    // Hide the action buttons during processing
    setShowRefreshButtons(false);

    try {
      // Set up a loading state to provide immediate feedback
      setToastConfig({
        message: 'Cleaning up service workers and cache...',
        type: 'info',
        action: undefined
      });
      setShowToast(true);

      // Update status as the process progresses
      const timer1 = setTimeout(() => {
        if (!isMounted.current) return;
        
        updateModalStatus({
          message: 'Finding service worker registrations...',
          type: 'loading',
          details: ['Initializing cleanup process...', 'Searching for active service workers...']
        });
      }, 500);
      
      timers.current.push(timer1);

      const timer2 = setTimeout(() => {
        if (!isMounted.current) return;
        
        updateModalStatus({
          message: 'Clearing browser caches...',
          type: 'loading',
          details: [
            'Initializing cleanup process...',
            'Searching for active service workers...',
            'Removing cached API responses...'
          ]
        });
      }, 1200);
      
      timers.current.push(timer2);
      
      // Call the actual cleanup function with no automatic refresh/redirect
      const result = await window.cleanupServiceWorker({
        showToast: false, // Don't show toast since we're showing modal
        redirectToHome: false, // Don't redirect automatically
        noAutoRefresh: true // New option to prevent auto-refresh
      });

      // Check if component is still mounted
      if (!isMounted.current) return;

      // Clear all timers
      timers.current.forEach(timer => clearTimeout(timer));
      timers.current = [];

      // Update the modal with the result
      if (result && result.type === 'success') {
        updateModalStatus({
          message: result.message || 'Service worker cleanup completed successfully',
          type: 'success',
          details: [
            'Successfully unregistered all service workers',
            'Cleared browser caches',
            'Removed stored API URLs',
            'Ready to reload with fresh data',
            'Please use one of the buttons below to refresh the page'
          ]
        });
      } else if (result && result.type === 'error') {
        updateModalStatus({
          message: result.message || 'Error cleaning up service worker',
          type: 'error',
          details: [
            'An error occurred during cleanup', 
            result.message || 'Unknown error', 
            'You may try again or refresh the page manually'
          ]
        });
      } else if (result && result.type === 'warning') {
        updateModalStatus({
          message: result.message || 'Service worker cleanup completed with warnings',
          type: 'warning',
          details: [
            'Service worker cleanup completed with warnings', 
            'Please refresh the page to complete the process'
          ]
        });
      }

      // Show refresh buttons regardless of result
      setShowRefreshButtons(true);
    } catch (error) {
      // Only update state if component is still mounted
      if (!isMounted.current) return;
      
      console.error('Error in cleanup:', error);
      updateModalStatus({
        message: 'Error during cleanup process',
        type: 'error',
        details: ['An unexpected error occurred', error instanceof Error ? error.message : 'Unknown error']
      });
      setShowRefreshButtons(true);
    }
  }, [updateModalStatus, setShowRefreshButtons, setToastConfig, setShowToast]);

  const techBadges = [
    { name: 'MERN Stack', color: 'bg-gradient-to-r from-primary to-secondary' },
    { name: 'TypeScript', color: 'bg-blue-500' },
    { name: 'Tailwind CSS', color: 'bg-sky-500' },
    { name: 'Framer Motion', color: 'bg-purple-500' }
  ]; 
  
  return (
    <>
      {/* Legacy toast for backward compatibility */}
      {showToast && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          action={toastConfig.action}
          onClose={() => setShowToast(false)}
        />
      )}
      <footer className="bg-card text-card-foreground py-12 border-t border-border relative overflow-hidden">
        {/* Background design elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-secondary blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            {/* Left side: Tech stack with badges */}
            <div className="md:w-1/3">
              <div className="flex items-center mb-6 gap-2">
                <Code size={20} className="text-primary" />
                <h3 className="text-lg font-bold">Built With</h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {techBadges.map((badge, index) => (
                  <motion.span
                    key={badge.name}
                    className={`px-3 py-1 ${badge.color} text-white text-xs rounded-full shadow-sm`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -2 }}
                  >
                    {badge.name}
                  </motion.span>
                ))}
              </div>
            </div>
            
            {/* Middle: Utilities */}
            <div className="md:w-1/3">
              <div className="flex items-center mb-6 gap-2">
                <Settings size={20} className="text-primary" />
                <h3 className="text-lg font-bold">Utilities</h3>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      // Show confirmation dialog when user clicks on "Fix Connection Issues"
                      showConfirmationModal({
                        message: 'Fix Connection Issues & Refresh Cache',
                        details: [
                          'This tool will attempt to fix the following issues:',
                          '• Problems with API connections',
                          '• Outdated or corrupted cache data',
                          '• Service worker conflicts',
                          '• CORS errors when refreshing pages',
                          'Click "Proceed with Cleanup" to continue or "Cancel" to exit'
                        ],
                        onConfirm: handleConfirmedCleanup
                      });
                    }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="text-left flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors text-sm hover:underline cursor-pointer group"
                  >
                    <RefreshCw size={14} className="opacity-70 group-hover:opacity-100" />
                    Fix Connection Issues & Refresh Cache
                    <HelpCircle size={12} className="opacity-50 group-hover:opacity-80" />
                  </button>

                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 top-full mt-2 p-3 bg-card border border-border rounded-md shadow-lg z-50 w-64"
                      >
                        <p className="text-xs text-foreground/80 mb-2">
                          This tool helps fix common issues:
                        </p>
                        <ul className="text-xs list-disc pl-4 text-foreground/70 space-y-1">
                          <li>CORS errors when refreshing</li>
                          <li>Outdated cached content</li>
                          <li>API connection problems</li>
                          <li>Service worker conflicts</li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right side: Legal */}
            <div>
              <div className="flex items-center mb-6 gap-2">
                <Shield size={20} className="text-primary" />
                <h3 className="text-lg font-bold">Legal</h3>
              </div>
              <div className="flex flex-col space-y-2">
                <a href="/privacy" className="text-foreground/70 hover:text-primary transition-colors text-sm hover:underline">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-foreground/70 hover:text-primary transition-colors text-sm hover:underline">
                  Terms of Service
                </a>
                <a href="/cookies" className="text-foreground/70 hover:text-primary transition-colors text-sm hover:underline">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>

          <motion.div
            className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-foreground/70">
              © {currentYear} <span className="font-medium text-foreground">Ruchira Tharanka</span>. All rights reserved.
            </p>

            <div className="mt-4 md:mt-0">
              <Link
                to="hero"
                spy={true}
                smooth={true}
                duration={800}
                className="group flex items-center gap-2 px-4 py-2 bg-card hover:bg-primary/10 text-foreground rounded-full transition-all cursor-pointer border border-border/50 hover:border-primary/50 shadow-sm"
                aria-label="Back to top"
              >
                <span className="text-sm">Back to top</span>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-primary rounded-full p-1 text-white"
                >
                  <ArrowUp size={12} />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
