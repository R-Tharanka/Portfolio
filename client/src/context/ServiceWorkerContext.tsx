import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import ServiceWorkerModal from '../components/ui/ServiceWorkerModal';
import ManualResolutionGuide from '../components/ui/ManualResolutionGuide';
import { checkForServiceWorkerIssues } from '../utils/serviceWorkerCleanup';
import { runServiceWorkerDiagnostics, recoverFromSevereIssues } from '../utils/serviceWorkerDiagnostics';

export interface ModalStatus {
    message: string;
    type: 'loading' | 'success' | 'error' | 'warning';
    details: string[];
    progress?: number; // Optional progress indicator (0-100)
}

interface ServiceWorkerContextType {
    showModal: (status: ModalStatus) => void;
    hideModal: () => void;
    updateModalStatus: (status: ModalStatus) => void;
    setShowRefreshButtons: (show: boolean) => void;
    performDiagnostics: () => Promise<void>;
    runDetailedDiagnostics: () => Promise<any>;
    attemptRecovery: () => Promise<void>;
    showManualGuide: () => void;
    hideManualGuide: () => void;
    serviceWorkerStatus: {
        hasIssues: boolean;
        detectedIssues: string[];
        severity: 'low' | 'medium' | 'high';
        lastChecked: Date | null;
        isOffline: boolean;
    };
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
    autoCheckOnMount?: boolean;
}

export const ServiceWorkerProvider: React.FC<ServiceWorkerProviderProps> = ({
    children,
    autoCheckOnMount = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isManualGuideOpen, setIsManualGuideOpen] = useState(false);
    const [status, setStatus] = useState<ModalStatus>({
        message: 'Initializing cleanup...',
        type: 'loading',
        details: [],
        progress: 0
    });
    const [showRefreshButtons, setShowRefreshButtons] = useState(false);
    const [serviceWorkerStatus, setServiceWorkerStatus] = useState({
        hasIssues: false,
        detectedIssues: [] as string[],
        severity: 'low' as 'low' | 'medium' | 'high',
        lastChecked: null as Date | null,
        isOffline: navigator.onLine === false
    });
    const [diagnosticsInProgress, setDiagnosticsInProgress] = useState(false);

    // Monitor online/offline status
    useEffect(() => {
        // Functions to update online status
        const handleOnline = () => {
            setServiceWorkerStatus(prev => ({ ...prev, isOffline: false }));
        };

        const handleOffline = () => {
            setServiceWorkerStatus(prev => ({ ...prev, isOffline: true }));
        };

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Basic check for service worker issues
    const performDiagnostics = async (): Promise<void> => {
        try {
            setDiagnosticsInProgress(true);
            const result = await checkForServiceWorkerIssues();

            setServiceWorkerStatus(prev => ({
                ...prev,
                hasIssues: result.hasIssues,
                detectedIssues: result.issues,
                severity: result.severity,
                lastChecked: new Date()
            }));

            // If there are high severity issues, we could consider showing a notification
            if (result.hasIssues && result.severity === 'high') {
                console.warn('Service worker issues detected:', result.issues);
            }
        } catch (error) {
            console.error('Error performing service worker diagnostics:', error);
            setServiceWorkerStatus(prev => ({
                ...prev,
                lastChecked: new Date()
            }));
        } finally {
            setDiagnosticsInProgress(false);
        }
    };

    // Run advanced diagnostics with detailed reporting
    const runDetailedDiagnostics = async () => {
        setDiagnosticsInProgress(true);
        showModal({
            message: 'Running detailed diagnostics...',
            type: 'loading',
            details: ['Checking service worker registrations', 'Analyzing cache storage', 'Verifying API connectivity'],
            progress: 10
        });

        try {
            // Run the comprehensive diagnostics
            const diagnosticResults = await runServiceWorkerDiagnostics();

            // Update the modal with results
            updateModalStatus({
                message: `Diagnostics complete: ${diagnosticResults.overallStatus}`,
                type: diagnosticResults.hasSevereIssues ? 'error' :
                    diagnosticResults.overallStatus === 'warning' ? 'warning' : 'success',
                details: [
                    ...diagnosticResults.results
                        .filter(r => r.status === 'fail' || r.status === 'warning')
                        .map(r => `${r.category}: ${r.message}`),
                    ...diagnosticResults.recommendations.slice(0, 3)
                ],
                progress: 100
            });

            // Show refresh buttons if issues were found
            setShowRefreshButtons(diagnosticResults.hasSevereIssues || diagnosticResults.overallStatus !== 'healthy');

            // If there are severe issues, suggest the manual guide
            if (diagnosticResults.hasSevereIssues) {
                // Add a "Show manual guide" action to the modal
                setStatus(prev => ({
                    ...prev,
                    details: [
                        ...(prev.details || []),
                        'Serious issues detected. Consider using the manual resolution guide.'
                    ]
                }));
            }

            return diagnosticResults;
        } catch (error) {
            console.error('Error running detailed diagnostics:', error);
            updateModalStatus({
                message: 'Diagnostics failed',
                type: 'error',
                details: ['Error running diagnostics', error instanceof Error ? error.message : 'Unknown error'],
                progress: 100
            });
            setShowRefreshButtons(true);
            return null;
        } finally {
            setDiagnosticsInProgress(false);
        }
    };

    // Advanced recovery for severe service worker issues
    const attemptRecovery = async (): Promise<void> => {
        showModal({
            message: 'Attempting advanced recovery...',
            type: 'loading',
            details: ['This will attempt to fix severe service worker issues', 'The process may take a few moments'],
            progress: 5
        });

        try {
            const recoveryResult = await recoverFromSevereIssues();

            if (recoveryResult.success) {
                updateModalStatus({
                    message: 'Recovery successful',
                    type: 'success',
                    details: [
                        `Recovery type: ${recoveryResult.recoveryType}`,
                        ...recoveryResult.actions.slice(0, 5)
                    ],
                    progress: 100
                });
            } else {
                updateModalStatus({
                    message: 'Recovery partially successful',
                    type: 'warning',
                    details: [
                        `Recovery type: ${recoveryResult.recoveryType}`,
                        ...recoveryResult.actions.slice(0, 5),
                        'Some issues may require manual intervention.'
                    ],
                    progress: 100
                });
            }

            setShowRefreshButtons(true);
        } catch (error) {
            console.error('Error during recovery attempt:', error);
            updateModalStatus({
                message: 'Recovery failed',
                type: 'error',
                details: ['Error during recovery process', error instanceof Error ? error.message : 'Unknown error'],
                progress: 100
            });
            setShowRefreshButtons(true);
        }
    };

    // Show the manual resolution guide
    const showManualGuide = () => {
        setIsManualGuideOpen(true);
    };

    // Hide the manual resolution guide
    const hideManualGuide = () => {
        setIsManualGuideOpen(false);
    };

    // Run diagnostics when component mounts if autoCheckOnMount is enabled
    useEffect(() => {
        if (autoCheckOnMount) {
            // Run after a slight delay to allow the page to finish loading
            const timer = setTimeout(() => {
                performDiagnostics();
            }, 3000); // 3 second delay to not impact page load performance

            return () => clearTimeout(timer);
        }
    }, [autoCheckOnMount]);
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
        // Ensure the modal appears on top of everything
        setStatus(initialStatus);
        // Slight delay to ensure smooth animation
        setTimeout(() => {
            setIsOpen(true);
        }, 10);
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
                setShowRefreshButtons,
                performDiagnostics,
                runDetailedDiagnostics,
                attemptRecovery,
                showManualGuide,
                hideManualGuide,
                serviceWorkerStatus
            }}
        >
            {children}

            {/* Service Worker Modal - For cleanup and diagnostics */}
            <ServiceWorkerModal
                isOpen={isOpen}
                onClose={hideModal}
                status={status}
                onRefresh={handleRefresh}
                onHomeRefresh={handleHomeRefresh}
                showRefreshButtons={showRefreshButtons}
                onShowManualGuide={showManualGuide}
                diagnosticsInProgress={diagnosticsInProgress}
            />

            {/* Manual Resolution Guide - For users to manually fix issues */}
            <ManualResolutionGuide
                isOpen={isManualGuideOpen}
                onClose={hideManualGuide}
            />
        </ServiceWorkerContext.Provider>
    );
};
