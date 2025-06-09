// NotificationService.ts - Centralized notification management for contact messages
import { toast } from 'react-toastify';
import { Bell } from 'lucide-react';
import React from 'react';

// Import notification sound path
// Import directly using the import statement instead of relative path
import notificationSound from './messageNotification.mp3';

// Singleton notification service class
class NotificationService {  private static instance: NotificationService;
  private audio: HTMLAudioElement | null = null;
  private notificationsEnabled: boolean = true;
  private previousUnreadCount: number = 0;
  private isFirstCheck: boolean = true;
  private isInitialLoad: boolean = true;private constructor() {
    // Create audio element when in browser environment
    if (typeof window !== 'undefined') {
      console.log('Initializing NotificationService...');
      this.audio = new Audio(notificationSound);
      this.audio.preload = 'auto';
      this.audio.volume = 0.7; // Slightly lower default volume
      
      // Attach event handlers to log audio element behavior
      this.audio.onplay = () => console.log('Notification sound started playing');
      this.audio.onended = () => console.log('Notification sound finished playing');
      this.audio.onerror = (e) => console.error('Audio error:', e);
      
      // Try to load notification preferences from localStorage
      const savedPref = localStorage.getItem('notificationsEnabled');
      if (savedPref !== null) {
        this.notificationsEnabled = savedPref === 'true';
      }
      console.log('Notifications enabled:', this.notificationsEnabled);
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }  // Play notification sound and show toast
  public notifyNewMessages(currentUnreadCount: number): void {
    console.log('Notification service checking messages:', { 
      current: currentUnreadCount, 
      previous: this.previousUnreadCount, 
      isFirstCheck: this.isFirstCheck 
    });
    
    // Skip playing sound on initial load, but still track counts
    if (this.isFirstCheck) {
      console.log('First check, setting initial count:', currentUnreadCount);
      this.previousUnreadCount = currentUnreadCount;
      this.isFirstCheck = false;
      return;
    }
    
    // Only play notification if:
    // 1. There are more unread messages than before
    // 2. Notifications are enabled
    // 3. We have an audio reference
    if (
      currentUnreadCount > this.previousUnreadCount && 
      this.notificationsEnabled && 
      this.audio
    ) {
      console.log('Playing notification sound for new messages:', currentUnreadCount);
      
      // Play notification sound - force a replay by resetting currentTime
      try {
        // Ensure audio is reset and ready to play
        this.audio.pause();
        this.audio.currentTime = 0;
        
        // Create a promise to play the sound with a timeout
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log('Notification sound playing successfully'))
            .catch(err => {
              console.error('Error playing notification sound:', err);
              // If autoplay was prevented, try again with user interaction
              console.log('Attempting to work around autoplay restrictions...');
              
              // Try a different approach - create a new Audio instance
              const backupAudio = new Audio(notificationSound);
              backupAudio.volume = 0.7;
              backupAudio.play().catch(err2 => 
                console.error('Backup audio playback also failed:', err2)
              );
            });
        }
      } catch (err) {
        console.error('Exception during audio playback:', err);
      }

      // Show a toast notification for new messages
      const newMessages = currentUnreadCount - this.previousUnreadCount;
      if (newMessages === 1) {
        toast.info('You have a new unread message', {
          icon: () => React.createElement(Bell, { className: "h-5 w-5 text-primary" })
        });
      } else if (newMessages > 1) {
        toast.info(`You have ${newMessages} new unread messages`, {
          icon: () => React.createElement(Bell, { className: "h-5 w-5 text-primary" })
        });
      }
    }

    // Update the previous count for next comparison
    this.previousUnreadCount = currentUnreadCount;
  }

  // Toggle notifications on/off
  public toggleNotifications(): boolean {
    this.notificationsEnabled = !this.notificationsEnabled;
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationsEnabled', this.notificationsEnabled.toString());
    }
    
    return this.notificationsEnabled;
  }

  // Get current notification state
  public isNotificationsEnabled(): boolean {
    return this.notificationsEnabled;
  }
}

// Export singleton instance
export default NotificationService.getInstance();
