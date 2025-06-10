/**
 * Advanced Service Worker Diagnostics Utility
 * Provides comprehensive testing and diagnosis of service worker issues
 */

import { unregisterServiceWorkers } from './serviceWorkerCleanup';

interface DiagnosticResult {
    category: string;
    status: 'pass' | 'warning' | 'fail' | 'info';
    message: string;
    details?: string;
    timestamp: string;
}

interface DiagnosticsReport {
    timestamp: string;
    browserInfo: {
        userAgent: string;
        vendor: string;
        platform: string;
        isOnline: boolean;
    };
    results: DiagnosticResult[];
    overallStatus: 'healthy' | 'warning' | 'critical';
    recommendations: string[];
    hasSevereIssues: boolean;
}

/**
 * Runs comprehensive service worker diagnostics
 * @returns Detailed diagnostics report
 */
export const runServiceWorkerDiagnostics = async (): Promise<DiagnosticsReport> => {
    const startTime = performance.now();
    const results: DiagnosticResult[] = [];
    const recommendations: string[] = [];
    let hasSevereIssues = false;

    // 1. Browser environment check
    try {
        results.push({
            category: 'Environment',
            status: 'serviceWorker' in navigator ? 'pass' : 'fail',
            message: 'serviceWorker' in navigator ? 'Service Workers supported' : 'Service Workers not supported',
            timestamp: new Date().toISOString()
        });

        if (!('serviceWorker' in navigator)) {
            recommendations.push('Your browser does not support Service Workers. Consider updating to a modern browser.');
            hasSevereIssues = true;
        }
    } catch (error) {
        results.push({
            category: 'Environment',
            status: 'fail',
            message: 'Error checking Service Worker support',
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
    }

    // 2. Check for existing service workers
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            const count = registrations.length;

            results.push({
                category: 'Registration',
                status: count === 0 ? 'pass' : count === 1 ? 'info' : 'warning',
                message: `Found ${count} registered service worker(s)`,
                details: count > 0 ? registrations.map(r => r.scope).join(', ') : undefined,
                timestamp: new Date().toISOString()
            });

            if (count > 1) {
                recommendations.push('Multiple service workers detected. This may cause conflicts or unexpected behavior.');
            }

            // Check states of service workers
            for (const reg of registrations) {
                if (reg.installing) {
                    results.push({
                        category: 'State',
                        status: 'info',
                        message: 'Service worker is installing',
                        details: `Scope: ${reg.scope}`,
                        timestamp: new Date().toISOString()
                    });
                }

                if (reg.waiting) {
                    results.push({
                        category: 'State',
                        status: 'warning',
                        message: 'Service worker is waiting to activate',
                        details: `Scope: ${reg.scope}. This may indicate a stuck update.`,
                        timestamp: new Date().toISOString()
                    });
                    recommendations.push('A service worker is waiting to be activated. Try refreshing or closing all tabs of this site.');
                }

                if (reg.active) {
                    // Check how long this service worker has been active
                    const swState = 'state' in reg.active ? reg.active.state : 'unknown';
                    results.push({
                        category: 'State',
                        status: 'info',
                        message: `Service worker is active (state: ${swState})`,
                        details: `Scope: ${reg.scope}`,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }
    } catch (error) {
        results.push({
            category: 'Registration',
            status: 'fail',
            message: 'Error checking service worker registrations',
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
        hasSevereIssues = true;
        recommendations.push('Could not check service worker registrations. This might indicate a browser issue.');
    }

    // 3. Check for cache storage issues
    try {
        if ('caches' in window) {
            const cacheKeys = await window.caches.keys();
            results.push({
                category: 'Cache',
                status: cacheKeys.length > 5 ? 'warning' : 'info',
                message: `Found ${cacheKeys.length} cache entries`,
                details: cacheKeys.join(', '),
                timestamp: new Date().toISOString()
            });

            if (cacheKeys.length > 5) {
                recommendations.push('Large number of caches detected. Consider clearing browser caches.');
            }

            // Check cache sizes if possible
            let totalCacheItems = 0;
            for (const key of cacheKeys) {
                try {
                    const cache = await caches.open(key);
                    const items = await cache.keys();
                    totalCacheItems += items.length;
                } catch (e) {
                    console.warn(`Could not open cache ${key}:`, e);
                }
            }

            results.push({
                category: 'Cache',
                status: totalCacheItems > 100 ? 'warning' : 'info',
                message: `Total cached items: ${totalCacheItems}`,
                timestamp: new Date().toISOString()
            });

            if (totalCacheItems > 200) {
                recommendations.push('Excessive number of cached items detected. This may cause browser performance issues.');
                hasSevereIssues = true;
            } else if (totalCacheItems > 100) {
                recommendations.push('High number of cached items detected. Consider clearing browser caches.');
            }
        } else {
            results.push({
                category: 'Cache',
                status: 'info',
                message: 'Cache API not supported in this browser',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        results.push({
            category: 'Cache',
            status: 'fail',
            message: 'Error checking cache storage',
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
    }

    // 4. Check for storage quota issues
    try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const usedMB = Math.round(estimate.usage! / (1024 * 1024));
            const quotaMB = Math.round(estimate.quota! / (1024 * 1024));
            const usagePercent = Math.round((estimate.usage! / estimate.quota!) * 100);

            results.push({
                category: 'Storage',
                status: usagePercent > 80 ? 'warning' : 'info',
                message: `Storage usage: ${usedMB}MB of ${quotaMB}MB (${usagePercent}%)`,
                timestamp: new Date().toISOString()
            });

            if (usagePercent > 85) {
                recommendations.push('Storage quota is nearly full. This may cause caching and storage issues.');
                hasSevereIssues = true;
            } else if (usagePercent > 70) {
                recommendations.push('Storage usage is high. Consider clearing site data if issues occur.');
            }
        }
    } catch (error) {
        results.push({
            category: 'Storage',
            status: 'info',
            message: 'Storage estimation not supported or failed',
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
    }

    // 5. Check for network issues
    results.push({
        category: 'Network',
        status: navigator.onLine ? 'pass' : 'warning',
        message: navigator.onLine ? 'Browser is online' : 'Browser is offline',
        timestamp: new Date().toISOString()
    });

    if (!navigator.onLine) {
        recommendations.push('You are currently offline. Service workers may be serving cached content.');
    }

    // 6. Check for API connectivity
    try {
        const apiCheck = await fetch('/api/service-worker-diagnostics', {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            }
        });

        if (apiCheck.ok) {
            const apiData = await apiCheck.json();

            results.push({
                category: 'API',
                status: 'pass',
                message: 'API connection successful',
                details: `Server time: ${apiData.serverTime}`,
                timestamp: new Date().toISOString()
            });

            // Check for time drift between client and server
            const serverTime = new Date(apiData.serverTime).getTime();
            const clientTime = new Date().getTime();
            const timeDrift = Math.abs(serverTime - clientTime);

            if (timeDrift > 60000) { // More than 1 minute
                results.push({
                    category: 'Time',
                    status: 'warning',
                    message: `Significant time drift: ${Math.round(timeDrift / 1000)}s`,
                    timestamp: new Date().toISOString()
                });
                recommendations.push('Your device time differs significantly from the server time. This can cause authentication and caching issues.');
            }
        } else {
            results.push({
                category: 'API',
                status: 'fail',
                message: `API connection failed: ${apiCheck.status} ${apiCheck.statusText}`,
                timestamp: new Date().toISOString()
            });
            recommendations.push('Cannot connect to API. This may indicate network issues or server problems.');
            hasSevereIssues = true;
        }
    } catch (error) {
        results.push({
            category: 'API',
            status: 'fail',
            message: 'API connection error',
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
        recommendations.push('Error connecting to API. This may indicate network issues or CORS problems.');
        hasSevereIssues = true;
    }

    // 7. Check Local Storage for indicators of past issues
    try {
        const apiErrors = localStorage.getItem('api-errors');
        const networkErrors = localStorage.getItem('network-errors');
        const swIssues = localStorage.getItem('sw-issues');

        if (apiErrors && parseInt(apiErrors) > 0) {
            results.push({
                category: 'History',
                status: parseInt(apiErrors) > 3 ? 'warning' : 'info',
                message: `Previous API errors detected: ${apiErrors}`,
                timestamp: new Date().toISOString()
            });
        }

        if (networkErrors && parseInt(networkErrors) > 0) {
            results.push({
                category: 'History',
                status: parseInt(networkErrors) > 3 ? 'warning' : 'info',
                message: `Previous network errors detected: ${networkErrors}`,
                timestamp: new Date().toISOString()
            });
        }

        if (swIssues && parseInt(swIssues) > 0) {
            results.push({
                category: 'History',
                status: 'warning',
                message: `Previous service worker issues detected: ${swIssues}`,
                timestamp: new Date().toISOString()
            });
            recommendations.push('Previous service worker issues detected. Consider clearing site data.');
        }
    } catch (error) {
        // Ignore storage access errors as they're not critical
        console.warn('Error accessing localStorage:', error);
    }

    // Calculate execution time
    const executionTime = performance.now() - startTime;
    results.push({
        category: 'Performance',
        status: 'info',
        message: `Diagnostics completed in ${executionTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
    });

    // Determine overall status
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

    const failCount = results.filter(r => r.status === 'fail').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    if (failCount > 0 || hasSevereIssues) {
        overallStatus = 'critical';
        recommendations.unshift('Serious issues detected. Consider running the cleanup tool to resolve problems.');
    } else if (warningCount > 0) {
        overallStatus = 'warning';
        recommendations.unshift('Some potential issues detected. Monitor for unusual behavior.');
    } else {
        recommendations.unshift('No significant issues detected. Service worker environment appears healthy.');
    }

    return {
        timestamp: new Date().toISOString(),
        browserInfo: {
            userAgent: navigator.userAgent,
            vendor: navigator.vendor,
            platform: navigator.platform,
            isOnline: navigator.onLine
        },
        results,
        overallStatus,
        recommendations,
        hasSevereIssues
    };
};

/**
 * Attempts to recover from severe service worker issues
 * This function implements additional recovery mechanisms beyond basic cleanup
 */
export const recoverFromSevereIssues = async (): Promise<{
    success: boolean;
    actions: string[];
    recoveryType: 'full' | 'partial' | 'failed';
}> => {
    const actions: string[] = [];

    try {
        // 1. First try standard cleanup
        actions.push('Attempting standard service worker cleanup');
        const standardCleanup = await unregisterServiceWorkers();

        if (!standardCleanup.success) {
            // 2. If standard cleanup fails, try more aggressive approach
            actions.push('Standard cleanup failed, attempting aggressive cleanup');

            // 2.1. Try to clear all caches using a different approach
            if ('caches' in window) {
                try {
                    const cacheKeys = await window.caches.keys();
                    for (const key of cacheKeys) {
                        await window.caches.delete(key);
                    }
                    actions.push(`Forcefully cleared ${cacheKeys.length} caches`);
                } catch (error) {
                    actions.push(`Cache clearing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            // 2.2. Try to message service workers to force them to skip waiting
            if ('serviceWorker' in navigator) {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                        if (registration.waiting) {
                            // Send skip waiting message
                            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                            actions.push(`Sent SKIP_WAITING to service worker at ${registration.scope}`);
                        }
                    }
                } catch (error) {
                    actions.push(`Error messaging service workers: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            // 2.3. Clear all site storage completely
            actions.push('Attempting to clear all site data');

            // 2.3.1 Local storage
            try {
                localStorage.clear();
                actions.push('Cleared localStorage');
            } catch (error) {
                actions.push(`localStorage clear error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            // 2.3.2 Session storage
            try {
                sessionStorage.clear();
                actions.push('Cleared sessionStorage');
            } catch (error) {
                actions.push(`sessionStorage clear error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            // 2.3.3 IndexedDB - attempt to list and delete all databases
            if ('indexedDB' in window) {
                try {
                    const databases = await window.indexedDB.databases();
                    for (const db of databases) {
                        if (db.name) {
                            window.indexedDB.deleteDatabase(db.name);
                            actions.push(`Requested deletion of IndexedDB database: ${db.name}`);
                        }
                    }
                } catch (error) {
                    actions.push(`IndexedDB clear error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            // 2.4. Use the Cache API's headers for a hard reset
            try {
                const clearReq = await fetch('/api/service-worker-diagnostics', {
                    headers: {
                        'Clear-Site-Data': '"cache", "cookies", "storage"',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                    }
                });

                if (clearReq.ok) {
                    actions.push('Requested server-side site data clearing');
                }
            } catch (error) {
                actions.push(`Clear site data request error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            // 2.5. One last attempt to unregister service workers
            try {
                const finalRegistrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of finalRegistrations) {
                    const result = await registration.unregister();
                    actions.push(`Final unregister attempt for ${registration.scope}: ${result ? 'Success' : 'Failed'}`);
                }
            } catch (error) {
                actions.push(`Final unregister error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } else {
            actions.push('Standard cleanup succeeded');
        }

        // Check if service workers are actually gone
        if ('serviceWorker' in navigator) {
            const remainingRegistrations = await navigator.serviceWorker.getRegistrations();
            if (remainingRegistrations.length === 0) {
                actions.push('All service workers successfully removed');
                return {
                    success: true,
                    actions,
                    recoveryType: 'full'
                };
            } else {
                actions.push(`${remainingRegistrations.length} service workers still present after cleanup`);
                return {
                    success: false,
                    actions,
                    recoveryType: 'partial'
                };
            }
        }

        return {
            success: true,
            actions,
            recoveryType: 'full'
        };
    } catch (error) {
        actions.push(`Recovery error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return {
            success: false,
            actions,
            recoveryType: 'failed'
        };
    }
};
