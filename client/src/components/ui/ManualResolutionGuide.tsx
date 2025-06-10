import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    AlertOctagon,
    ChevronDown,
    ChevronRight,
    Laptop,
    RefreshCw,
    Smartphone,
    Trash2,
    X
} from 'lucide-react';

interface ManualResolutionGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

const ManualResolutionGuide: React.FC<ManualResolutionGuideProps> = ({
    isOpen,
    onClose
}) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    if (!isOpen) return null;

    const guideContent = [
        {
            id: 'chrome',
            title: 'Chrome / Edge',
            icon: <Laptop className="h-5 w-5" />,
            steps: [
                'Open Chrome and navigate to chrome://settings/siteData',
                'Search for your site domain in the search bar',
                'Click on the site and select "Clear data"',
                'Make sure both "Cookies and site data" and "Cached images and files" are selected',
                'Click "Clear" to confirm',
                'Alternatively, you can press Ctrl+Shift+Delete and select "All time" for time range'
            ]
        },
        {
            id: 'firefox',
            title: 'Firefox',
            icon: <Laptop className="h-5 w-5" />,
            steps: [
                'Open Firefox and navigate to about:preferences#privacy',
                'Scroll down to the "Cookies and Site Data" section',
                'Click "Clear Data..."',
                'Ensure both "Cookies and Site Data" and "Cached Web Content" are checked',
                'Click "Clear" to confirm',
                'Alternatively, press Ctrl+Shift+Delete to open the clear history dialog'
            ]
        },
        {
            id: 'safari',
            title: 'Safari',
            icon: <Laptop className="h-5 w-5" />,
            steps: [
                'Open Safari and click on "Safari" in the menu bar',
                'Select "Settings" and go to the "Privacy" tab',
                'Click "Manage Website Data..."',
                'Search for your site domain and select it',
                'Click "Remove" to clear the site data',
                'To clear all cache, go to Safari menu > "Clear History..." and select a time range'
            ]
        },
        {
            id: 'mobile',
            title: 'Mobile Browsers',
            icon: <Smartphone className="h-5 w-5" />,
            steps: [
                'For Chrome on Android: Go to Settings > Privacy > Clear browsing data',
                'For Safari on iOS: Go to Settings > Safari > Clear History and Website Data',
                'For Firefox on mobile: Tap the menu button > Settings > Delete browsing data',
                'Make sure to select both "Cached images and files" and "Cookies and site data"',
                'Select "All time" for the time range',
                'Tap "Clear data" to confirm'
            ]
        },
        {
            id: 'advanced',
            title: 'Advanced Resolution',
            icon: <AlertOctagon className="h-5 w-5" />,
            steps: [
                'Try opening the site in incognito/private browsing mode',
                'If that works, your issue is likely related to cached data or extensions',
                'Try temporarily disabling browser extensions/add-ons',
                'Check your browser\'s developer tools for console errors (Press F12)',
                'Use the Application tab in Developer Tools to inspect and clear Service Workers',
                'If problems persist, try an alternative browser to rule out browser-specific issues'
            ]
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card rounded-lg shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-auto"
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-1.5 rounded-full">
                            <Trash2 className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold">Manual Service Worker Resolution Guide</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-muted rounded-full transition-colors"
                        aria-label="Close guide"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="mb-5 bg-card-foreground/5 p-4 rounded-md border border-border">
                        <p className="text-sm">
                            If the automatic cleanup doesn't resolve your issue, follow these browser-specific steps to manually clear
                            service workers and cached data. Select your browser below for detailed instructions.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {guideContent.map((section) => (
                            <div key={section.id} className="border border-border rounded-md overflow-hidden">
                                <button
                                    className={`w-full flex items-center justify-between p-3 ${expandedSection === section.id ? 'bg-primary/10' : 'hover:bg-muted'
                                        } transition-colors`}
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        {section.icon}
                                        <span className="font-medium">{section.title}</span>
                                    </div>
                                    {expandedSection === section.id ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {expandedSection === section.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-4 pb-4 pt-2"
                                    >
                                        <ol className="list-decimal pl-5 space-y-2 text-sm">
                                            {section.steps.map((step, index) => (
                                                <li key={index} className="text-foreground/80">{step}</li>
                                            ))}
                                        </ol>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gradient-to-b from-card-foreground/5 to-card-foreground/10 border-t border-border">
                    <div className="flex flex-col gap-3">
                        <motion.button
                            onClick={() => window.cleanupServiceWorker && window.cleanupServiceWorker()}
                            className="flex items-center justify-center gap-2 bg-primary text-white p-3 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Try Automatic Cleanup Again</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ManualResolutionGuide;
