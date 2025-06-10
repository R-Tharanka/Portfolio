import React, { useState, useEffect } from 'react';
import { unregisterServiceWorkers, forceRefresh, checkForServiceWorkerIssues } from '../../utils/serviceWorkerCleanup';
import { RefreshCw, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface CleanupResult {
    success: boolean;
    workersUnregistered?: number;
    hadWorkers?: boolean;
    notSupported?: boolean;
    error?: string;
}

const ServiceWorkerCleanup: React.FC = () => {
    const [status, setStatus] = useState<string>('Checking for service workers...');
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
    const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Run cleanup on component mount
    useEffect(() => {
        const runCleanup = async () => {
            setStatus('Checking for service worker issues...');

            // First check if there are any service worker issues
            await checkForServiceWorkerIssues(); // We still check but don't need to track the result

            setStatus('Unregistering service workers...');
            try {
                const result = await unregisterServiceWorkers();
                setCleanupResult(result);

                if (result.success) {
                    if (result.hadWorkers) {
                        setStatus(`Success! ${result.workersUnregistered} service worker(s) unregistered and caches cleared.`);
                    } else {
                        setStatus('No active service workers found. All caches have been cleared.');
                    }
                    setNeedsRefresh(true);
                } else if (result.notSupported) {
                    setStatus('Service workers are not supported in your browser.');
                } else {
                    setStatus(`Error: ${result.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error in cleanup:', error);
                setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setIsLoading(false);
                setIsComplete(true);
            }
        };

        runCleanup();
    }, []);
    const handleRefresh = () => {
        // Force a clean reload of the current page
        forceRefresh();
    };

    const handleHomeRefresh = () => {
        // Force a clean reload that goes to the home page
        forceRefresh('/');
    };

    const getStatusIcon = () => {
        if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
        if (!cleanupResult) return <AlertCircle className="h-6 w-6 text-amber-500" />;
        if (cleanupResult.success) return <CheckCircle className="h-6 w-6 text-green-500" />;
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
            <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Service Worker Cleanup</h1>
                    {getStatusIcon()}
                </div>

                <div className="mb-6 rounded-md bg-card-foreground/5 p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : cleanupResult?.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        <p className="font-medium">{status}</p>
                    </div>

                    {isComplete && (
                        <div className="mt-4 text-sm">
                            <p className="font-medium mb-1">This tool helps resolve issues caused by cached service workers:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-foreground/80">
                                <li>API connection problems (CORS errors)</li>
                                <li>Out-of-date content being displayed</li>
                                <li>Pages failing to load correctly</li>
                                <li>Cached API URLs that are no longer valid</li>
                            </ul>
                        </div>
                    )}
                </div>
                {needsRefresh && (
                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={handleRefresh}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-white transition-colors hover:bg-primary/90"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Reload Current Page with Fresh Data</span>
                        </button>
                        <button
                            onClick={handleHomeRefresh}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-background border border-border px-4 py-3 text-foreground transition-colors hover:bg-card/80"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Return to Home Page</span>
                        </button>

                        <p className="mt-2 text-xs text-center text-foreground/70">
                            After clicking "Reload" you'll be directed to the page you came from with fresh data.
                        </p>
                    </div>
                )}

                {isComplete && !needsRefresh && (
                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-white transition-colors hover:bg-primary/90"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Return to Previous Page</span>
                        </button>
                        <button
                            onClick={handleHomeRefresh}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-background border border-border px-4 py-3 text-foreground transition-colors hover:bg-card/80"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Return to Home Page</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceWorkerCleanup;
