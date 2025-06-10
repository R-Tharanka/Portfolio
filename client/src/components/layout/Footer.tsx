import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { ArrowUp, Code, Shield, Settings, RefreshCw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../utils/serviceWorkerCleanup'; // Import the file that declares the global function
import Toast from '../ui/Toast';
import ServiceWorkerModal from '../ui/ServiceWorkerModal';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    action: undefined as { label: string; onClick: () => void } | undefined
  });
  const [showTooltip, setShowTooltip] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<{
    message: string;
    type: 'loading' | 'success' | 'error' | 'warning';
    details: string[];
  }>({
    message: 'Initializing cleanup...',
    type: 'loading',
    details: []
  });
  const [showRefreshButtons, setShowRefreshButtons] = useState(false);

  // Expose toast handlers for service worker cleanup
  // Now also manages the modal status
  React.useEffect(() => {
    window._showServiceWorkerToast = (config) => {
      // For backward compatibility, still update toast
      setToastConfig({
        message: config.message,
        type: config.type,
        action: config.action
      });

      // Update modal status based on toast config
      setModalStatus(prev => ({
        message: config.message,
        type: config.type === 'success' ? 'success' :
          config.type === 'error' ? 'error' :
            config.type === 'warning' ? 'warning' : 'loading',
        details: [...prev.details, config.message]
      }));

      // For success or error states, show refresh buttons
      if (config.type === 'success' || config.type === 'error' || config.type === 'warning') {
        setShowRefreshButtons(true);
      }
    };

    window._hideServiceWorkerToast = () => {
      setShowToast(false);
      // We don't auto-close the modal, since it has its own close button
    };

    return () => {
      window._showServiceWorkerToast = undefined;
      window._hideServiceWorkerToast = undefined;
    };
  }, []);

  const handleCleanup = async () => {
    // Initial modal state
    setModalStatus({
      message: 'Checking service workers...',
      type: 'loading',
      details: ['Initializing cleanup process...']
    });
    setShowModal(true);
    setShowRefreshButtons(false);

    try {
      // Update status as we go
      setTimeout(() => {
        setModalStatus(prev => ({
          ...prev,
          message: 'Finding service worker registrations...',
          details: [...prev.details, 'Searching for active service workers...']
        }));
      }, 500);

      setTimeout(() => {
        setModalStatus(prev => ({
          ...prev,
          message: 'Clearing browser caches...',
          details: [...prev.details, 'Removing cached API responses...']
        }));
      }, 1200);

      // Call the actual cleanup function with home redirection
      const result = await window.cleanupServiceWorker({
        showToast: false, // Don't show toast since we're showing modal
        redirectToHome: false // We'll handle redirection in the modal
      });

      // Update the modal with the result
      if (result?.type === 'success') {
        setModalStatus({
          message: result.message,
          type: 'success',
          details: [
            'Successfully unregistered all service workers',
            'Cleared browser caches',
            'Removed stored API URLs',
            'Ready to reload with fresh data'
          ]
        });
      } else if (result?.type === 'error') {
        setModalStatus({
          message: result.message,
          type: 'error',
          details: ['An error occurred during cleanup', result.message]
        });
      } else if (result?.type === 'warning') {
        setModalStatus({
          message: result.message,
          type: 'warning',
          details: ['Service worker cleanup completed with warnings']
        });
      }

      // Show refresh buttons regardless of result
      setShowRefreshButtons(true);
    } catch (error) {
      console.error('Error in cleanup:', error);
      setModalStatus({
        message: 'Error during cleanup process',
        type: 'error',
        details: ['An unexpected error occurred', error instanceof Error ? error.message : 'Unknown error']
      });
      setShowRefreshButtons(true);
    }
  };

  const techBadges = [
    { name: 'MERN Stack', color: 'bg-gradient-to-r from-primary to-secondary' },
    { name: 'TypeScript', color: 'bg-blue-500' },
    { name: 'Tailwind CSS', color: 'bg-sky-500' },
    { name: 'Framer Motion', color: 'bg-purple-500' }
  ];  // Handlers for the service worker modal
  const handleRefresh = () => {
    // Force a clean reload
    window.location.reload();
  };

  const handleHomeRefresh = () => {
    // Redirect to home page with cache busting
    const timestamp = Date.now();
    window.location.href = `/?_t=${timestamp}`;
  };

  return (
    <footer className="bg-card text-card-foreground py-12 border-t border-border relative overflow-hidden">
      {/* Service Worker cleanup modal */}
      <ServiceWorkerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
        onRefresh={handleRefresh}
        onHomeRefresh={handleHomeRefresh}
        showRefreshButtons={showRefreshButtons}
      />

      {/* Legacy toast for backward compatibility */}
      {showToast && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          action={toastConfig.action}
          onClose={() => setShowToast(false)}
        />
      )}
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
                  onClick={handleCleanup}
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
  );
};

export default Footer;