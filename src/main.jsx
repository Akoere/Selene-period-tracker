import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Force unregister any existing service workers to fix cache issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered to clear cache');
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);