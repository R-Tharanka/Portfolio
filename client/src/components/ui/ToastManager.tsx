import React, { useState, useEffect } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

const ToastManager: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    // Listen for toast events
    const handleErrorToast = (event: CustomEvent) => {
      const { title, message, type = 'error' } = event.detail;
      addToast(title, message, type);
    };
    
    // Listen for API error events
    const handleApiError = (event: CustomEvent) => {
      const { type } = event.detail;
      
      // Set appropriate toast messages based on error type
      if (type === 'network') {
        addToast(
          'Connection Error', 
          'Unable to connect to the server. Some features may be limited.',
          'error'
        );
      } else if (type === 'server') {
        addToast(
          'Server Error',
          'Our servers are having issues. Please try again later.',
          'error'
        );
      }
    };

    // Add event listeners
    window.addEventListener('toast:error' as any, handleErrorToast);
    window.addEventListener('toast:success' as any, handleErrorToast);
    window.addEventListener('toast:warning' as any, handleErrorToast);
    window.addEventListener('toast:info' as any, handleErrorToast);
    window.addEventListener('api:error' as any, handleApiError);

    // Clean up
    return () => {
      window.removeEventListener('toast:error' as any, handleErrorToast);
      window.removeEventListener('toast:success' as any, handleErrorToast);
      window.removeEventListener('toast:warning' as any, handleErrorToast);
      window.removeEventListener('toast:info' as any, handleErrorToast);
      window.removeEventListener('api:error' as any, handleApiError);
    };
  }, []);

  const addToast = (title: string, message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prevent duplicate toasts within a short time period
    // Only show one of each error type at a time
    setToasts(prevToasts => {
      const existingSimilarToast = prevToasts.find(
        toast => toast.title === title && toast.type === type
      );
      
      if (existingSimilarToast) {
        return prevToasts;
      }
      
      return [...prevToasts, { id, title, message, type }];
    });
  };

  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={`${toast.title}: ${toast.message}`}
          type={toast.type}
          duration={5000}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default ToastManager;
