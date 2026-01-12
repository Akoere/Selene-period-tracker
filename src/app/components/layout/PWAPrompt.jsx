import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }

    // 2. iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Show prompt on iOS if not dismissed recently
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 86400000) { // 24 hours
        // Small delay to not annoy immediately
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    // 3. Android/Desktop Detection (beforeinstallprompt)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check dismissal
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 86400000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:right-auto md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5 border border-pink-100 dark:border-pink-900/30 z-60 animate-in slide-in-from-bottom-5">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 opacity-50 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 bg-linear-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
           <Download className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Install Selene</h3>
          <p className="text-sm opacity-70 mb-3">
            Add to your home screen for the best experience. Works offline!
          </p>

          {isIOS ? (
            <div className="text-xs bg-gray-50 dark:bg-white/5 p-3 rounded-lg space-y-2 border border-dashed border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md font-bold">1</span>
                <span>Tap the <Share className="w-3 h-3 inline mx-1" /> Share button</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md font-bold">2</span>
                <span>Select <PlusSquare className="w-3 h-3 inline mx-1" /> Add to Home Screen</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 rounded-xl font-semibold text-white shadow-md bg-linear-to-r from-pink-500 to-purple-500 active:scale-95 transition-transform"
            >
              Install App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
