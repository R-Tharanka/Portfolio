import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import logger from '../utils/logger';

interface ApiProviderProps {
  children: ReactNode;
}

interface ApiContextValue {
  isApiOnline: boolean;
  hasShownOfflineNotice: boolean;
  setHasShownOfflineNotice: (value: boolean) => void;
  axiosInstance: AxiosInstance;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

// Create axios instance with improved configuration
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  logger.log('Using API URL:', apiUrl);
  return apiUrl;
};

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);
  const [hasShownOfflineNotice, setHasShownOfflineNotice] = useState<boolean>(false);
  const [axiosInstance] = useState<AxiosInstance>(() => {
    // Create and configure the instance
    const instance = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        _t: Date.now() // Add timestamp to prevent caching
      }
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        // Refresh baseURL on each request
        config.baseURL = getApiBaseUrl();
        
        // Add timestamp parameter to prevent caching
        config.params = {
          ...config.params,
          _t: Date.now()
        };
        
        return config;
      },
      (error) => {
        logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => {
        // If we get a successful response, mark API as online
        setIsApiOnline(true);
        return response;
      },
      (error: AxiosError) => {
        // Handle different types of errors
        if (!error.response) {
          // Network errors (CORS, server down, etc.)
          setIsApiOnline(false);
          
          // Dispatch API error event for ApiOfflineNotice
          const event = new CustomEvent('api:error', {
            detail: { 
              type: 'network',
              details: {
                message: 'Unable to connect to server'
              }
            }
          });
          window.dispatchEvent(event);
          
          // Don't show toast for network errors, let ApiOfflineNotice handle it
          logger.error('Network error:', error.message);
        } else {
          // Server responded with error status
          const status = error.response.status;
          
          // Handle authentication errors
          if (status === 401) {
            localStorage.removeItem('adminToken');
            const tokenExpiredEvent = new CustomEvent('auth:tokenExpired');
            window.dispatchEvent(tokenExpiredEvent);
            logger.error('Authentication error:', error.response.data);
          } 
          // Only show toast for server errors, not network errors
          else if (status >= 500) {
            toast.error('Server error. Please try again later.');
            logger.error('Server error:', error.response.data);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return instance;
  });

  // Check API availability on mount and periodically
  useEffect(() => {
    // Track consecutive failures for more reliable offline detection
    let consecutiveFailures = 0;
    const MAX_FAILURES = 3; // Increased from 2 to 3 for more stability
    
    const checkApiAvailability = async () => {
      try {
        await axiosInstance.get('/health');
        // On successful health check:
        setIsApiOnline(true);
        consecutiveFailures = 0; // Reset failure counter on success
        logger.log('API health check: online');
      } catch (error) {
        // On failed health check:
        consecutiveFailures += 1;
        
        // Only set API as offline after consecutive failures to prevent flickering
        if (consecutiveFailures >= MAX_FAILURES) {
          setIsApiOnline(false);
          logger.error(`API health check failed ${consecutiveFailures} times:`, error);
        } else {
          // Still online until we reach threshold
          logger.warn(`API health check warning (attempt ${consecutiveFailures}/${MAX_FAILURES}):`, error);
          
          // Keep API online until we reach threshold
          if (consecutiveFailures === 1) {
            setIsApiOnline(true);
          }
        }
      }
    };

    // Initial check
    checkApiAvailability();
    
    // Set up interval to periodically check API availability
    const intervalId = setInterval(checkApiAvailability, 20000); // Check every 20 seconds
    
    return () => clearInterval(intervalId);
  }, [axiosInstance]);

  const value = {
    isApiOnline,
    hasShownOfflineNotice,
    setHasShownOfflineNotice,
    axiosInstance
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export default ApiContext;
