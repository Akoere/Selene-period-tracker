import { useState } from 'react';
import { Fingerprint, Shield, Eye, Lock } from 'lucide-react';

export function BiometricSettings() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [requireOnLaunch, setRequireOnLaunch] = useState(true);
  const [requireAfterInactive, setRequireAfterInactive] = useState(true);

  const handleEnableBiometric = () => {
    setBiometricEnabled(!biometricEnabled);
  };

  return (
    <div className="bg-[var(--background)] rounded-3xl shadow-sm overflow-hidden border border-[var(--secondary)] text-[var(--foreground)]">
      <div className="px-6 py-4 border-b border-[var(--secondary)]">
        <h3 className="font-semibold">Web Authentication</h3>
        <p className="text-sm opacity-60 mt-1">Secure your data with passwordless authentication</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Banner */}
        <div className={`p-6 rounded-2xl bg-[var(--secondary)] border-2 ${
          biometricEnabled ? 'border-[var(--primary)]' : 'border-transparent'
        }`}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Fingerprint className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Enable Secure Authentication</h4>
                <button
                  onClick={handleEnableBiometric}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    biometricEnabled ? 'bg-[var(--primary)]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm opacity-70 mb-3">
                Use your device's built-in authentication (fingerprint, face recognition, or security key)
              </p>
              {biometricEnabled && (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <Shield className="w-4 h-4" />
                  <span>Passwordless authentication active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {biometricEnabled && (
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 rounded-xl hover:bg-[var(--secondary)] transition-colors">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 opacity-60 mt-1" />
                <div>
                  <p className="font-medium">Require on Launch</p>
                  <p className="text-sm opacity-60">Lock Selene every time you open the app</p>
                </div>
              </div>
              <button
                onClick={() => setRequireOnLaunch(!requireOnLaunch)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  requireOnLaunch ? 'bg-[var(--primary)]' : 'bg-gray-300'
                }`}
              >
                <span className="inline-block h-4 w-4 bg-white rounded-full transition-transform translate-x-1" style={{ transform: requireOnLaunch ? 'translateX(24px)' : 'translateX(4px)' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}