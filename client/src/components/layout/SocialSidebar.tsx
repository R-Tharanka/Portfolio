import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Facebook, Instagram, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SocialMedia } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import whatsappL from '../../assets/img/icons/whatsapp-light.png'
import whatsappD from '../../assets/img/icons/whatsapp-dark.png'

const SocialSidebar: React.FC = () => {
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

  return (
    <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 hidden md:flex items-center">
      {/* Position the toggle button at the edge of the screen */}
      <motion.button
        onClick={toggleSidebar}
        className={`
          p-1 
          bg-card/60
          rounded-r-md 
          h-20 
          shadow-lg 
          flex 
          items-center 
          justify-center 
          backdrop-blur-md 
          border-[1px] 
          border-border/40
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
        {isExpanded ? 
          <ChevronsLeft size={18} className="text-foreground transition-colors group-hover:text-primary" /> : 
          <ChevronsRight size={18} className="text-primary transition-colors" />
        }
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
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
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