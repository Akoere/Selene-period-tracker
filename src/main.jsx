import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';
import { registerSW } from 'virtual:pwa-register';

// Register the Service Worker to enable PWA capabilities (Install, Offline, etc.)
const updateSW = registerSW({
  onNeedRefresh() {
    // Optional: Prompt user to reload when a new version is available
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);