import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

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
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${getBackgroundColor()} max-w-md`}
                    role="alert"
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                            {getIcon()}
                        </div>
                        <div className="ml-3 flex-grow">
                            <p className="text-sm font-medium text-foreground">{message}</p>
                            {action && (
                                <div className="mt-2">
                                    <button
                                        onClick={action.onClick}
                                        className="text-sm font-medium text-primary hover:text-primary/80 focus:outline-none focus:underline"
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
    );
};

export default Toast;
