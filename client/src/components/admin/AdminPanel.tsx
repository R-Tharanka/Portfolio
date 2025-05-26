import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import SkillsAdmin from './skills/SkillsAdmin';
import ProjectsAdmin from './projects/ProjectsAdmin';
import EducationAdmin from './education/EducationAdmin';
import ContactAdmin from './contact/ContactAdmin';
import LoginForm from './auth/LoginForm';
import SEO from '../common/SEO';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (authToken: string) => {
    localStorage.setItem('adminToken', authToken);
    setToken(authToken);
    setIsAuthenticated(true);
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
      </div>

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="contact">Contact Messages</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default AdminPanel;
