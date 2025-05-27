import React from 'react';
import { Link } from 'react-scroll';
import { ArrowUp} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground py-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Tech Stack */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Built With</h3>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>React + TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Framer Motion</li>
              <li>Node.js + Express</li>
              <li>MongoDB</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-foreground/70 hover:text-primary transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms" className="text-foreground/70 hover:text-primary transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="/cookies" className="text-foreground/70 hover:text-primary transition-colors">Cookie Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-foreground/70">
              © {currentYear} Ruchira Tharanka. All rights reserved.
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