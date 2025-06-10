import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { unregisterServiceWorkers } from './utils/serviceWorkerCleanup';

// Unregister any old service workers before rendering the app
if (window.localStorage.getItem('sw-needs-cleanup') !== 'false') {
  unregisterServiceWorkers().then(success => {
    // Mark as clean for this session
    window.localStorage.setItem('sw-needs-cleanup', 'false');
    console.log('Service worker cleanup result:', success ? 'successful' : 'not needed');
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);