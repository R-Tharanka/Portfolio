import React, { createContext, useState, useContext, ReactNode } from 'react';
import ServiceWorkerModal from '../components/ui/ServiceWorkerModal';

interface ModalStatus {
  message: string;
  type: 'loading' | 'success' | 'error' | 'warning';
  details: string[];
}

interface ServiceWorkerContextType {
  showModal: (status: ModalStatus) => void;
  hideModal: () => void;
  updateModalStatus: (status: ModalStatus) => void;
  setShowRefreshButtons: (show: boolean) => void;
}

const ServiceWorkerContext = createContext<ServiceWorkerContextType | undefined>(undefined);

export const useServiceWorker = () => {
  const context = useContext(ServiceWorkerContext);
  if (!context) {
    throw new Error('useServiceWorker must be used within a ServiceWorkerProvider');
  }
  return context;
};

interface ServiceWorkerProviderProps {
  children: ReactNode;
}

export const ServiceWorkerProvider: React.FC<ServiceWorkerProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ModalStatus>({
    message: 'Initializing cleanup...',
    type: 'loading',
    details: []
  });
  const [showRefreshButtons, setShowRefreshButtons] = useState(false);

  // Handlers for the modal
  const handleRefresh = () => {
    // Force a clean reload
    window.location.reload();
  };

  const handleHomeRefresh = () => {
    // Redirect to home page with cache busting
    const timestamp = Date.now();
    window.location.href = `/?_t=${timestamp}`;
  };

  // Context methods
  const showModal = (initialStatus: ModalStatus) => {
    setStatus(initialStatus);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  const updateModalStatus = (newStatus: ModalStatus) => {
    setStatus(newStatus);
  };

  return (
    <ServiceWorkerContext.Provider 
      value={{ 
        showModal, 
        hideModal, 
        updateModalStatus,
        setShowRefreshButtons
      }}
    >
      {children}
      
      {/* Service Worker Modal - Rendered at the root level for proper positioning */}
      <ServiceWorkerModal
        isOpen={isOpen}
        onClose={hideModal}
        status={status}
        onRefresh={handleRefresh}
        onHomeRefresh={handleHomeRefresh}
        showRefreshButtons={showRefreshButtons}
      />
    </ServiceWorkerContext.Provider>
  );
};
