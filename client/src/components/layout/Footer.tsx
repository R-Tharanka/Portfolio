import React from 'react';
import { Link } from 'react-scroll';
import { ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground py-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-foreground/70">
              © {currentYear} Developer Portfolio. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center">
            <Link
              to="hero"
              spy={true}
              smooth={true}
              duration={800}
              className="p-3 rounded-full bg-primary hover:bg-primary-dark text-white transition-colors cursor-pointer"
              aria-label="Back to top"
            >
              <ArrowUp size={16} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;