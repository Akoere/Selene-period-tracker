import { useState, useEffect } from 'react';
import { X, Droplet, Activity, FileText, Save, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export function LoggerModal({ isOpen, onClose, onSuccess, defaultTab = 'flow' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const { currentTheme } = useTheme();

  // Form State
  const [flowLevel, setFlowLevel] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState('');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setFlowLevel(null);
      setSymptoms([]);
      setNotes('');
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  // Safe Colors
  const primaryColor = currentTheme?.colors?.primary || '#ec4899';

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const today = new Date().toISOString().split('T')[0];

      const logData = {
        flow_level: flowLevel,
        symptoms: symptoms,
        notes: notes,
      };

      // Use the API function instead of direct Supabase call
      // This ensures we write to 'daily_logs' which other components read from
      const { error } = await import('@/lib/api').then(mod =>
        mod.saveDailyLog(user.id, today, logData)
      );

      if (error) throw error;

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Failed to save log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await import('@/lib/api').then(mod =>
        mod.deleteDailyLog(user.id, today)
      );
      
      if (error) throw error;

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative w-full md:w-[500px] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden transition-all transform flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--foreground)',
          border: '1px solid var(--card-border)'
        }}
      >

        {/* 1. HEADER (Fixed: Uses dynamic background instead of hardcoded white) */}
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <div>
            <h2 className="text-xl font-bold">Daily Log</h2>
            <p className="text-sm opacity-60">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100/10 transition-colors"
          >
            <X className="w-6 h-6 opacity-70" />
          </button>
        </div>

        {/* 2. TABS */}
        <div
          className="flex p-1 border-b"
          style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--background)' }}
        >
          {[
            { id: 'flow', label: 'Flow', icon: Droplet },
            { id: 'symptoms', label: 'Symptoms', icon: Activity },
            { id: 'notes', label: 'Notes', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                  }`}
                style={{ color: isActive ? primaryColor : 'var(--foreground)' }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: primaryColor }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. CONTENT AREA */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* FLOW TAB */}
          {activeTab === 'flow' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Droplet className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-medium">How is your flow today?</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {['No Flow', 'Light', 'Medium', 'Heavy'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFlowLevel(level)}
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${flowLevel === level ? 'scale-[1.02]' : 'hover:border-gray-400/30'
                      }`}
                    style={{
                      borderColor: flowLevel === level ? primaryColor : 'var(--card-border)',
                      backgroundColor: flowLevel === level ? `${primaryColor}10` : 'transparent',
                      color: 'var(--foreground)'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SYMPTOMS TAB */}
          {activeTab === 'symptoms' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-medium text-center">How are you feeling?</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Acne', 'Mood Swings', 'Cravings', 'Back Pain'].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${symptoms.includes(sym) ? 'shadow-sm' : ''
                      }`}
                    style={{
                      borderColor: symptoms.includes(sym) ? primaryColor : 'var(--card-border)',
                      backgroundColor: symptoms.includes(sym) ? `${primaryColor}15` : 'transparent',
                      color: 'var(--foreground)'
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-medium">Daily Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write about your day..."
                className="w-full h-40 p-4 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  borderColor: 'var(--card-border)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': primaryColor
                }}
              />
            </div>
          )}
        </div>

        {/* 4. FOOTER / SAVE BUTTON */}
        <div
          className="p-4 border-t flex gap-3"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <button
             onClick={handleDelete}
             className="p-3.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
             title="Delete Log"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-current/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Save Log
          </button>
        </div>

      </div>
    </div>
  );
}