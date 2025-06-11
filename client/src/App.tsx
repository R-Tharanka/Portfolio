import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ServiceWorkerProvider } from './context/ServiceWorkerContext';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import Analytics from './components/common/Analytics';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SocialSidebar from './components/layout/SocialSidebar';
import HeroSection from './components/sections/HeroSection';
import AboutSection from './components/sections/AboutSection';
import SkillsSection from './components/sections/SkillsSection';
import ProjectsSection from './components/sections/ProjectsSection';
import EducationSection from './components/sections/EducationSection';
import ContactSection from './components/sections/ContactSection';
import AdminPanel from './components/admin/AdminPanel';
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
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                zIndex: 10000, // Ensure toasts appear above all other elements
                background: 'var(--color-background)',
                color: 'var(--color-text)',
                backdropFilter: 'blur(8px)',
                fontWeight: 500
              },
            }}
          />
          <Analytics />
          <div className="relative">
            <DevelopmentBanner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </BrowserRouter>
          </div>
        </ServiceWorkerProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;