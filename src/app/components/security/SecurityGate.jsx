import { Shield, Lock, Fingerprint } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { useTheme } from '../../context/ThemeContext';

export function SecurityGate({ children }) {
  const { isLocked, unlockApp, isSupported } = useSecurity();
  const { currentTheme } = useTheme();

  const gradient = currentTheme?.colors?.gradient || 'from-pink-400 to-purple-400';

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-1000 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      {/* Subtle Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-linear-to-br ${gradient} rounded-full blur-[100px] opacity-20 pointer-events-none`} />

      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        
        {/* Minimal Icon */}
        <div className="mb-8">
            <Lock strokeWidth={1.5} className="w-12 h-12 opacity-50 dark:text-white text-gray-800" />
        </div>

        {/* Minimal Text */}
        <div className="space-y-3 mb-12">
          <h1 className="text-3xl font-light tracking-tight dark:text-white text-gray-900">
            Selene
          </h1>
          <p className="text-sm tracking-wide uppercase text-gray-400 font-medium">
            Locked
          </p>
        </div>

        {/* Minimal Button */}
        <button
          onClick={unlockApp}
          className="group relative px-8 py-3 rounded-full overflow-hidden transition-all active:scale-95"
        >
          <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-linear-to-r ${gradient}`} />
          <div className="relative flex items-center gap-2 text-sm font-medium dark:text-white text-gray-900">
            <Fingerprint className="w-5 h-5 opacity-70" />
            <span>Tap to Unlock</span>
          </div>
        </button>
      </div>
    </div>
  );
}
