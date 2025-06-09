// ContactNotifications.tsx - A reusable component for handling notifications for the Contact Admin
import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'react-toastify';

// Import centralized notification service
import notificationService from './NotificationService';

interface ContactNotificationsProps {
    unreadCount: number;
    onMarkAllRead: () => void;
    isLoading: boolean;
}

/**
 * A component that handles notifications for unread contact messages
 * Features:
 * - Toggle notifications on/off
 * - Play sound when new messages arrive
 * - Show toast notifications
 * - Visual notification banner
 */
const ContactNotifications: React.FC<ContactNotificationsProps> = ({
    unreadCount,
    onMarkAllRead,
    isLoading
}) => {    const [notificationsEnabled, setNotificationsEnabled] = useState(
        () => notificationService.isNotificationsEnabled() // Initialize from NotificationService
    );
      // Use notification service to handle notifications
    useEffect(() => {
        console.log('ContactNotifications detected unread count change:', unreadCount);
        
        // Use the centralized notification service to handle notifications
        // This component shouldn't need to play sounds directly as it uses the service
        notificationService.notifyNewMessages(unreadCount);
    }, [unreadCount]);
    
    // Toggle notifications on/off
    const toggleNotifications = () => {
        const newState = notificationService.toggleNotifications();
        setNotificationsEnabled(newState);
        toast.info(
            newState ? 'Notifications enabled' : 'Notifications disabled',
            { icon: newState ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5" /> }
        );
    };

    return (
        <>
            {/* Notification toggle button */}
            <button
                onClick={toggleNotifications}
                className="p-1 rounded-full hover:bg-background transition-colors"
                title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
                {notificationsEnabled ?
                    <Bell className="h-4 w-4 text-primary" /> :
                    <BellOff className="h-4 w-4 text-foreground/50" />
                }
            </button>            {/* Notification banner for unread messages */}
            {unreadCount > 0 && notificationsEnabled && (
                <div className="p-3 mb-4 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <span>You have {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}</span>
                    </div>
                    <button
                        onClick={onMarkAllRead}
                        className="px-3 py-1 rounded bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
                        disabled={isLoading}
                    >
                        Mark All as Read
                    </button>
                </div>
            )}
            {/* No need for local audio element since we use the centralized notification service */}
        </>
    );
};

export default ContactNotifications;
