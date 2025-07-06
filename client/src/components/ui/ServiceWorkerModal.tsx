import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, CheckCircle, AlertCircle, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import DocumentPortal from './DocumentPortal';

interface ServiceWorkerModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: {
        message: string;
        type: 'loading' | 'success' | 'error' | 'warning';
        details?: string[];
    };
    onRefresh?: () => void;
    onHomeRefresh?: () => void;
    showRefreshButtons: boolean;
    onConfirm?: () => void; // New prop for confirmation
}

const ServiceWorkerModal: React.FC<ServiceWorkerModalProps> = ({
    isOpen,
    onClose,
    status,
    onRefresh,
    onHomeRefresh,
    showRefreshButtons,
    onConfirm
}) => {
    // Close handler with animation - using useCallback for better performance
    const handleClose = useCallback(() => {
        // Just use a simple timeout instead of animation state
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
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
    };

    // Progress indicator - shows different stages of the cleanup
    const getProgressIndicator = () => {
        return (
            <div className="flex flex-col space-y-2 w-full mt-2">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Cleanup Progress</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${status.type === 'success'
                            ? 'bg-green-500'
                            : status.type === 'error'
                                ? 'bg-red-500'
                                : 'bg-primary'
                            }`}
                        initial={{ width: 0 }}
                        animate={{
                            width: status.type === 'loading' ? ['30%', '60%', '80%'] : '100%'
                        }}
                        transition={{
                            duration: status.type === 'loading' ? 2 : 0.5,
                            ease: "easeInOut",
                            times: [0, 0.5, 1],
                            repeat: status.type === 'loading' ? Infinity : 0
                        }}
                    />
                </div>
            </div>
        );
    }; return (
        <DocumentPortal rootId="service-worker-modal-portal">
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-9000"
                            onClick={handleClose}
                        />

                        {/* Modal Container - Fixed position with proper centering */}
                        <div className="fixed inset-0 overflow-y-auto z-9500"> 
													{/* Higher than backdrop but lower than toasts */}
                            <div className="flex items-center justify-center min-h-full p-4">
                                {/* Modal Content with animations */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    transition={{ type: "spring", bounce: 0.3 }}
                                    className="relative w-full max-w-md bg-card rounded-lg shadow-xl border border-border overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="p-4 border-b border-border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Trash2 className="h-5 w-5 text-primary" />
                                            <h3 className="text-lg font-semibold">Service Worker Cleanup</h3>
                                        </div>
                                        <button
                                            onClick={handleClose}
                                            className="p-1 hover:bg-muted rounded-full"
                                            aria-label="Close modal"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            {getStatusIcon()}
                                            <div className="flex-1">
                                                <p className="font-medium">{status.message}</p>
                                                {getProgressIndicator()}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        {status.details && status.details.length > 0 && (
                                            <div className="bg-card-foreground/5 p-3 rounded-md my-5">
                                                <h4 className="text-sm font-medium mb-2">Cleanup Details:</h4>
                                                <ul className="space-y-1.5">
                                                    {status.details.map((detail, index) => (
                                                        <li key={index} className="text-sm flex items-center gap-2">
                                                            <div className="mt-0.5">
                                                                {status.type === 'loading' ? (
                                                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                                ) : status.type === 'success' ? (
                                                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                                                ) : (
                                                                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                                )}
                                                            </div>
                                                            <span className="flex-1 text-foreground/80">{detail}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Instructions text for warning state */}
                                        {status.type === 'warning' && onConfirm && (
                                            <div className="mt-6 text-sm text-foreground/70 text-center">
                                                <p>Click "Proceed with Cleanup" to continue or "Cancel" to exit</p>
                                            </div>
                                        )}
                                        
                                        {/* Instructions text for success state */}
                                        {status.type === 'success' && (
                                            <div className="mt-6 text-sm text-foreground/70 text-center">
                                                <p>Please use one of the buttons below to refresh the page</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer with actions */}
                                    {showRefreshButtons && (
                                        <div className="p-4 bg-card-foreground/5 border-t border-border">
                                            <div className="flex flex-col gap-3">
                                                {/* Confirmation state buttons */}
                                                {status.type === 'warning' && onConfirm && (
                                                    <>
                                                        {/* Proceed button */}
                                                        <button
                                                            onClick={onConfirm}
                                                            className="flex items-center justify-center gap-2 bg-primary text-white p-2.5 rounded-md hover:bg-primary/90 transition-colors"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                            <span>Proceed with Cleanup</span>
                                                        </button>

                                                        {/* Cancel button */}
                                                        <button
                                                            onClick={onClose}
                                                            className="flex items-center justify-center gap-2 bg-background border border-border p-2.5 rounded-md hover:bg-muted transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            <span>Cancel</span>
                                                        </button>
                                                    </>
                                                )}

                                                {/* Post-cleanup state buttons */}
                                                {status.type !== 'warning' && (
                                                    <>
                                                        {/* Reload current page button */}
                                                        {onRefresh && (
                                                            <button
                                                                onClick={onRefresh}
                                                                className="flex items-center justify-center gap-2 bg-primary text-white p-2.5 rounded-md hover:bg-primary/90 transition-colors"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                                <span>Reload Current Page</span>
                                                            </button>
                                                        )}

                                                        {/* Return to home page button */}
                                                        {onHomeRefresh && (
                                                            <button
                                                                onClick={onHomeRefresh}
                                                                className="flex items-center justify-center gap-2 bg-background border border-border p-2.5 rounded-md hover:bg-muted transition-colors"
                                                            >
                                                                <ArrowLeft className="h-4 w-4" />
                                                                <span>Return to Home Page</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </DocumentPortal>
    );
};

export default ServiceWorkerModal;
