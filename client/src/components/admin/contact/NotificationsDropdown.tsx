import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellOff, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import notificationSound from './messageNotification.mp3';

// Interface for contact messages
export interface NotificationMessage {
  _id: string;
  name: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationsDropdownProps {
  unreadMessages: NotificationMessage[];
  unreadCount: number;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  unreadMessages,
  unreadCount,
  markAsRead,
  markAllAsRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Play notification sound when new unread messages arrive
  useEffect(() => {
    // Only play notification if:
    // 1. There are more unread messages than before
    // 2. Notifications are enabled
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

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationsEnabled(prev => !prev);
    toast.info(
      notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled',
      { icon: notificationsEnabled ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5 text-primary" /> }
    );
  };
  const handleMessageClick = async (messageId: string) => {
    await markAsRead(messageId);
    // Navigate to the contact tab in the admin panel
    navigate('/admin');
    // Using a small timeout to ensure navigation happens first
    setTimeout(() => {
      // Try to click the contact tab programmatically
      const contactTab = document.querySelector('[data-value="contact"]') as HTMLElement;
      if (contactTab) {
        contactTab.click();
      }
    }, 100);
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 0
        ? 'Just now'
        : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon with notification badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-background/30 transition-colors relative"
        aria-label={`${unreadCount} unread messages`}
        title={`${unreadCount} unread messages`}
      >        {notificationsEnabled ? (
        <Bell className="h-5 w-5 text-white" />
      ) : (
        <BellOff className="h-5 w-5 text-white/70" />
      )}

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs bg-red-500 text-white rounded-full transform translate-x-1/3 -translate-y-1/3">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-card rounded-lg shadow-lg border border-border/30 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-border/30">
            <h3 className="font-medium flex items-center">
              <Bell className="h-4 w-4 mr-2 text-primary" />
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleNotifications}
                className="p-1 rounded-full hover:bg-background/30 transition-colors"
                title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
              >
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-foreground/50" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-background/30 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div>
            {unreadMessages.length === 0 ? (
              <div className="py-8 text-center text-foreground/60">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No unread messages</p>
              </div>
            ) : (
              <>
                {unreadMessages.slice(0, 5).map(message => (
                  <div
                    key={message._id}
                    className="p-3 border-b border-border/30 hover:bg-background/30 transition-colors cursor-pointer"
                    onClick={() => handleMessageClick(message._id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                        {message.name}
                      </span>
                      <span className="text-xs text-foreground/60">{formatDate(message.createdAt)}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 mb-1 line-clamp-1">{message.title}</p>
                    <p className="text-xs text-foreground/60 line-clamp-2">{message.message}</p>
                  </div>
                ))}

                {unreadMessages.length > 5 && (
                  <div className="px-3 py-2 text-center text-xs text-foreground/60">
                    {unreadMessages.length - 5} more notifications
                  </div>
                )}
                {/* Footer Actions */}
                <div className="p-3 border-t border-border/30 flex justify-between items-center bg-primary/5">
                  <button
                    onClick={() => {
                      markAllAsRead();
                      setIsOpen(false);
                    }}
                    className="py-1.5 px-3 text-xs font-medium text-center text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                  >
                    Mark all as read
                  </button>

                  <button
                    onClick={() => {
                      // Navigate to the contact tab
                      const contactTab = document.querySelector('[data-value="contact"]') as HTMLElement;
                      if (contactTab) {
                        contactTab.click();
                      }
                      setIsOpen(false);
                    }}
                    className="py-1.5 px-3 text-xs font-medium text-center text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    View all messages
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src={notificationSound} preload="auto" />
    </div>
  );
};

export default NotificationsDropdown;
