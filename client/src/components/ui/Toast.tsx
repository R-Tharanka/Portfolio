import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import DocumentPortal from './DocumentPortal';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    duration = 5000,
    onClose,
    action
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!action) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Allow exit animation to complete
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose, action]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-amber-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
        }
    }; const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50/95 dark:bg-green-900/95 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-amber-50/95 dark:bg-amber-900/95 border-amber-200 dark:border-amber-800';
            default:
                return 'bg-blue-50/95 dark:bg-blue-900/95 border-blue-200 dark:border-blue-800';
        }
    }; return (
        <DocumentPortal rootId="toast-portal">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }} className={`fixed top-4 right-4 p-4 rounded-lg shadow-xl border z-10000 backdrop-blur-lg ${getBackgroundColor()} max-w-md`}
                        style={{
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                        role="alert"
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                {getIcon()}
                            </div>
                            <div className="ml-3 flex-grow">
                                <p className="text-sm font-bold text-foreground/90 drop-shadow-sm">{message}</p>
                                {action && (
                                    <div className="mt-2">
                                        <button
                                            onClick={action.onClick}
                                            className="text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            {action.label}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleClose}
                                aria-label="Close notification"
                                className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DocumentPortal>
    );
};

export default Toast;
