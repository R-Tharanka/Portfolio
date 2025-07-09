import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ServiceWorkerProvider } from './context/ServiceWorkerContext';
import { ApiProvider } from './context/ApiContext';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import Analytics from './components/common/Analytics';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ToastManager from './components/ui/ToastManager';
import ApiOfflineNotice from './components/ui/ApiOfflineNotice';
import SocialSidebar from './components/layout/SocialSidebar';
import HeroSection from './components/sections/HeroSection';
import AboutSection from './components/sections/AboutSection';
import SkillsSection from './components/sections/SkillsSection';
import ProjectsSection from './components/sections/ProjectsSection';
import EducationSection from './components/sections/EducationSection';
import ContactSection from './components/sections/ContactSection';
import AdminPanel from './components/admin/AdminPanel';
import ResetPassword from './components/admin/auth/ResetPassword';
import SEO from './components/common/SEO';
import DevelopmentBanner from './components/ui/DevelopmentBanner';

const MainPage = () => {
  return (
    <div className="relative">
      <SEO />
      <Header />
      <SocialSidebar />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <EducationSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <ServiceWorkerProvider>
          <ApiProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  zIndex: 10000, // High but still lower than ApiOfflineNotice
                  background: 'var(--color-background)',
                  color: 'var(--color-text)',
                  backdropFilter: 'blur(8px)',
                  fontWeight: 500
                },
              }}
            />
            <Analytics />
            <ToastManager /> {/* Add global toast manager for API errors */}
            <ApiOfflineNotice /> {/* Show notice when API is unreachable */}
            <div className="relative">
              <DevelopmentBanner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/reset-password" element={<ResetPassword />} />
                </Routes>
              </BrowserRouter>
            </div>
          </ApiProvider>
        </ServiceWorkerProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;