import { useState, useEffect } from 'react';
import { Calendar, Droplet, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { CalendarView } from './CalendarView';
import { SymptomTracker } from './SymptomTracker';
import { supabase } from '@/lib/supabase';
import { getProfile, getRecentLogs } from '@/lib/api';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

export function CycleOverview() {
  const [loading, setLoading] = useState(true);

  // State for real data
  const [currentDay, setCurrentDay] = useState(1);
  const [cycleLength, setCycleLength] = useState(28);
  const [daysUntilPeriod, setDaysUntilPeriod] = useState(null);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [nextPeriodDate, setNextPeriodDate] = useState(null);
  const [cyclePhase, setCyclePhase] = useState('menstrual');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Profile & Logs
        const [profileRes, logsRes] = await Promise.all([
          getProfile(user.id),
          getRecentLogs(user.id, 90)
        ]);

        const profile = profileRes.data || {};
        const logs = logsRes.data || [];

        // 2. Set Defaults from Profile
        const userCycleLength = profile.cycle_length || 28;
        const userPeriodLength = profile.period_length || 5;

        setCycleLength(userCycleLength);
        setPeriodDuration(userPeriodLength);

        // 3. Calculate Cycle Status
        if (logs.length > 0) {
          // Find last period start
          // Sort logs descending
          const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

          let lastPeriodStart = null;
          // specific logic: Find a flow log that marks the start of a flow block
          const flowLogs = sortedLogs.filter(l => l.flow_level && l.flow_level !== 'None');

          if (flowLogs.length > 0) {
            const latest = flowLogs[0];
            // Traverse backwards to find the first day of this block
            // Simplified: just take the latest flow log if we can't be perfect, 
            // but let's try to be smart.
            // Actually, simply using the latest flow log as "start" is wrong if it's day 4 of period.
            // Let's rely on the simplified dashboard logic for consistency or just find the "gap" > 7 days

            const latestDate = new Date(latest.date);
            lastPeriodStart = latestDate; // Placeholder

            // Refine: check if previous day has flow
            // API doesnt return simple day-by-day array, so we must search
            // This acts as a decent heuristic for "last known flow date"
            // But we really want "Start Date"

            // Better logic: iterate logs from oldest to newest to build cycles
            // But for "Current Status", we just need the most recent period start.

            // Let's assume the latest flow block matches the Dashboard logic
            // For robustness, let's just count days from the *latest flow log* if we can't find start,
            // or try to find the start of the block.
            // Logic: Go back day by day from latest flow log.

            let checkDate = new Date(latest.date);
            let foundStart = false;
            while (!foundStart) {
              const prevDate = addDays(checkDate, -1);
              const prevDateStr = format(prevDate, 'yyyy-MM-dd');
              const hasFlow = logs.some(l => l.date === prevDateStr && l.flow_level && l.flow_level !== 'None');
              if (hasFlow) {
                checkDate = prevDate;
              } else {
                foundStart = true;
              }
            }
            lastPeriodStart = checkDate;
          }

          if (lastPeriodStart) {
            const today = new Date();
            const diff = differenceInDays(today, lastPeriodStart);
            const currentDayCalc = diff + 1; // Day 1 is the start day

            setCurrentDay(currentDayCalc); // Can be negative if system time is weird, but usually +

            // Next Period
            const nextDate = addDays(lastPeriodStart, userCycleLength);
            setNextPeriodDate(nextDate);
            setDaysUntilPeriod(differenceInDays(nextDate, today));

            // Phase
            const lutealLen = 14;
            const ovulationDay = userCycleLength - lutealLen;

            if (currentDayCalc <= userPeriodLength) setCyclePhase("menstrual");
            else if (currentDayCalc < ovulationDay - 5) setCyclePhase("follicular");
            else if (currentDayCalc <= ovulationDay + 2) setCyclePhase("ovulation");
            else setCyclePhase("luteal");

          } else {
            // Logs exist but no flow?
            setCurrentDay(1);
            setCyclePhase("follicular");
          }
        } else {
          // No logs
          setCurrentDay(1);
          setDaysUntilPeriod(null);
          setCyclePhase("follicular");
        }

      } catch (err) {
        console.error("Error in CycleOverview:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const phaseInfo = {
    menstrual: { label: 'Menstrual Phase', color: 'from-red-400 to-pink-400', emoji: '🩸' },
    follicular: { label: 'Follicular Phase', color: 'from-pink-400 to-purple-400', emoji: '🌱' },
    ovulation: { label: 'Ovulation', color: 'from-purple-400 to-blue-400', emoji: '🥚' },
    luteal: { label: 'Luteal Phase', color: 'from-blue-400 to-pink-400', emoji: '🍂' },
  };

  const currentPhase = phaseInfo[cyclePhase] || phaseInfo.follicular;

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-3xl shadow-lg">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className={`bg-linear-to-r ${currentPhase.color} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Current Phase</p>
              <h2 className="text-2xl flex items-center gap-2">
                <span>{currentPhase.emoji}</span>
                {currentPhase.label}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90 mb-1">Cycle Day</p>
              <p className="text-3xl font-bold">{currentDay}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (Math.max(0, currentDay) / cycleLength) * 100)}%` }}
            />
          </div>
          <p className="text-sm mt-2 opacity-90">Day {currentDay} of {cycleLength}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-xl">
              <div className="w-10 h-10 bg-pink-200 rounded-lg flex items-center justify-center shrink-0">
                <Droplet className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Period</p>
                <p className="text-lg font-semibold text-gray-900">
                  {daysUntilPeriod !== null ? (
                    daysUntilPeriod < 0 ? 'Overdue' : `${daysUntilPeriod} days`
                  ) : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Expected Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {nextPeriodDate ? format(nextPeriodDate, 'MMM d') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-linear-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fertility</p>
              <p className="font-semibold text-gray-900">
                {cyclePhase === 'ovulation' ? 'High' : cyclePhase === 'follicular' ? 'Rising' : 'Low'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {cyclePhase === 'ovulation' ? 'Peak fertility window' : 'Based on cycle phase'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-linear-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Cycle</p>
              <p className="font-semibold text-gray-900">{cycleLength} days</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Based on profile settings</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Period Length</p>
              <p className="font-semibold text-gray-900">{periodDuration} days</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Average duration</p>
        </div>
      </div>

      {/* Tip Card - Dynamic based on Phase */}
      <div className="bg-linear-to-r from-pink-50 to-purple-50 rounded-2xl shadow p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">💡 Today's Tip</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {cyclePhase === 'menstrual' && "Rest and hydration are key. Listen to your body and take it easy."}
              {cyclePhase === 'follicular' && "Energy levels are rising! Great time to start new projects or exercise."}
              {cyclePhase === 'ovulation' && "You're likely feeling your best. Socialize and enjoy the high energy!"}
              {cyclePhase === 'luteal' && "Be kind to yourself. You might feel lower energy as your cycle wraps up."}
            </p>
          </div>
        </div>
      </div>

      <CalendarView />
      <SymptomTracker />
    </div>
  );
}