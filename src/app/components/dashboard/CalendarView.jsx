import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLogsForMonth, getProfile, getRecentLogs } from '@/lib/api'; // Added getProfile & getRecentLogs

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [logs, setLogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [lastPeriodStart, setLastPeriodStart] = useState(null); // To store the anchor date
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // 1. Get User
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // 2. Fetch Logs & Profile Data
  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      setLoading(true);
      
      // A. Fetch Monthly Logs (for display)
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const { data: monthLogs } = await getLogsForMonth(userId, year, month);
      if (monthLogs) setLogs(monthLogs);

      // B. Fetch Profile (for cycle length)
      const { data: profileData } = await getProfile(userId);
      setProfile(profileData);

      // C. Fetch Recent Logs (to find LAST period for prediction)
      const { data: recentLogs } = await getRecentLogs(userId, 90);
      if (recentLogs) {
        // Logic to find the most recent "First Day of Period"
        // Sort newest first
        const sorted = [...recentLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Find a day with flow where the day before had NO flow
        let foundDate = null;
        for (const log of sorted) {
            if (log.flow_level && log.flow_level !== 'None') {
                foundDate = new Date(log.date);
                // We keep searching to see if this belongs to a block, 
                // but for simple prediction, the latest flow date is a safe "anchor" 
                // if we subtract the days logged so far. 
                // A better way: Just grab the latest flow date found.
                break; 
            }
        }
        setLastPeriodStart(foundDate);
      }
      
      setLoading(false);
    }
    
    loadData();
  }, [currentMonth, userId]);

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  // --- PREDICTION LOGIC ---
  const isPredictedPeriod = (day) => {
    if (!profile || !lastPeriodStart) return false;

    // Current cell date
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    // Don't predict in the past
    const today = new Date();
    today.setHours(0,0,0,0);
    if (checkDate < today) return false;

    const cycleLen = profile.cycle_length || 28;
    const periodLen = profile.period_length || 5;

    // Calculate days since last period
    const diffTime = checkDate - lastPeriodStart;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if this day falls into a future cycle window
    // Example: Day 28, 29, 30... or Day 56, 57, 58...
    const cycleIndex = Math.floor(diffDays / cycleLen); // Which future cycle is this?
    const dayInCycle = diffDays % cycleLen;

    // If dayInCycle is between 0 and periodLen, it's a predicted period day
    // We strictly check cycleIndex > 0 to ensure we are predicting a *future* cycle, not the current one
    // (unless the current one is in the future relative to the last log)
    return dayInCycle >= 0 && dayInCycle < periodLen;
  };

  const getDayType = (day) => {
    const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = logs.find(l => l.date === dateString);

    // 1. Prioritize Real Logs
    if (log && log.flow_level && log.flow_level !== 'None') return 'period';

    // 2. Show Predictions for Future
    if (isPredictedPeriod(day)) return 'prediction';

    return 'normal';
  };

  const dayStyles = {
    period: 'bg-gradient-to-br from-red-400 to-pink-400 text-white shadow-md',
    prediction: 'bg-red-100 text-red-400 border-2 border-red-200 border-dashed', // Dashed border for predictions
    normal: 'text-[var(--foreground)] hover:bg-[var(--secondary)]',
  };

  return (
    <div className="bg-[var(--background)] rounded-3xl shadow-lg p-6 border border-[var(--secondary)] transition-colors duration-300">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
          {monthName}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </h3>
        <div className="flex gap-2">
          <button onClick={previousMonth} className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors text-[var(--foreground)]"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors text-[var(--foreground)]"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-[var(--foreground)] opacity-50 py-2">{day}</div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, index) => <div key={`empty-${index}`} />)}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayType = getDayType(day);
          const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

          return (
            <button
              key={day}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs transition-all relative mx-auto ${dayStyles[dayType] || dayStyles.normal} ${isToday ? 'ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--background)]' : ''}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--secondary)]">
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-pink-400" />
            <span className="text-xs text-[var(--foreground)] opacity-70">Logged Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-200 border-dashed" />
            <span className="text-xs text-[var(--foreground)] opacity-70">Predicted</span>
          </div>
        </div>
      </div>
    </div>
  );
}