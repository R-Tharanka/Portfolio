import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Facebook, Instagram, ChevronsLeft } from 'lucide-react';
import { SocialMedia } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import whatsappL from '../../assets/img/icons/whatsapp-light.png'
import whatsappD from '../../assets/img/icons/whatsapp-dark.png'

// Separate component for the animated gradient chevrons
const AnimatedGradientChevrons: React.FC = () => {
  // Generate unique IDs for each gradient to avoid conflicts
  const uniqueId = React.useId();
  const firstGradientId = `chevron-gradient-1-${uniqueId}`;
  const secondGradientId = `chevron-gradient-2-${uniqueId}`;
  
  return (
    <div className="flex items-center justify-center w-full relative">
      <div className="absolute w-full h-full bg-primary/20 rounded-full filter blur-md animate-pulse"></div>
      
      {/* SVG container */}
      <div className="relative z-10 flex items-center justify-center w-full">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="28" 
          height="24" 
          viewBox="0 0 28 24"
          className="drop-shadow-[0_0_4px_rgba(99,102,241,0.6)]"
        >
          <defs>
            {/* First gradient for first chevron */}
            <linearGradient id={firstGradientId} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" className="animate-gradient-stop-1" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" className="animate-gradient-stop-2" />
            </linearGradient>
            
            {/* Second gradient for second chevron */}
            <linearGradient id={secondGradientId} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" className="animate-gradient-stop-2" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" className="animate-gradient-stop-1" />
            </linearGradient>
          </defs>
          
          {/* Two chevrons with different gradients */}
          <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 19L15 12L8 5" stroke={`url(#${firstGradientId})`} />
            <path d="M17 19L24 12L17 5" stroke={`url(#${secondGradientId})`} />
          </g>
        </svg>
      </div>
    </div>
  );
};

// No longer using a text-based gradient since it doesn't work with SVG

// No need for a separate style variable since we're using Tailwind's animate-pulse

const SocialSidebar: React.FC = () => {
  // Add a style tag in the component for animating the SVG gradient
  React.useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Animation for gradient stops */
      @keyframes gradientFlow {
        0% {
          stop-color: rgb(59, 130, 246); /* primary blue */
        }
        50% {
          stop-color: rgb(139, 92, 246); /* secondary purple */
        }
        100% {
          stop-color: rgb(59, 130, 246); /* back to primary blue */
        }
      }
      
      @keyframes gradientFlowReverse {
        0% {
          stop-color: rgb(139, 92, 246); /* secondary purple */
        }
        50% {
          stop-color: rgb(59, 130, 246); /* primary blue */
        }
        100% {
          stop-color: rgb(139, 92, 246); /* back to secondary purple */
        }
      }
      
      /* Animation classes for the gradient stops */
      .animate-gradient-stop-1 {
        animation: gradientFlow 3s ease-in-out infinite;
      }
      
      .animate-gradient-stop-2 {
        animation: gradientFlowReverse 3s ease-in-out infinite;
      }
      
      /* Add a slight pulse effect to enhance visibility */
      @keyframes subtlePulse {
        0% {
          stroke-width: 2.5;
        }
        50% {
          stroke-width: 3;
        }
        100% {
          stroke-width: 2.5;
        }
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  // Initialize state from localStorage if available, default to true (expanded)
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = localStorage.getItem('socialSidebarExpanded');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  
  const socialLinks: SocialMedia[] = [
    {
      platform: 'GitHub',
      url: import.meta.env.VITE_GITHUB_URL || '',
      icon: 'github'
    },
    {
      platform: 'LinkedIn',
      url: import.meta.env.VITE_LINKEDIN_URL || '',
      icon: 'linkedin'
    },
    {
      platform: 'Facebook',
      url: import.meta.env.VITE_FACEBOOK_URL || '',
      icon: 'facebook'
    },
    {
      platform: 'Instagram',
      url: import.meta.env.VITE_INSTAGRAM_URL || '',
      icon: 'instagram'
    },
    {
      platform: 'WhatsApp',
      url: import.meta.env.VITE_WHATSAPP_URL || '',
      icon: 'whatsapp'
    }
  ];

  const { theme } = useTheme();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'github':
        return <Github size={20} />;
      case 'linkedin':
        return <Linkedin size={20} />;
      case 'facebook':
        return <Facebook size={20} />;
      case 'instagram':
        return <Instagram size={20} />;
      case 'whatsapp':
        return <img src={theme === 'dark' ? whatsappD : whatsappL} alt="WhatsApp" width={20} height={20} />;
      default:
        return null;
    }
  };

  // Filter out WhatsApp and Facebook
  const visibleLinks = socialLinks.filter(
    link => link.platform !== 'WhatsApp' && link.platform !== 'Facebook'
  );

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    // Save preference to localStorage
    localStorage.setItem('socialSidebarExpanded', JSON.stringify(newState));
  };

  // No need for custom keyframes since we're using Tailwind's animate-pulse
  
  return (
    <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 hidden md:flex items-center">
      {/* Position the toggle button at the edge of the screen */}
      <motion.button
        onClick={toggleSidebar}
        className={`
          p-[0px] 
          ${isExpanded ? 'bg-card/60' : 'bg-card/70'} 
          rounded-r-md 
          h-20 
          ${isExpanded ? 'shadow-lg' : 'shadow-lg shadow-primary/20'} 
          flex 
          items-center 
          justify-center 
          backdrop-blur-md 
          border-[1px] 
          ${isExpanded ? 'border-border/40' : 'border-primary/40'}
          hover:border-primary/50 
          transition-all 
          duration-300
          group
        `}
        whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        aria-label={isExpanded ? "Hide social links" : "Show social links"}
        title={isExpanded ? "Hide sidebar" : "Show sidebar"}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        {isExpanded ? (
          <ChevronsLeft size={20} className="text-foreground transition-colors group-hover:text-primary" />
        ) : (
          <AnimatedGradientChevrons />
        )}
      </motion.button>
      
      <motion.div
        className={`flex flex-col items-center space-y-4 ml-2 ${isExpanded ? '' : 'pointer-events-none'}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ 
          opacity: isExpanded ? 1 : 0, 
          x: 0,
          translateX: isExpanded ? 0 : -100
        }}
        transition={{ duration: 0.3 }}
      >
        {visibleLinks.map((social, index) => (
          <motion.a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-card/80 hover:bg-primary/90 text-foreground hover:text-white rounded-full transition-all duration-300 shadow-md relative group backdrop-blur-sm border border-border/30"
            aria-label={social.platform}
            whileHover={{ x: 5, boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)", transition: { duration: 0.2 } }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            style={{
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)'
            }}
          >
            {getIcon(social.icon)}
            <span className="absolute left-full ml-2 px-2 py-1 bg-card/80 border border-border/30 backdrop-blur-md text-foreground text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity z-10 shadow-md">
              {social.platform}
            </span>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
};

export default SocialSidebar;