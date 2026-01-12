import { PinPad } from './PinPad';
import { useSecurity } from '../../context/SecurityContext';
import { useTheme } from '../../context/ThemeContext';

export function SecurityGate({ children }) {
  const { isLocked, isPinEnabled } = useSecurity();
  const { currentTheme } = useTheme();

  // If not locked, or locked but NO PIN set (shouldn't happen with new logic, but safety first), render children
  if (!isLocked) {
    return <>{children}</>;
  }

  // If locked but pin not enabled (legacy state), maybe show setup or just unlock? 
  // For now, assume if locked, we want PIN. If no PIN is set but locked, show unlock button (legacy fallback)
  
  return (
    <div className="fixed inset-0 z-9999 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 select-none">
        {/* Absolutely ZERO glow or effects as requested */}
        {isPinEnabled ? (
            <div className="w-full">
                <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                        S
                    </div>
                </div>
                <PinPad />
            </div>
        ) : (
             /* Fallback for "Soft Lock" without PIN (should rarely see this now) */
             <div className="text-center">
                 <h1 className="text-xl font-medium mb-4">Locked</h1>
                 <button onClick={() => window.location.reload()} className="text-blue-500">Refresh</button>
             </div>
        )}
    </div>
  );
}
