// Utility to unregister old service workers
export const unregisterServiceWorkers = async () => {
    if ('serviceWorker' in navigator) {
        try {
            // Get all registered service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`Found ${registrations.length} service worker registrations`);

            let unregisteredCount = 0;

            // Unregister each service worker
            for (const registration of registrations) {
                console.log(`Unregistering service worker from: ${registration.scope}`);
                const result = await registration.unregister();
                if (result) {
                    console.log('Service worker unregistered successfully');
                    unregisteredCount++;
                } else {
                    console.warn('Service worker unregistration failed');
                }
            }

            // Clear caches to remove any cached API URLs or responses
            if ('caches' in window) {
                const cacheKeys = await window.caches.keys();
                console.log(`Found ${cacheKeys.length} caches`);

                let deletedCaches = 0;

                await Promise.all(
                    cacheKeys.map(async (cacheKey) => {
                        console.log(`Deleting cache: ${cacheKey}`);
                        const deleted = await window.caches.delete(cacheKey);
                        if (deleted) deletedCaches++;
                    })
                );

                console.log(`Successfully deleted ${deletedCaches} of ${cacheKeys.length} caches`);
            }

            // Clear any API or other application storage
            try {
                // Clear localStorage items related to API URLs or caching
                const keysToRemove = ['api-url', 'sw-needs-cleanup', 'cached-data'];
                keysToRemove.forEach(key => {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                        console.log(`Removed localStorage item: ${key}`);
                    }
                });

                // Clear sessionStorage 
                sessionStorage.clear();
                console.log('SessionStorage cleared');
            } catch (storageError) {
                console.warn('Error clearing storage:', storageError);
            }

            console.log('Service worker cleanup completed');
            return {
                success: true,
                workersUnregistered: unregisteredCount,
                hadWorkers: registrations.length > 0
            };
        } catch (error) {
            console.error('Error during service worker cleanup:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    return { success: false, notSupported: true };
};

// Function to force a clean reload bypassing cache
export const forceRefresh = (redirectUrl?: string) => {
    console.log('Forcing page refresh...');

    // Add a timestamp to bust cache
    const timestamp = Date.now();

    // Determine target URL (either current URL or a specific redirect URL)
    const targetUrl = redirectUrl ? new URL(redirectUrl, window.location.origin) : new URL(window.location.href);

    // Remove any existing timestamp parameter
    targetUrl.searchParams.delete('_t');

    // Add fresh timestamp parameter
    targetUrl.searchParams.set('_t', timestamp.toString());

    // Set cache control headers if possible (via fetch)
    try {
        fetch(window.location.href, {
            cache: 'reload',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        }).catch(e => console.log('Prefetch for cache busting:', e));
    } catch (e) {
        // Fetch might fail but we'll still do the refresh
        console.log('Prefetch for cache busting failed:', e);
    }

    // Reload with cache busting
    window.location.href = targetUrl.toString();
};

// Type declarations are now inside the below interface

// Define interface for the toast configuration
interface ToastConfig {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    action?: {
        label: string;
        onClick: () => void;
    };
}

// Define interface for global toast state
declare global {
    interface Window {
        cleanupServiceWorker: (options?: { 
            showToast?: boolean, 
            redirectToHome?: boolean,
            noAutoRefresh?: boolean 
        }) => Promise<ToastConfig | null>;
        _serviceWorkerToastState?: ToastConfig;
        _showServiceWorkerToast?: (config: ToastConfig) => void;
        _hideServiceWorkerToast?: () => void;
    }
}

// Expose a global function to allow debugging from console or UI usage
window.cleanupServiceWorker = async (options = { 
    showToast: true, 
    redirectToHome: false, 
    noAutoRefresh: false 
}) => {
    const result = await unregisterServiceWorkers();
    let toastConfig: ToastConfig | null = null;

    if (result.success) {
        let message = '';
        if (result.hadWorkers) {
            message = `${result.workersUnregistered} service worker(s) unregistered. Caches cleared.`;
        } else {
            message = 'Cache and service workers cleaned up successfully.';
        }

        toastConfig = {
            show: true,
            message,
            type: 'success',
            action: {
                label: 'Refresh Now',
                onClick: () => forceRefresh(options.redirectToHome ? '/' : undefined)
            }
        };        // Only auto-refresh if explicitly NOT prevented (respect the noAutoRefresh flag)
        if (!options.showToast && options.noAutoRefresh !== true) {
            console.log("Auto-refreshing page after service worker cleanup");
            setTimeout(() => {
                forceRefresh(options.redirectToHome ? '/' : undefined);
            }, 500);
        } else if (options.noAutoRefresh === true) {
            console.log("Auto-refresh prevented, leaving refresh control to UI");
        }
        
        // If noAutoRefresh is true, we leave it to the UI to handle refreshing
    } else if (result.notSupported) {
        toastConfig = {
            show: true,
            message: 'Service workers are not supported in this browser.',
            type: 'warning'
        };
    } else {
        toastConfig = {
            show: true,
            message: `Error: ${result.error || 'Unknown error during cleanup'}`,
            type: 'error',
            action: {
                label: 'Try Again',
                onClick: () => window.cleanupServiceWorker(options)
            }
        };
    }
      // If configured to show toast and the toast handler exists, show it
    if (options.showToast && toastConfig && window._showServiceWorkerToast) {
        // Add a slight delay to ensure proper stacking order with modals
        setTimeout(() => {
            if (window._showServiceWorkerToast) {
                window._showServiceWorkerToast(toastConfig!);
            }
        }, 100);
    }
    
    return toastConfig;
};

// Helper function to check if the app is experiencing service worker issues
export const checkForServiceWorkerIssues = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) return false;

    try {
        // Check for multiple service worker registrations (which can cause conflicts)
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 1) {
            console.warn(`Multiple service workers detected (${registrations.length}). This may cause issues.`);
            return true;
        }

        // Check for failing fetch requests that might indicate a problematic service worker
        const networkIssues = localStorage.getItem('network-errors');
        if (networkIssues && parseInt(networkIssues) > 3) {
            console.warn(`Multiple network errors detected (${networkIssues}). This may indicate service worker issues.`);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error checking for service worker issues:', error);
        return false;
    }
};
