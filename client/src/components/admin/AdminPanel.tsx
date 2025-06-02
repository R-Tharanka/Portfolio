import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import SkillsAdmin from './skills/SkillsAdmin';
import ProjectsAdmin from './projects/ProjectsAdmin';
import EducationAdmin from './education/EducationAdmin';
import ContactAdmin from './contact/ContactAdmin';
import AccountSettings from './auth/AccountSettings';
import LoginForm from './auth/LoginForm';
import SEO from '../common/SEO';
import { isTokenExpired, getTokenRemainingTime } from '../../utils/auth';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);  useEffect(() => {
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
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="contact">Contact Messages</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
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
          <TabsContent value="account">
          <AccountSettings onCredentialsUpdated={handleLogin} />
        </TabsContent>
        
        <TabsContent value="contact">
          <ContactAdmin token={token} />
        </TabsContent>
          <AccountSettings token={token} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
