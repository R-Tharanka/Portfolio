import React from 'react';
import { Link } from 'react-scroll';
import { ArrowUp, Code, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const techBadges = [
    { name: 'MERN Stack', color: 'bg-gradient-to-r from-primary to-secondary' },
    { name: 'TypeScript', color: 'bg-blue-500' },
    { name: 'Tailwind CSS', color: 'bg-sky-500' },
    { name: 'Framer Motion', color: 'bg-purple-500' }
  ];

  return (
    <footer className="bg-card text-card-foreground py-12 border-t border-border relative overflow-hidden">
      {/* Background design elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-secondary blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Left side: Tech stack with badges */}
          <div className="md:w-1/2">
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