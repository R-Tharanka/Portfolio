/**
 * Enhanced utility to unregister old service workers with better error handling and diagnostics
 */
export const unregisterServiceWorkers = async () => {
    if ('serviceWorker' in navigator) {
        try {
            // Start performance measurement
            const startTime = performance.now();

            // Track all operations for detailed reporting
            const operations = {
                serviceWorkers: { found: 0, unregistered: 0, failed: 0 },
                caches: { found: 0, deleted: 0, failed: 0 },
                storage: { cleared: false, error: null as string | null }
            };

            // Step 1: Check network status first to provide accurate feedback
            const isOnline = (navigator as Navigator).onLine;
            console.log(`Network status: ${isOnline ? 'Online' : 'Offline'}`);

            // Get all registered service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            operations.serviceWorkers.found = registrations.length;
            console.log(`Found ${registrations.length} service worker registrations`);

            // Unregister each service worker with enhanced error handling
            for (const registration of registrations) {
                console.log(`Unregistering service worker from: ${registration.scope}`);
                try {
                    // Force update the service worker before unregistering if it's active
                    // This can help with stubborn service workers
                    if (registration.active) {
                        try {
                            await registration.update();
                        } catch (updateError) {
                            console.warn('Could not update service worker before unregistering:', updateError);
                        }
                    }

                    const result = await registration.unregister();
                    if (result) {
                        console.log('Service worker unregistered successfully');
                        operations.serviceWorkers.unregistered++;
                    } else {
                        console.warn('Service worker unregistration failed');
                        operations.serviceWorkers.failed++;

                        // Try a more aggressive approach for failed unregistrations by
                        // targeting the specific scope via navigator.serviceWorker API
                        try {
                            await navigator.serviceWorker.getRegistration(registration.scope)
                                .then(reg => reg?.unregister());
                            console.log('Second attempt to unregister successful');
                            operations.serviceWorkers.unregistered++;
                            operations.serviceWorkers.failed--;
                        } catch (secondError) {
                            console.error('Second unregister attempt failed:', secondError);
                        }
                    }
                } catch (regError) {
                    console.error(`Error unregistering service worker at ${registration.scope}:`, regError);
                    operations.serviceWorkers.failed++;
                }
            }

            // Step 2: Clear caches with enhanced error handling for specific caches
            if ('caches' in window) {
                try {
                    const cacheKeys = await window.caches.keys();
                    operations.caches.found = cacheKeys.length;
                    console.log(`Found ${cacheKeys.length} caches`);

                    // Process caches sequentially for better error handling
                    for (const cacheKey of cacheKeys) {
                        try {
                            console.log(`Deleting cache: ${cacheKey}`);
                            const deleted = await window.caches.delete(cacheKey);
                            if (deleted) {
                                operations.caches.deleted++;
                            } else {
                                operations.caches.failed++;
                                // Try a second approach for stubborn caches
                                try {
                                    const cache = await caches.open(cacheKey);
                                    const requests = await cache.keys();
                                    for (const request of requests) {
                                        await cache.delete(request);
                                    }
                                    const secondTry = await window.caches.delete(cacheKey);
                                    if (secondTry) {
                                        operations.caches.deleted++;
                                        operations.caches.failed--;
                                    }
                                } catch (innerError) {
                                    console.warn(`Could not clear cache ${cacheKey} entries:`, innerError);
                                }
                            }
                        } catch (cacheError) {
                            console.error(`Error deleting cache ${cacheKey}:`, cacheError);
                            operations.caches.failed++;
                        }
                    }
                } catch (cachesError) {
                    console.error('Error accessing caches:', cachesError);
                }
            }

            // Step 3: Clear storage with more comprehensive approach
            try {
                // Clear localStorage items with a more comprehensive list
                const keysToRemove = [
                    'api-url',
                    'sw-needs-cleanup',
                    'cached-data',
                    'api-cache',
                    'sw-version',
                    'app-state',
                    'last-fetch'
                ];
                const localStorageItemsRemoved = [];

                // Remove specific keys
                keysToRemove.forEach(key => {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                        localStorageItemsRemoved.push(key);
                    }
                });

                // Find and remove any cache-related or API-related items
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (
                        key.includes('cache') ||
                        key.includes('api') ||
                        key.includes('fetch') ||
                        key.includes('sw-') ||
                        key.includes('worker')
                    )) {
                        localStorage.removeItem(key);
                        localStorageItemsRemoved.push(key);
                    }
                }

                // Clear sessionStorage
                const sessionStorageCount = sessionStorage.length;
                sessionStorage.clear();

                console.log(`Removed localStorage items: ${localStorageItemsRemoved.join(', ')}`);
                console.log(`Cleared ${sessionStorageCount} sessionStorage items`);

                operations.storage.cleared = true;
            } catch (storageError) {
                console.warn('Error clearing storage:', storageError);
                operations.storage.error = storageError instanceof Error
                    ? storageError.message
                    : 'Unknown storage error';
            }

            // Calculate performance metrics
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);
            console.log(`Service worker cleanup completed in ${duration}ms`);

            // Return comprehensive result
            return {
                success: true,
                workersUnregistered: operations.serviceWorkers.unregistered,
                hadWorkers: operations.serviceWorkers.found > 0,
                operations,
                duration: parseFloat(duration),
                isOnline,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error during service worker cleanup:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                isOnline: (navigator as Navigator).onLine,
                timestamp: new Date().toISOString()
            };
        }
    }
    return {
        success: false,
        notSupported: true,
        isOnline: (navigator as Navigator).onLine,
        timestamp: new Date().toISOString()
    };
};

/**
 * Enhanced function to force a clean reload bypassing browser cache
 * This handles different browsers and network conditions more effectively
 */
export const forceRefresh = (redirectUrl?: string) => {
    console.log('Forcing page refresh...');

    // Add a timestamp to bust cache
    const timestamp = Date.now();

    // Determine target URL (either current URL or a specific redirect URL)
    const targetUrl = redirectUrl
        ? new URL(redirectUrl, window.location.origin)
        : new URL(window.location.href);

    // Clean up the URL to ensure we don't accumulate parameters
    // Remove any existing timestamp or cache parameters
    const paramsToDelete = ['_t', 'cache_bust', 'nocache', 'refresh'];
    paramsToDelete.forEach(param => targetUrl.searchParams.delete(param));

    // Add fresh timestamp parameter
    targetUrl.searchParams.set('_t', timestamp.toString());

    // Try different cache busting techniques for different browsers

    // 1. Attempt to use the Cache API to explicitly delete the page
    if ('caches' in window) {
        caches.keys().then(keys => {
            keys.forEach(key => {
                caches.open(key).then(cache => {
                    cache.delete(window.location.href).then(deleted => {
                        if (deleted) console.log(`Deleted ${window.location.href} from cache ${key}`);
                    });
                });
            });
        }).catch(e => console.warn('Could not clear URL from Cache API:', e));
    }

    // 2. Set cache control headers through fetch API (works in most browsers)
    try {
        const urls = [
            window.location.href,
            window.location.origin + '/',
            targetUrl.toString()
        ];

        // Make unique
        const uniqueUrls = [...new Set(urls)];

        // Perform cache-busting prefetch
        Promise.all(
            uniqueUrls.map(url =>
                fetch(url, {
                    cache: 'reload',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    // Use a signal to abort after 2 seconds so we don't delay the reload
                    signal: AbortSignal.timeout(2000)
                }).catch(e => console.log(`Prefetch for cache busting ${url}:`, e))
            )
        ).finally(() => {
            // Continue with the page reload regardless of fetch results
            console.log(`Redirecting to: ${targetUrl.toString()}`);
        });
    } catch (e) {
        // Fetch might fail but we'll still do the refresh
        console.log('Prefetch for cache busting failed:', e);
    }

    // 3. Try both history API and location directly for comprehensive coverage
    try {
        // Tell the browser not to save in history if available
        if (targetUrl.toString() === window.location.href) {
            // For same URL, use reload() without parameters
            // Note: Previously used boolean parameter is no longer supported in modern browsers
            window.location.reload();
        } else {
            // For different URL, update location
            window.location.href = targetUrl.toString();
        }
    } catch (e) {
        // Fallback to basic approach
        console.warn('Advanced reload failed, using basic redirect:', e);
        window.location.href = targetUrl.toString();
    }
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
        cleanupServiceWorker: (options?: { showToast?: boolean, redirectToHome?: boolean }) => Promise<ToastConfig | null>;
        _serviceWorkerToastState?: ToastConfig;
        _showServiceWorkerToast?: (config: ToastConfig) => void;
        _hideServiceWorkerToast?: () => void;
    }
}

/**
 * Enhanced global function to allow debugging from console or UI usage
 * This provides more detailed feedback and metrics from the cleanup process
 */
window.cleanupServiceWorker = async (options = { showToast: true, redirectToHome: false }) => {
    const result = await unregisterServiceWorkers();
    let toastConfig: ToastConfig | null = null;

    if (result.success) {
        // Construct a more detailed message with operation metrics
        let message = '';
        let details = [];

        if (result.hadWorkers) {
            message = `${result.workersUnregistered} service worker(s) unregistered. Caches cleared.`;

            // Add operational details if available
            if (result.operations) {
                const { serviceWorkers, caches } = result.operations;

                details.push(
                    `Found ${serviceWorkers.found} service worker(s), unregistered ${serviceWorkers.unregistered}${serviceWorkers.failed > 0 ? `, ${serviceWorkers.failed} failed` : ''}`,
                    `Found ${caches.found} cache(s), cleared ${caches.deleted}${caches.failed > 0 ? `, ${caches.failed} failed` : ''}`
                );

                // Add performance metrics
                if (result.duration) {
                    details.push(`Completed in ${result.duration}ms`);
                }

                // Add network status
                details.push(`Network status: ${result.isOnline ? 'Online' : 'Offline'}`);
            }
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
        };

        // Log detailed information for debugging
        console.log('Service worker cleanup results:', result);

        // Auto-refresh after a short delay if toast isn't being shown
        if (!options.showToast) {
            setTimeout(() => {
                forceRefresh(options.redirectToHome ? '/' : undefined);
            }, 500);
        }
    } else if (result.notSupported) {
        toastConfig = {
            show: true,
            message: 'Service workers are not supported in this browser.',
            type: 'warning'
        };

        // Suggest alternative cleanup for browsers without service worker support
        console.log('This browser does not support service workers. Consider clearing your browser cache manually.');
    } else {
        // More detailed error information
        const errorDetails = result.error || 'Unknown error during cleanup';
        const networkStatus = result.isOnline !== undefined
            ? `Network status: ${result.isOnline ? 'Online' : 'Offline'}`
            : 'Network status unknown';

        toastConfig = {
            show: true,
            message: `Error: ${errorDetails}`,
            type: 'error',
            action: {
                label: 'Try Again',
                onClick: () => window.cleanupServiceWorker(options)
            }
        };

        console.error('Service worker cleanup error details:', {
            error: errorDetails,
            networkStatus: result.isOnline ? 'Online' : 'Offline',
            timestamp: result.timestamp
        });
    }

    // If configured to show toast and the toast handler exists, show it
    if (options.showToast && toastConfig && window._showServiceWorkerToast) {
        window._showServiceWorkerToast(toastConfig);
    }

    return toastConfig;
};

/**
 * Enhanced helper function to detect potential service worker issues
 * This checks for various common problems that might indicate service worker conflicts
 * @returns {Promise<{hasIssues: boolean, issues: string[], severity: 'low' | 'medium' | 'high'}>}
 */
export const checkForServiceWorkerIssues = async (): Promise<{
    hasIssues: boolean;
    issues: string[];
    severity: 'low' | 'medium' | 'high';
}> => {
    if (!('serviceWorker' in navigator)) {
        return { hasIssues: false, issues: [], severity: 'low' };
    }

    const issues: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    try {
        // Check for multiple service worker registrations (which can cause conflicts)
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 1) {
            const issue = `Multiple service workers detected (${registrations.length}). This may cause conflicts.`;
            console.warn(issue);
            issues.push(issue);
            severity = 'high';
        }

        // Check if service workers are in waiting or redundant states
        for (const reg of registrations) {
            if (reg.waiting) {
                issues.push('New service worker waiting to be activated (refresh recommended).');
                const severityValue = Math.max(severity === 'low' ? 1 : severity === 'medium' ? 2 : 3, 2);
                severity = severityValue === 2 ? 'medium' : 'high';
            }
            if (reg.installing) {
                issues.push('Service worker is currently being installed.');
                const severityValue = Math.max(severity === 'low' ? 1 : severity === 'medium' ? 2 : 3, 1);
                severity = severityValue === 1 ? 'low' : severityValue === 2 ? 'medium' : 'high';
            }
        }        // Check for failing fetch requests that might indicate a problematic service worker
        const networkIssues = localStorage.getItem('network-errors');
        if (networkIssues && parseInt(networkIssues) > 3) {
            const issue = `Multiple network errors detected (${networkIssues}). This may indicate service worker issues.`;
            console.warn(issue);
            issues.push(issue);
            const severityValue = Math.max(severity === 'low' ? 1 : severity === 'medium' ? 2 : 3, 2);
            severity = severityValue === 3 ? 'high' : 'medium';
        }

        // Check for outdated caches that might cause stale content
        if ('caches' in window) {
            const cacheKeys = await window.caches.keys();            // If we have lots of caches, it could indicate a problem with cache cleanup
            if (cacheKeys.length > 5) {
                issues.push(`Large number of browser caches detected (${cacheKeys.length}). May include stale data.`);
                const severityValue = Math.max(severity === 'low' ? 1 : severity === 'medium' ? 2 : 3, 2);
                severity = severityValue === 3 ? 'high' : 'medium';
            }
        }

        // Check for API errors that might be caused by service worker intercepting requests
        const apiErrors = localStorage.getItem('api-errors');
        if (apiErrors && parseInt(apiErrors) > 2) {
            issues.push('Multiple API errors detected. May be caused by service worker intercepting requests.');
            severity = 'high';
        }        // Check if the browser is offline, which could make service worker behavior different
        if (!navigator.onLine) {
            issues.push('Browser is currently offline. Service workers may be serving cached content.');
            // Being offline isn't necessarily a severe issue, but it's worth noting
            const severityValue = Math.max(severity === 'low' ? 1 : severity === 'medium' ? 2 : 3, 1);
            severity = severityValue === 1 ? 'low' : severityValue === 2 ? 'medium' : 'high';
        }

        return {
            hasIssues: issues.length > 0,
            issues,
            severity
        };
    } catch (error) {
        console.error('Error checking for service worker issues:', error);
        return {
            hasIssues: true,
            issues: ['Error checking service worker status: ' + (error instanceof Error ? error.message : String(error))],
            severity: 'medium'
        };
    }
};
