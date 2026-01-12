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

  useEffect(() => {
    async function initApp() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profile } = await getProfile(session.user.id);
        // Fix: Check if profile has cycle data OR explicit onboarding flag
        if (profile && profile.is_onboarded) {
          setOnboardingComplete(true);
        }
      }
      setLoading(false);
    }

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setOnboardingComplete(false);
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
              <DataProvider> {/* <-- ADDED PROVIDER */}
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