import { createContext, useContext, useState, useEffect } from 'react';

const SecurityContext = createContext({});

export function useSecurity() {
  return useContext(SecurityContext);
}

export function SecurityProvider({ children }) {
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState(null); // '1234' or null
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  // --- INIT ---
  useEffect(() => {
    async function init() {
      // Load Settings from LocalStorage (fastest for lock)
      const storedPin = localStorage.getItem('selene_pin_code');
      const pinEnabled = localStorage.getItem('selene_pin_enabled') === 'true';
      const privacyStored = localStorage.getItem('selene_privacy_mode_enabled') === 'true';
      
      if (storedPin) {
        setPin(storedPin);
      }
      
      setIsPinEnabled(pinEnabled);
      setPrivacyMode(privacyStored);
      
      // Lock immediately if enabled
      if (pinEnabled) {
        setIsLocked(true);
      }

      // Sync with Supabase (Background) - just specifically for non-critical prefs
      // We keep PIN local for now for simplicity/privacy, or could sync boolean 'has_pin'
    }
    init();
  }, []);

  // --- ACTIONS ---

  const verifyPin = (inputPin) => {
    if (inputPin === pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setAppPin = (newPin) => {
    setPin(newPin);
    setIsPinEnabled(true);
    localStorage.setItem('selene_pin_code', newPin);
    localStorage.setItem('selene_pin_enabled', 'true');
  };

  const disablePin = () => {
    setPin(null);
    setIsPinEnabled(false);
    localStorage.removeItem('selene_pin_code');
    localStorage.setItem('selene_pin_enabled', 'false');
  };

  const toggleNotifications = async (enabled) => {
     // ... (Keep existing implementation)
     setNotificationsEnabled(enabled);
     // ...
  };

  const togglePrivacyMode = (enabled) => {
    setPrivacyMode(enabled);
    localStorage.setItem('selene_privacy_mode_enabled', enabled);
  };

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        setIsLocked,
        isPinEnabled,
        hasPin: !!pin,
        verifyPin,
        setAppPin,
        disablePin,
        notificationsEnabled,
        privacyMode,
        toggleNotifications,
        togglePrivacyMode
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}
