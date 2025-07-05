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
      
      // Check if it's a network error message from the API service
      if (title?.toLowerCase().includes('api connection error') || 
          title?.toLowerCase().includes('network error') ||
          message?.toLowerCase().includes('server is unreachable') ||
          message?.toLowerCase().includes('cors')) {
        // Suppress toast for API network errors - ApiOfflineNotice will handle this
        console.log('Network error toast suppressed:', title, message);
        return;
      }
      
      // Show other toasts normally
      addToast(title, message, type);
    };
    
    // Listen for API error events - but don't show network errors as toast
    // since they're already shown in the ApiOfflineNotice
    const handleApiError = (event: CustomEvent) => {
      const { type } = event.detail;
      
      // Only show server errors as toasts (not network errors)
      if (type === 'server') {
        addToast(
          'Server Error',
          'Our servers are having issues. Please try again later.',
          'error'
        );
      } else if (type === 'network' || type === 'connection' || type === 'cors') {
        // Explicitly do nothing - ApiOfflineNotice handles these errors
        console.log('Network error intercepted by ToastManager - suppressing toast notification');
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
