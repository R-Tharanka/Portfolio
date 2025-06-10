import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, CheckCircle, AlertCircle, Loader2, ArrowLeft, Trash2 } from 'lucide-react';

interface ServiceWorkerModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: {
        message: string;
        type: 'loading' | 'success' | 'error' | 'warning';
        details?: string[];
        progress?: number; // Optional progress indicator (0-100)
    };
    onRefresh?: () => void;
    onHomeRefresh?: () => void;
    showRefreshButtons: boolean;
    onShowManualGuide?: () => void; // New prop to show manual guide
    diagnosticsInProgress?: boolean; // New prop to indicate if diagnostics are running
}

const ServiceWorkerModal: React.FC<ServiceWorkerModalProps> = ({
    isOpen,
    onClose,
    status,
    onRefresh,
    onHomeRefresh,
    showRefreshButtons,
    onShowManualGuide,
    diagnosticsInProgress = false
}) => {
    // Close handler with animation
    const handleClose = () => {
        // Only allow closing if diagnostics aren't running
        if (!diagnosticsInProgress) {
            onClose();
        }
    };// Prevent scrolling when modal is open and maintain position
    useEffect(() => {
        if (isOpen) {
            // Save the current scroll position
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll position when modal closes
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
        return () => {
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Status icon based on the current state
    const getStatusIcon = () => {
        switch (status.type) {
            case 'loading':
                return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
            case 'success':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-6 w-6 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-6 w-6 text-amber-500" />;
            default:
                return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
        }
    };    // Enhanced progress indicator - shows different stages of the cleanup
    const getProgressIndicator = () => {
        // Calculate the progress width based on the progress prop or default to animated state
        const progressWidth = status.progress !== undefined
            ? `${status.progress}%`
            : status.type === 'loading'
                ? ['30%', '60%', '80%']
                : '100%';

        return (
            <div className="flex flex-col space-y-2 w-full mt-2">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Cleanup Progress</span>
                    {status.progress !== undefined && (
                        <span className="text-xs font-medium">{status.progress}%</span>
                    )}
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${status.type === 'success'
                            ? 'bg-green-500'
                            : status.type === 'error'
                                ? 'bg-red-500'
                                : status.type === 'warning'
                                    ? 'bg-amber-500'
                                    : 'bg-primary'
                            }`}
                        initial={{ width: 0 }}
                        animate={{
                            width: progressWidth
                        }}
                        transition={{
                            duration: status.type === 'loading' && status.progress === undefined ? 2 : 0.5,
                            ease: "easeInOut",
                            times: [0, 0.5, 1],
                            repeat: status.type === 'loading' && status.progress === undefined ? Infinity : 0
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - ensure it covers the entire viewport */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] w-screen h-screen"
                        onClick={handleClose}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    />{/* Modal - ensure it's centered in the viewport */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="fixed z-[9999] w-full max-w-md max-h-[90vh] overflow-auto"
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="bg-card rounded-lg shadow-xl border border-border overflow-hidden backdrop-blur-lg">
                            {/* Header with enhanced design */}
                            <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/20 p-1.5 rounded-full">
                                        <Trash2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Service Worker Cleanup</h3>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-1.5 hover:bg-muted rounded-full transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            {/* Enhanced Content */}
                            <div className="p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <motion.div
                                        initial={{ rotate: 0 }}
                                        animate={status.type === 'loading' ? { rotate: 360 } : { rotate: 0 }}
                                        transition={{
                                            duration: 1,
                                            repeat: status.type === 'loading' ? Infinity : 0,
                                            ease: "linear"
                                        }}
                                    >
                                        {getStatusIcon()}
                                    </motion.div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-medium">{status.message}</p>

                                            {/* Network status indicator */}
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <div className={`h-2 w-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                                <span className={navigator.onLine ? 'text-green-500' : 'text-red-500'}>
                                                    {navigator.onLine ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                        {getProgressIndicator()}
                                    </div>
                                </div>

                                {/* Enhanced Details */}
                                {status.details && status.details.length > 0 && (
                                    <div className="bg-card-foreground/5 p-4 rounded-md my-4 border border-border/30">
                                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
                                            </svg>
                                            Cleanup Details:
                                        </h4>
                                        <ul className="space-y-2">
                                            {status.details.map((detail, index) => (
                                                <li key={index}>
                                                    <motion.div
                                                        className="text-sm flex items-start gap-2 p-1.5 rounded-md hover:bg-card-foreground/5 transition-colors"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <div className="mt-0.5 flex-shrink-0">
                                                            {status.type === 'loading' ? (
                                                                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                                                            ) : status.type === 'success' ? (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="h-3 w-3 rounded-full bg-green-500"
                                                                />
                                                            ) : status.type === 'warning' ? (
                                                                <div className="h-3 w-3 rounded-full bg-amber-500" />
                                                            ) : (
                                                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                                            )}
                                                        </div>
                                                        <span className="flex-1 text-foreground/80">{detail}</span>
                                                    </motion.div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* Enhanced Help text */}
                                <div className="mt-5 text-sm text-foreground/70">
                                    <p className="flex items-center gap-2">
                                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
                                        </svg>
                                        This tool helps resolve the following issues:
                                    </p>
                                    <div className="mt-2 pl-5 space-y-1.5 bg-card-foreground/5 p-2 rounded-md border border-border/30">
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                                            <span>CORS errors when refreshing pages</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                                            <span>Outdated cached content displaying incorrectly</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                                            <span>API connection problems</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                                            <span>Service worker conflicts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Enhanced Footer with actions */}
                            {showRefreshButtons && (
                                <div className="p-4 bg-gradient-to-b from-card-foreground/5 to-card-foreground/10 border-t border-border">
                                    <div className="flex flex-col gap-3">
                                        {onRefresh && (
                                            <motion.button
                                                onClick={onRefresh}
                                                className="flex items-center justify-center gap-2 bg-primary text-white p-3 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={diagnosticsInProgress}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                <span>Reload Current Page</span>
                                            </motion.button>
                                        )}
                                        {onHomeRefresh && (
                                            <motion.button
                                                onClick={onHomeRefresh}
                                                className="flex items-center justify-center gap-2 bg-background border border-border p-3 rounded-md hover:bg-muted transition-colors"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={diagnosticsInProgress}
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                <span>Return to Home Page</span>
                                            </motion.button>
                                        )}

                                        {/* Manual resolution guide button */}
                                        {onShowManualGuide && (
                                            <motion.button
                                                onClick={onShowManualGuide}
                                                className="flex items-center justify-center gap-2 bg-background/50 border border-border p-3 rounded-md hover:bg-muted transition-colors mt-2"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={diagnosticsInProgress}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
                                                </svg>
                                                <span>Show Manual Resolution Guide</span>
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ServiceWorkerModal;
