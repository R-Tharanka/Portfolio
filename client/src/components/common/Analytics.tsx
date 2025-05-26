import React, { useEffect } from 'react';

interface AnalyticsProps {
  measurementId?: string; // Google Analytics measurement ID
}

const Analytics: React.FC<AnalyticsProps> = ({ 
  measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID 
}) => {
  useEffect(() => {
    if (measurementId && typeof window !== 'undefined') {
      // Load Google Tag Manager
      const loadGTM = () => {
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        script.async = true;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', measurementId);
      };
      
      loadGTM();
    }
  }, [measurementId]);
  
  // This component doesn't render anything
  return null;
};

export default Analytics;

// Add type definition for GTM
declare global {
  interface Window {
    dataLayer: any[];
  }
}