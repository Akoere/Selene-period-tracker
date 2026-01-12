import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Droplet, Activity, TrendingUp, FileText, Loader2, Bell, ChevronRight, Sparkles } from 'lucide-react';
import { LoggerModal } from './dashboard/LoggerModal';
import { supabase } from '@/lib/supabase';
import { getProfile, getRecentLogs } from '@/lib/api';
import { useSecurity } from '../context/SecurityContext';
import { useData } from '../context/DataContext';
import { sendNotification } from '@/lib/notifications';

export function Dashboard() {
  const { currentTheme } = useTheme();
  const { notificationsEnabled } = useSecurity();
  const { profile, recentLogs: logs, loading: dataLoading } = useData();
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [activeLoggerTab, setActiveLoggerTab] = useState(null);
  const navigate = useNavigate();

  // Real Data State
  const [loading, setLoading] = useState(true);
  const [cycleDay, setCycleDay] = useState(null);
  const [phase, setPhase] = useState("Unknown");

  // Sync loading state
  useEffect(() => {
    setLoading(dataLoading);
  }, [dataLoading]);

  useEffect(() => {
    async function calculateCycleData() {
      try {
        if (loading || !profile) return;
        
        const profileData = profile; // Use from context

        // 2. Used logs from context
        // const { data: logs } = await getRecentLogs(user.id, 90); -- REMOVED
        let lastPeriodStart = null;

        if (logs && logs.length > 0) {
          const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

          // Logic: Find most recent flow
          const latestFlowLog = sortedLogs.find(l => l.flow_level && l.flow_level !== 'None');

          if (latestFlowLog) {
            let currentCheckDate = new Date(latestFlowLog.date);
            let foundStart = false;

            // Find the start of that period block
            while (!foundStart) {
              const prevDate = new Date(currentCheckDate);
              prevDate.setDate(prevDate.getDate() - 1);
              const prevDateStr = prevDate.toISOString().split('T')[0];
              const prevLog = logs.find(l => l.date === prevDateStr && l.flow_level && l.flow_level !== 'None');

              if (prevLog) currentCheckDate = prevDate;
              else foundStart = true;
            }
            lastPeriodStart = currentCheckDate;
          }

          if (lastPeriodStart) {
            const today = new Date();
            const diffTime = Math.abs(today - lastPeriodStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setCycleDay(diffDays);

            // Determine Phase
            const length = profileData?.cycle_length || 28;
            const lutealLength = 14;
            const ovulationDay = length - lutealLength;

            if (diffDays <= 5) setPhase("Menstrual");
            else if (diffDays < ovulationDay - 2) setPhase("Follicular");
            else if (diffDays <= ovulationDay + 2) setPhase("Ovulation");
            else setPhase("Luteal");
          } else {
            setCycleDay(null);
            setPhase("Tracking...");
          }
        } else {
          setCycleDay(null);
          setPhase("New Cycle");
        }

        // NOTIFICATION LOGIG
        if (notificationsEnabled && lastPeriodStart) {
          const today = new Date();
          const diffTime = Math.abs(today - lastPeriodStart);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const cycleLen = profileData?.cycle_length || 28;
          const daysLeft = cycleLen - diffDays;

          // Check if we already notified today
          const lastNotifDate = localStorage.getItem('selene_last_notification_date');
          const todayStr = today.toISOString().split('T')[0];

          if (lastNotifDate !== todayStr) {
             if (daysLeft <= 2 && daysLeft >= 0) {
               sendNotification("Period Coming Soon", `Your period is expected in ${daysLeft} days.`);
               localStorage.setItem('selene_last_notification_date', todayStr);
             } else if (daysLeft < 0) {
               sendNotification("Period Overdue", `Your period is overdue by ${Math.abs(daysLeft)} days.`);
               localStorage.setItem('selene_last_notification_date', todayStr);
             }
          }
        }

      } catch (error) {
        console.error("Error calculating dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    calculateCycleData();
  }, [isLoggerOpen, logs, profile, loading]);

  const openLogger = (tab) => {
    setActiveLoggerTab(tab);
    setIsLoggerOpen(true);
  };

  const closeLogger = () => {
    setActiveLoggerTab(null);
    setIsLoggerOpen(false);
  };

  // Safe colors fallback
  const primaryColor = currentTheme?.colors?.primary || '#ec4899';

  return (
    <div className="space-y-8 pb-24 px-2 md:px-0">

      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--foreground)">
            Hello, <span style={{ color: primaryColor }}>{profile?.full_name?.split(' ')[0] || 'Selene'}</span>
          </h1>
          <p className="text-sm opacity-60 font-medium mt-1">
            {loading ? "Loading..." : cycleDay ? `Cycle Day ${cycleDay} • ${phase} Phase` : "Let's log your first period"}
          </p>
        </div>
        <button
          className="p-3 backdrop-blur-md bg-white/40 dark:bg-black/20 border border-white/20 rounded-full shadow-sm hover:bg-white/60 transition-colors"
        >
          <Bell className="w-5 h-5" style={{ color: primaryColor }} />
        </button>
      </header>

      {/* Modern Hero Card (Glassmorphism) */}
      <div
        className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 shadow-xl transition-all duration-500 group bg-white dark:bg-gray-900 border border-white/40 dark:border-white/10"
      >
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-blue-200/20 to-teal-200/20 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center h-64">
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin opacity-50" />
          ) : (
            <>
              {/* Main Cycle Indicator */}
              <div className="relative mb-6">
                {/* Ring Animation */}
                <div className="absolute inset-0 rounded-full animate-pulse opacity-20" style={{ backgroundColor: primaryColor }}></div>

                <div
                  className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center relative backdrop-blur-sm bg-white/30 dark:bg-black/10 shadow-inner border border-white/40"
                >
                  <div className="text-center">
                    <span className="block text-6xl md:text-7xl font-bold tracking-tighter" style={{ color: primaryColor }}>
                      {cycleDay || '?'}
                    </span>
                    <span className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1 block dark:text-gray-300">
                      {cycleDay ? 'Days' : 'No Data'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Text */}
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-(--foreground) dark:text-white">
                  {phase} Phase
                </h2>
                <div className="flex items-center justify-center gap-2 opacity-60 text-sm dark:text-gray-300">
                  <Sparkles className="w-3 h-3" />
                  <span>{cycleDay ? 'Tracking Active' : 'Waiting for input'}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Grid (Glass Cards) */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: 'Log Flow',
            desc: 'Record your period',
            icon: Droplet,
            color: '#ef4444',
            action: () => openLogger('flow')
          },
          {
            label: 'Log Symptoms',
            desc: 'How do you feel?',
            icon: Activity,
            color: '#f97316',
            action: () => openLogger('symptoms')
          },
          {
            label: 'Insights',
            desc: 'View your trends',
            icon: TrendingUp,
            color: '#8b5cf6',
            action: () => navigate('/insights')
          },
          {
            label: 'Daily Notes',
            desc: 'Journal your day',
            icon: FileText,
            color: '#3b82f6',
            action: () => openLogger('notes')
          },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="relative overflow-hidden p-5 rounded-3xl text-left transition-all hover:scale-[1.02] active:scale-95 group shadow-sm hover:shadow-md bg-white dark:bg-gray-800 border border-white/50 dark:border-white/10"
          >
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 opacity-20 dark:text-gray-400" />
            </div>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <item.icon className="w-6 h-6" style={{ color: item.color }} />
            </div>

            <div>
              <h3 className="font-bold text-lg leading-tight mb-1 text-(--foreground) dark:text-white">{item.label}</h3>
              <p className="text-xs opacity-50 font-medium dark:text-gray-400">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <LoggerModal
        isOpen={!!activeLoggerTab}
        defaultTab={activeLoggerTab || 'flow'}
        onClose={closeLogger}
        onSuccess={() => setIsLoggerOpen(false)}
      />

    </div>
  );
}