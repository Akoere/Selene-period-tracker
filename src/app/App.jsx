import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/lib/api';

// --- IMPORTS ---
import { ThemeProvider } from './context/ThemeContext';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AuthPage } from './components/AuthPage'; 
import { AppLayout } from './components/layout/AppLayout';

import { AIAssistant } from './components/AI/AIassistant';
import { SecurityProvider } from './context/SecurityContext';

import { SecurityGate } from './components/security/SecurityGate';
import { DataProvider } from './context/DataContext';

// Views
import { Dashboard } from './components/Dashboard';
import { ProfileView } from './components/dashboard/ProfileView';
import { CalendarView } from './components/dashboard/CalendarView';
import { InsightsView } from './components/dashboard/InsightsView';

export default function App() {
  const [session, setSession] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper: Check if user is legally onboarded
  const checkUserOnboarding = async (user) => {
    if (!user) {
       setOnboardingComplete(false);
       return;
    }

    // 1. Check LocalStorage Backup (Fastest)
    const localOnboarded = localStorage.getItem(`selene_onboarded_${user.id}`);
    if (localOnboarded === 'true') {
        setOnboardingComplete(true);
        return; 
    }

    try {
        // 2. Check Database
        const { data: profile } = await getProfile(user.id);
        
        // Valid if: Profile exists AND (flag is true OR cycle data exists)
        const hasProfileData = profile && (profile.is_onboarded || profile.cycle_length > 0);
        
        if (hasProfileData) {
            setOnboardingComplete(true);
            localStorage.setItem(`selene_onboarded_${user.id}`, 'true');
        } else {
             setOnboardingComplete(false);
        }
    } catch (e) {
        console.error("Onboarding check failed", e);
    }
  };

  useEffect(() => {
    async function initApp() {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession?.user) {
         await checkUserOnboarding(initialSession.user);
      }
      setLoading(false);
    }

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
         if (currentSession?.user) {
            await checkUserOnboarding(currentSession.user);
         }
      } else if (event === 'SIGNED_OUT') {
         setOnboardingComplete(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-500 animate-pulse">Loading Selene...</div>;

  if (!session) {
    return (
      <ThemeProvider>
        <SecurityProvider>
          <AuthPage /> {/* <--- UPDATED COMPONENT USAGE */}
        </SecurityProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {!onboardingComplete ? (
        <SecurityProvider>
            <OnboardingFlow onComplete={() => setOnboardingComplete(true)} />
        </SecurityProvider>
      ) : (
        <SecurityProvider>
            <SecurityGate>
              <DataProvider initialSession={session}> {/* <-- CHANGED: Pass Session */}
                <Router>
                    <AppLayout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/profile" element={<ProfileView />} />
                        <Route path="/calendar" element={
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold dark:text-white">Calendar</h2>
                            <CalendarView />
                        </div>
                        } />
                        <Route path="/insights" element={<InsightsView />} />
                    </Routes>
                    </AppLayout>
                    <AIAssistant />
                </Router>
              </DataProvider>
            </SecurityGate>
        </SecurityProvider>
      )}
    </ThemeProvider>
  );
}