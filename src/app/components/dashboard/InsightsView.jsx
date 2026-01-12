import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Brain, Heart, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

export function InsightsView() {
  const { currentTheme, theme } = useTheme();
  const { allLogs: logs, loading } = useData(); // Use allLogs from context

  // Calculated Stats
  const [symptomData, setSymptomData] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [cycleData, setCycleData] = useState([]);
  const [avgMood, setAvgMood] = useState(0);

  useEffect(() => {
    if (logs && logs.length > 0) {
      processData(logs);
    }
  }, [logs]);

  const processData = (data) => {
    // 1. Process Symptoms
    const symptomCounts = {};
    data.forEach(log => {
      if (log.symptoms) {
        log.symptoms.forEach(sym => {
          symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
        });
      }
    });

    const processedSymptoms = Object.entries(symptomCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 symptoms
    setSymptomData(processedSymptoms);

    // 2. Process Moods (Convert to numbers 1-5)
    const moodScores = {
      'Happy': 5, 'Energetic': 5, 'Excited': 5,
      'Neutral': 3, 'Calm': 3,
      'Sad': 1, 'Anxious': 2, 'Irritable': 2, 'Tired': 2
    };

    let totalMood = 0;
    let moodCount = 0;

    const processedMoods = data.map((log, index) => {
      const score = moodScores[log.mood] || 3;
      if (log.mood) {
        totalMood += score;
        moodCount++;
      }
      return {
        day: `Log ${index + 1}`, // Simplified x-axis
        mood: score,
        label: log.mood || 'Neutral'
      };
    }).slice(-14); // Show last 14 entries only

    setMoodData(processedMoods);
    setAvgMood(moodCount > 0 ? (totalMood / moodCount).toFixed(1) : 0);

    // 3. Process Cycle Lengths (Advanced Logic)
    const periodStarts = [];
    let onPeriod = false;

    data.forEach(log => {
      const hasFlow = log.flow_level && log.flow_level !== 'None';
      if (hasFlow && !onPeriod) {
        periodStarts.push(new Date(log.date));
        onPeriod = true;
      } else if (!hasFlow) {
        onPeriod = false;
      }
    });

    const cycles = [];
    for (let i = 0; i < periodStarts.length - 1; i++) {
      const diffTime = Math.abs(periodStarts[i + 1] - periodStarts[i]);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      cycles.push({
        month: periodStarts[i].toLocaleString('default', { month: 'short' }),
        days: diffDays
      });
    }
    setCycleData(cycles);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;

  // Reusable Glass Card Style
  // Dynamic Chart Colors
  const isDark = document.documentElement.classList.contains('dark');
  const axisColor = isDark ? '#ffffff60' : '#00000060';
  const gridColor = isDark ? '#ffffff10' : '#00000010';
  const tooltipBg = isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)';
  const glassClass = "bg-white/65 dark:bg-gray-800/50 backdrop-blur-md border border-white/50 dark:border-white/10";

  return (
    <div className="space-y-8 pb-8 px-2 md:px-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-(--foreground)">Insights</h2>
        <p className="text-gray-500 font-medium opacity-60">Understanding your body patterns</p>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cycle Card */}
        <div className={`rounded-3xl p-5 shadow-sm transition-all hover:-translate-y-1 ${glassClass}`}>
          <div className="w-10 h-10 mb-3 bg-linear-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-200">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-1 dark:text-gray-300">Cycles</p>
            <p className="text-2xl font-bold opacity-90 dark:text-white">{cycleData.length}</p>
            <p className="text-[10px] opacity-40 mt-1 dark:text-gray-400">Logged cycles</p>
          </div>
        </div>

        {/* Mood Card */}
        <div className={`rounded-3xl p-5 shadow-sm transition-all hover:-translate-y-1 ${glassClass}`}>
          <div className="w-10 h-10 mb-3 bg-linear-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-1 dark:text-gray-300">Avg Mood</p>
            <p className="text-2xl font-bold opacity-90 dark:text-white">{avgMood}<span className="text-sm opacity-50">/5</span></p>
            <p className="text-[10px] opacity-40 mt-1 dark:text-gray-400">
              {avgMood >= 4 ? '😊 Doing great' : avgMood >= 3 ? '😐 Balanced' : '😔 Rough patch'}
            </p>
          </div>
        </div>

        {/* Logs Total */}
        <div className={`rounded-3xl p-5 shadow-sm transition-all hover:-translate-y-1 ${glassClass}`}>
          <div className="w-10 h-10 mb-3 bg-linear-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-1 dark:text-gray-300">Entry Log</p>
            <p className="text-2xl font-bold opacity-90 dark:text-white">{logs.length}</p>
            <p className="text-[10px] opacity-40 mt-1 dark:text-gray-400">Days tracked</p>
          </div>
        </div>

        {/* Heart/Health */}
        <div className={`rounded-3xl p-5 shadow-sm transition-all hover:-translate-y-1 ${glassClass}`}>
          <div className="w-10 h-10 mb-3 bg-linear-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-1 dark:text-gray-300">Status</p>
            <p className="text-lg font-bold opacity-90 dark:text-white">Tracking</p>
            <p className="text-[10px] opacity-40 mt-1 dark:text-gray-400">Keep it up!</p>
          </div>
        </div>
      </div>

      {/* --- CHARTS --- */}

      {/* 1. Cycle Length Chart */}
      {cycleData.length > 0 ? (
        <div className={`rounded-4xl p-6 shadow-sm ${glassClass}`}>
          <h3 className="text-lg font-bold opacity-90 mb-6 dark:text-white">Cycle Length History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cycleData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={axisColor} domain={[20, 40]} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                itemStyle={{ color: '#ec4899', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="days" stroke="#ec4899" strokeWidth={4} dot={{ fill: '#ec4899', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 2. Symptoms Chart */}
        {/* 2. Symptoms Chart */}
        <div className={`rounded-4xl p-6 shadow-sm ${glassClass}`}>
          <h3 className="text-lg font-bold opacity-90 mb-6 dark:text-white">Top Symptoms</h3>
          {symptomData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={symptomData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={11} interval={0} height={50} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: isDark ? '#374151' : '#f3f4f6' }} contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 6, 6]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10 italic">No symptoms logged yet.</p>
          )}
        </div>

        {/* 3. Mood Chart */}
        {/* 3. Mood Chart */}
        <div className={`rounded-4xl p-6 shadow-sm ${glassClass}`}>
          <h3 className="text-lg font-bold opacity-90 mb-6 dark:text-white">Mood Trends</h3>
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="day" hide />
                <YAxis stroke={axisColor} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: 'none' }} />
                <Line type="basis" dataKey="mood" stroke="#3b82f6" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10 italic">No mood data logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}