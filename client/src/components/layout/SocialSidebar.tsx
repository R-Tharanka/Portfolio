import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Facebook, Instagram } from 'lucide-react';
import { SocialMedia } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import whatsappL from '../../assets/img/icons/whatsapp-light.png'
import whatsappD from '../../assets/img/icons/whatsapp-dark.png'

const SocialSidebar: React.FC = () => {
  const socialLinks: SocialMedia[] = [
    {
      platform: 'GitHub',
      url: 'https://github.com/R-Tharanka',
      icon: 'github'
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/ruchira-tharanka-b020992a6',
      icon: 'linkedin'
    },
    {
      platform: 'Facebook',
      url: 'https://www.facebook.com/ruchira.tharanka',
      icon: 'facebook'
    },
    {
      platform: 'Instagram',
      url: 'https://www.instagram.com/ruchira_tharanka?igsh=YzljYTk1ODg3Zg==',
      icon: 'instagram'
    },
    {
      platform: 'WhatsApp',
      url: 'https://wa.me/+94713498585',
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
  
  return (
    <motion.div 
      className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden md:flex flex-col items-center space-y-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {visibleLinks.map((social, index) => (
        <motion.a
          key={social.platform}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-card hover:bg-primary text-foreground hover:text-white rounded-full transition-colors duration-300 shadow-md relative group"
          aria-label={social.platform}
          whileHover={{ x: 5, transition: { duration: 0.2 } }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          {getIcon(social.icon)}
          <span className="absolute left-full ml-2 px-2 py-1 bg-card text-foreground text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
            {social.platform === 'WhatsApp' ? 'whatsappL' : social.platform}
          </span>
        </motion.a>
      ))}
    </motion.div>
  );
};

export default SocialSidebar;