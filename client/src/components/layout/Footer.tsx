import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { ArrowUp, Code, Shield, Settings, RefreshCw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../utils/serviceWorkerCleanup'; // Import the file that declares the global function
import Toast from '../ui/Toast';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    action: undefined as { label: string; onClick: () => void } | undefined
  });
  const [showTooltip, setShowTooltip] = useState(false);

  // Expose toast handlers for service worker cleanup
  React.useEffect(() => {
    window._showServiceWorkerToast = (config) => {
      setToastConfig({
        message: config.message,
        type: config.type,
        action: config.action
      });
      setShowToast(true);
    };

    window._hideServiceWorkerToast = () => {
      setShowToast(false);
    };

    return () => {
      window._showServiceWorkerToast = undefined;
      window._hideServiceWorkerToast = undefined;
    };
  }, []);  const handleCleanup = async () => {
    // Set up a loading state to provide immediate feedback
    setToastConfig({
      message: 'Cleaning up service workers and cache...',
      type: 'info',
      action: undefined
    });
    setShowToast(true);
    
    // Call the cleanup function with automatic redirection to home
    await window.cleanupServiceWorker({
      showToast: true,
      redirectToHome: true
    });
  };

  const techBadges = [
    { name: 'MERN Stack', color: 'bg-gradient-to-r from-primary to-secondary' },
    { name: 'TypeScript', color: 'bg-blue-500' },
    { name: 'Tailwind CSS', color: 'bg-sky-500' },
    { name: 'Framer Motion', color: 'bg-purple-500' }
  ];
  return (
    <footer className="bg-card text-card-foreground py-12 border-t border-border relative overflow-hidden">
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