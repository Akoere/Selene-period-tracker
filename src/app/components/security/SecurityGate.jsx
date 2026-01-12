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
    <div className="fixed inset-0 z-1000 bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center">
      {/* Background Ambience */}
      <div className={`absolute inset-0 opacity-10 bg-linear-to-br ${gradient}`} />
      
      <div className="relative z-10 space-y-8 animate-in zoom-in-95 duration-500">
        <div className={`w-24 h-24 mx-auto rounded-full bg-linear-to-br ${gradient} flex items-center justify-center shadow-xl`}>
          <Lock className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold dark:text-white">Selene Locked</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your health data is protected.
          </p>
        </div>

        <button
          onClick={unlockApp}
          className={`w-full max-w-xs py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95 hover:shadow-xl bg-linear-to-r ${gradient}`}
        >
          <Fingerprint className="w-6 h-6" />
          {isSupported ? "Unlock with FaceID / TouchID" : "Unlock App"}
        </button>
      </div>
    </div>
  );
}
