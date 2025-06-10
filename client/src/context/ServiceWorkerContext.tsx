import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
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
    showConfirmationModal: (options: {
        message: string;
        details: string[];
        onConfirm: () => void;
    }) => void;
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
    const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

    // Use useCallback for all handlers to prevent unnecessary re-renders

    // Handlers for the modal
    const handleRefresh = useCallback(() => {
        // Force a clean reload
        window.location.reload();
    }, []);

    const handleHomeRefresh = useCallback(() => {
        // Redirect to home page with cache busting
        const timestamp = Date.now();
        window.location.href = `/?_t=${timestamp}`;
    }, []);

    // Method for cleanup confirmation - using useCallback to ensure stable reference
    const onConfirmCleanup = useCallback(() => {
        if (confirmCallback) {
            const callback = confirmCallback;
            setConfirmCallback(null); // Clear callback first to prevent potential issues
            callback(); // Then execute the callback
        }
    }, [confirmCallback]);

    // Context methods
    const showModal = useCallback((initialStatus: ModalStatus) => {
        setStatus(initialStatus);
        setIsOpen(true);
    }, []);

    const hideModal = useCallback(() => {
        setIsOpen(false);
        // Clear any confirmation callback when hiding modal
        setConfirmCallback(null);
    }, []);

    const updateModalStatus = useCallback((newStatus: ModalStatus) => {
        setStatus(newStatus);
    }, []);
    // Method to show confirmation modal with callback
    const showConfirmationModal = useCallback((options: {
        message: string;
        details: string[];
        onConfirm: () => void;
    }) => {
        setConfirmCallback(() => options.onConfirm);
        setStatus({
            message: options.message,
            type: 'warning',
            details: options.details
        });
        setShowRefreshButtons(true);
        setIsOpen(true);
    }, []);

    // Create memoized context value to prevent unnecessary re-renders
    const contextValue = React.useMemo(() => ({
        showModal,
        hideModal,
        updateModalStatus,
        setShowRefreshButtons,
        showConfirmationModal
    }), [
        showModal,
        hideModal,
        updateModalStatus,
        setShowRefreshButtons,
        showConfirmationModal
    ]);

    return (
        <ServiceWorkerContext.Provider value={contextValue}>
            {children}

            {/* Service Worker Modal - Rendered at the root level for proper positioning */}
            <ServiceWorkerModal
                isOpen={isOpen}
                onClose={hideModal}
                status={status}
                onRefresh={handleRefresh}
                onHomeRefresh={handleHomeRefresh}
                showRefreshButtons={showRefreshButtons}
                onConfirm={confirmCallback ? onConfirmCleanup : undefined}
            />
        </ServiceWorkerContext.Provider>
    );
};
