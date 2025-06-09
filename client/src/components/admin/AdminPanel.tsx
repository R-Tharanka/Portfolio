import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import SkillsAdmin from './skills/SkillsAdmin';
import ProjectsAdmin from './projects/ProjectsAdmin';
import EducationAdmin from './education/EducationAdmin';
import ContactAdmin from './contact/ContactAdmin';
import AccountSettings from './auth/AccountSettings';
import LoginForm from './auth/LoginForm';
import NotificationsDropdown, { NotificationMessage } from './contact/NotificationsDropdown';
import SEO from '../common/SEO';
import { isTokenExpired, getTokenRemainingTime } from '../../utils/auth';
import { getContactMessages, markMessageAsRead, toggleMessageReadStatus } from '../../services/api';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("skills");
  const [unreadMessages, setUnreadMessages] = useState<NotificationMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  // Toggle between account settings and the previously active tab
  const toggleAccountSettings = () => {
    setActiveTab(prev => prev === "account" ? "skills" : "account");
  };

  // Fetch unread messages for notifications
  const fetchUnreadMessages = async () => {
    if (!token) return;

    setIsLoadingMessages(true);
    try {
      const response = await getContactMessages(token);
      if (!response.error && response.data) {
        const unread = response.data.filter(message => !message.read);
        setUnreadMessages(unread);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Mark a single message as read
  const handleMarkMessageAsRead = async (messageId: string) => {
    if (!token) return;

    try {
      const response = await markMessageAsRead(messageId, token);
      if (!response.error) {
        setUnreadMessages(prev => prev.filter(msg => msg._id !== messageId));

        // If we're on the messages tab, force refetch to update UI
        if (activeTab === "contact") {
          setActiveTab("contact");
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all messages as read
  const handleMarkAllAsRead = async () => {
    if (!token || unreadMessages.length === 0) return;

    try {
      // Create array of promises for each message status update
      const updatePromises = unreadMessages.map(msg =>
        toggleMessageReadStatus(msg._id, true, token)
      );

      await Promise.all(updatePromises);
      setUnreadMessages([]);

      // If we're on the messages tab, force refetch to update UI
      if (activeTab === "contact") {
        setActiveTab("contact");
      }
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };
  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('adminToken');

    if (storedToken) {
      // Verify if token is expired
      if (isTokenExpired(storedToken)) {
        // Token is expired, remove it and require login
        console.log('Admin token expired, logging out');
        localStorage.removeItem('adminToken');
        setToken(null);
        setIsAuthenticated(false);
      } else {
        // Valid token, set as authenticated
        setToken(storedToken);
        setIsAuthenticated(true);

        // Set up auto-logout when token expires
        const remainingTime = getTokenRemainingTime(storedToken);
        console.log(`Token will expire in ${remainingTime} seconds`);

        // Set a timer to log out when token expires
        const logoutTimer = setTimeout(() => {
          console.log('Token expiration timer triggered, logging out');
          localStorage.removeItem('adminToken');
          setToken(null);
          setIsAuthenticated(false);
        }, remainingTime * 1000);

        // Check token expiration periodically (every minute)
        const tokenCheckInterval = setInterval(() => {
          const currentToken = localStorage.getItem('adminToken');
          if (currentToken && isTokenExpired(currentToken)) {
            console.log('Periodic check: Token expired, logging out');
            localStorage.removeItem('adminToken');
            setToken(null);
            setIsAuthenticated(false);
            clearInterval(tokenCheckInterval);
          }
        }, 60000); // Check every minute

        // Fetch unread messages initially
        fetchUnreadMessages();

        // Clean up timers if component unmounts
        return () => {
          clearTimeout(logoutTimer);
          clearInterval(tokenCheckInterval);
        };
      }
    }
  }, []);
  // Listen for token expiration events from API interceptors
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expired event received, logging out');
      setToken(null);
      setIsAuthenticated(false);
    };

    // Add event listener
    window.addEventListener('auth:tokenExpired', handleTokenExpired);

    // Clean up
    return () => {
      window.removeEventListener('auth:tokenExpired', handleTokenExpired);
    };
  }, []);
  // Periodically fetch unread messages more frequently
  useEffect(() => {
    if (!token) return;

    // Set up polling for new messages
    const messageCheckInterval = setInterval(() => {
      fetchUnreadMessages();
    }, 10000); // Check every 10 seconds for more responsive notifications

    return () => {
      clearInterval(messageCheckInterval);
    };
  }, [token]);
  const handleLogin = (authToken: string) => {
    localStorage.setItem('adminToken', authToken);
    setToken(authToken);
    setIsAuthenticated(true);

    // Set up auto-logout for the new token
    const remainingTime = getTokenRemainingTime(authToken);
    console.log(`New token will expire in ${remainingTime} seconds`);

    // Set a timer to log out when token expires
    setTimeout(() => {
      console.log('Token expiration timer triggered, logging out');
      localStorage.removeItem('adminToken');
      setToken(null);
      setIsAuthenticated(false);
    }, remainingTime * 1000);

    // Fetch unread messages immediately after login
    setTimeout(() => {
      fetchUnreadMessages();
    }, 500);
  };
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SEO title="Admin Dashboard" description="Portfolio Admin Panel for content management" />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-3">
          {/* Notifications Dropdown */}
          <div className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-sm">
            <NotificationsDropdown
              unreadMessages={unreadMessages}
              unreadCount={unreadMessages.length}
              markAsRead={handleMarkMessageAsRead}
              markAllAsRead={handleMarkAllAsRead}
            />
          </div>

          <button
            onClick={toggleAccountSettings}
            className={`p-2 ${activeTab === "account"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
              } text-white rounded-lg transition-colors relative`}
            title="Account Settings"
            aria-label="Account Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {activeTab === "account" && (
              <span className="absolute top-0 right-0 block w-2 h-2 bg-white rounded-full transform translate-x-1/2 -translate-y-1/2"></span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-8">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="contact">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <SkillsAdmin token={token} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsAdmin token={token} />
        </TabsContent>

        <TabsContent value="education">
          <EducationAdmin token={token} />
        </TabsContent>

        <TabsContent value="contact">
          <ContactAdmin token={token} />
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings onCredentialsUpdated={handleLogin} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
