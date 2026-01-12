import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile, getRecentLogs, getAllLogs } from '@/lib/api';

const DataContext = createContext({});

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]); // Last 90 days for dashboard
  const [allLogs, setAllLogs] = useState([]); // For insights
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to refresh data
  const refreshData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Parallel fetch (optimized: skip full history initially)
      const [profileRes, recentLogsRes] = await Promise.all([
        getProfile(user.id),
        getRecentLogs(user.id, 90)
      ]);

      if (profileRes.error) throw profileRes.error;
      
      // Merge Auth Email with Profile Data (Fallback if DB is empty)
      setProfile({
        ...profileRes.data,
        email: profileRes.data?.email || user.email 
      });
      setRecentLogs(recentLogsRes.data || []);
      setRecentLogs(recentLogsRes.data || []);
      // setAllLogs(allLogsRes.data || []); -- Loaded lazily elsewhere now
      
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
