import { useState } from 'react';
import { X, Download, Share } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useTheme } from '../../context/ThemeContext';

export function MobileInstallBanner() {
  const { isInstallable, isIOS, promptInstall } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false); // Default to false to avoid flash
  const { currentTheme } = useTheme();
  
  const gradient = currentTheme?.colors?.gradient || 'from-pink-400 to-purple-400';

  useEffect(() => {
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    // If NOT dismissed or older than 24h, show it
    if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 86400000) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  // Only show if installable OR iOS (and user hasn't dismissed it)
  if (!isVisible || (!isInstallable && !isIOS)) return null;

  return (
    <div className="md:hidden fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div 
        className="rounded-2xl p-4 shadow-xl border backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border-white/20"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Install Selene</h3>
            <p className="text-xs opacity-70">
              {isIOS 
                ? "Add to Home Screen for the best experience." 
                : "Install as an app for fullscreen & offline access."}
            </p>
            
            {/* iOS Helper */}
            {isIOS && (
              <div className="mt-2 text-xs flex items-center gap-1 opacity-60">
                 Tap <Share className="w-3 h-3" /> then "Add to Home Screen"
              </div>
            )}
          </div>
          
          <button onClick={handleDismiss} className="p-1 opacity-40 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button (Android/Desktop only) */}
        {!isIOS && (
          <button
            onClick={promptInstall}
            className={`w-full mt-3 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg flex items-center justify-center gap-2 bg-linear-to-r ${gradient}`}
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
