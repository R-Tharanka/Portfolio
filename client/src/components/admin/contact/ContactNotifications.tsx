// ContactNotifications.tsx - A reusable component for handling notifications for the Contact Admin
import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'react-toastify';

// Import notification sound
import notificationSound from './messageNotification.mp3';

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
}) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Play notification sound when new unread messages arrive
    useEffect(() => {
        // Only play notification if:
        // 1. There are more unread messages than before
        // 2. Notifications are enabled
        // 3. We have an audio reference
        if (unreadCount > previousUnreadCount && notificationsEnabled && audioRef.current) {
            // Play notification sound
            audioRef.current.play().catch(err =>
                console.error('Error playing notification sound:', err)
            );

            // Show a toast notification for new messages
            if (unreadCount - previousUnreadCount === 1) {
                toast.info('You have a new unread message', {
                    icon: <Bell className="h-5 w-5 text-primary" />
                });
            } else if (unreadCount - previousUnreadCount > 1) {
                toast.info(`You have ${unreadCount - previousUnreadCount} new unread messages`, {
                    icon: <Bell className="h-5 w-5 text-primary" />
                });
            }
        }

        // Update the previous count for next comparison
        setPreviousUnreadCount(unreadCount);
    }, [unreadCount, previousUnreadCount, notificationsEnabled]);

    // Toggle notifications on/off
    const toggleNotifications = () => {
        setNotificationsEnabled(prev => !prev);
        toast.info(
            notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled',
            { icon: notificationsEnabled ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5 text-primary" /> }
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
            </button>

            {/* Notification banner for unread messages */}
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

            {/* Hidden audio element for playing notification sound */}
            <audio ref={audioRef} src={notificationSound} preload="auto" />
        </>
    );
};

export default ContactNotifications;
