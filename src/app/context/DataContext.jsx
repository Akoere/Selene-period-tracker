import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile, getRecentLogs, getAllLogs } from '@/lib/api';

const DataContext = createContext({});

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children, initialSession }) {
  const [profile, setProfile] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]); 
  const [allLogs, setAllLogs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to refresh data
  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Use passed session if available (first load), otherwise get current
      let user = initialSession?.user;
      
      if (!user) {
         const { data } = await supabase.auth.getUser();
         user = data.user;
      }

      console.log("DataContext: Fetching for user:", user?.id);

      if (!user) {
        setLoading(false);
        return;
      }

      // Parallel fetch (optimized: skip full history initially)
      const [profileRes, recentLogsRes] = await Promise.all([
        getProfile(user.id),
        getRecentLogs(user.id, 90)
      ]);

      let profileData = profileRes.data;

      // Emergency Fix: If profile missing, create it on the fly
      if (!profileData || profileRes.error) {
         console.warn("Profile missing, creating default...");
         const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({ 
                id: user.id, 
                email: user.email,
                full_name: user.user_metadata?.full_name || 'Selene User'
            })
            .select() // Fix: .select() is key for returning data
            .single();
         
         if (!createError) profileData = newProfile;
         else console.error("Profile creation failed:", createError);
      }

      // Final Check: Ensure we have meaningful data
      const finalProfile = {
        ...profileData,
        email: profileData?.email || user.email,
        full_name: profileData?.full_name || user.user_metadata?.full_name || 'Selene User'
      };

      console.log("DataContext: Profile Set:", finalProfile);
      setProfile(finalProfile);
      
      if (recentLogsRes.error) console.error("Logs fetch error:", recentLogsRes.error);
      setRecentLogs(recentLogsRes.data || []);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    // Subscribe to auth changes to reload if user swaps
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') refreshData();
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setRecentLogs([]);
        setAllLogs([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <DataContext.Provider
      value={{
        profile,
        recentLogs,
        allLogs,
        loading,
        error,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
