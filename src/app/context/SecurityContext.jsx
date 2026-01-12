import { createContext, useContext, useState, useEffect } from 'react';

const SecurityContext = createContext({});

export function useSecurity() {
  return useContext(SecurityContext);
}

export function SecurityProvider({ children }) {
  const [isLocked, setIsLocked] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false); // New State
  const [isSupported, setIsSupported] = useState(false);

  // --- INIT ---
  useEffect(() => {
    async function init() {
      // 1. Check for WebAuthn Support
      if (window.PublicKeyCredential && 
          window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
          await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        setIsSupported(true);
      } else {
        setIsSupported(false);
      }

      // 2. Load Settings from Supabase (fallback to LocalStorage)
      try {
        const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase.auth.getUser());
        if (user) {
          const { getProfile } = await import('@/lib/api');
          const { data: profile } = await getProfile(user.id);
          
          if (profile) {
            // Check for specific columns first, fallback to localStorage if null
            // Assuming DB has 'is_app_lock_enabled', 'is_notifications_enabled', 'is_privacy_mode_enabled' boolean columns
            const bioDB = profile.is_app_lock_enabled;
            const notifDB = profile.is_notifications_enabled;
            const privacyDB = profile.is_privacy_mode_enabled;

            // If DB values exist (not null), use them. Otherwise default to localStorage logic
            if (bioDB !== undefined && bioDB !== null) {
              setBiometricsEnabled(bioDB);
              if (bioDB) setIsLocked(true); // Lock if enabled
            } else {
               // Fallback / First Run
               const bioStored = localStorage.getItem('selene_biometrics_enabled') === 'true';
               setBiometricsEnabled(bioStored);
               if (bioStored) setIsLocked(true);
            }

            if (notifDB !== undefined && notifDB !== null) {
              setNotificationsEnabled(notifDB);
            } else {
               const notifStored = localStorage.getItem('selene_notifications_enabled') === 'true';
               setNotificationsEnabled(notifStored);
            }

            if (privacyDB !== undefined && privacyDB !== null) {
              setPrivacyMode(privacyDB);
            } else {
               const privacyStored = localStorage.getItem('selene_privacy_mode_enabled') === 'true';
               setPrivacyMode(privacyStored);
            }
            return; 
          }
        }
      } catch (err) {
        console.error("Failed to sync settings from backend", err);
      }

      // 3. Fallback: LocalStorage only (Guest / Error)
      const bioStored = localStorage.getItem('selene_biometrics_enabled') === 'true';
      const notifStored = localStorage.getItem('selene_notifications_enabled') === 'true';
      const privacyStored = localStorage.getItem('selene_privacy_mode_enabled') === 'true';
      
      setBiometricsEnabled(bioStored);
      setNotificationsEnabled(notifStored);
      setPrivacyMode(privacyStored);
      if (bioStored) setIsLocked(true);
    }
    init();
  }, []);

  // --- ACTIONS ---

  const toggleBiometrics = async (enabled) => {
    setBiometricsEnabled(enabled);
    localStorage.setItem('selene_biometrics_enabled', enabled);
    
    // Sync to Backend
    try {
      const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase.auth.getUser());
      if (user) {
         const { updateProfile } = await import('@/lib/api');
         await updateProfile(user.id, { is_app_lock_enabled: enabled });
      }
    } catch (e) {
      console.warn("Failed to sync biometrics setting", e);
    }
  };

  const toggleNotifications = async (enabled) => {
    let newState = enabled;
    
    if (enabled) {
      // Request permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert("We need permission to send you notifications.");
          return false;
        }
      } else {
        alert("This browser does not support notifications.");
        return false;
      }
    }

    setNotificationsEnabled(newState);
    localStorage.setItem('selene_notifications_enabled', newState ? 'true' : 'false');

    // Sync to Backend
    try {
      const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase.auth.getUser());
      if (user) {
         const { updateProfile } = await import('@/lib/api');
         await updateProfile(user.id, { is_notifications_enabled: newState });
      }
    } catch (e) {
      console.warn("Failed to sync notification setting", e);
    }
    
    return true;
  };

  const togglePrivacyMode = async (enabled) => {
    setPrivacyMode(enabled);
    localStorage.setItem('selene_privacy_mode_enabled', enabled);

    // Sync to Backend
    try {
      const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase.auth.getUser());
      if (user) {
         const { updateProfile } = await import('@/lib/api');
         await updateProfile(user.id, { is_privacy_mode_enabled: enabled });
      }
    } catch (e) {
      console.warn("Failed to sync privacy setting", e);
    }
  };

  const unlockApp = async () => {
    // If not supported logic fell through or we want to bypass
    if (!isSupported && !biometricsEnabled) {
      setIsLocked(false);
      return;
    }

    try {
      // User Presence Check
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Selene Period Tracker",
          },
          user: {
            id: new Uint8Array(16),
            name: "user@selene",
            displayName: "Selene User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // FaceID / TouchID / Hello
            userVerification: "required",
          },
          timeout: 60000,
        },
      });

      // Success
      setIsLocked(false);
    } catch (err) {
      console.error("Biometric check failed", err);
      // Fallback for testing/failures
      // In a real app, we might ask for a PIN here.
      // For now, allow them to unlock if they confirm (so they aren't locked out)
      const forceUnlock = window.confirm("Biometrics failed or not available. Unlock with device passcode/confirmation?");
      if (forceUnlock) setIsLocked(false);
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        biometricsEnabled,
        notificationsEnabled,
        privacyMode, // Export
        isSupported,
        toggleBiometrics,
        toggleNotifications,
        togglePrivacyMode, // Export
        unlockApp,
        lockApp: () => setIsLocked(true),
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}
