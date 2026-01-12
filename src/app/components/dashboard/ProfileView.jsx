import { useState, useEffect } from 'react';
import { User, Calendar, Bell, HelpCircle, LogOut, ChevronRight, Shield, Heart, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { useSecurity } from '../../context/SecurityContext';
import { ThemeSettings } from './ThemeSettings';
import { supabase } from '@/lib/supabase';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { HelpSupportModal } from './HelpSupportModal';

export function ProfileView() {
  const { currentTheme } = useTheme();
  const { profile, loading, refreshData } = useData();
  const { privacyMode } = useSecurity();
  const [activeSettingsTab, setActiveSettingsTab] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Safety fallback
  const colors = currentTheme?.colors || {
    primary: '#ec4899',
    gradient: 'from-pink-400 to-purple-400'
  };



  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleUpdate = async () => {
    await refreshData();
  };

  const menuItems = [
    { icon: User, label: 'Personal Details', color: '#3b82f6' }, // Blue
    { icon: Calendar, label: 'Cycle Settings', color: '#ec4899' }, // Pink
    { icon: Bell, label: 'Notifications', color: '#a855f7' }, // Purple
    { icon: Shield, label: 'Privacy & Security', color: '#f97316' }, // Orange
    { icon: HelpCircle, label: 'Help & Support', color: '#14b8a6' }, // Teal
  ];

  const handleMenuClick = (label) => {
    if (label === 'Help & Support') {
      setShowHelpModal(true);
    } else {
      setActiveSettingsTab(label);
    }
  };

  // Calculate Age
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const diff = Date.now() - new Date(dobString).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = calculateAge(profile?.date_of_birth);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 px-2 md:px-0">

      {/* 1. Modern Header Profile Card */}
      <div className="relative pt-8 flex flex-col items-center text-center">
        {/* Avatar - Clean, Modern, No Borders */}
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden relative flex items-center justify-center bg-gray-100/50 dark:bg-zinc-800 shadow-sm">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
                loading="eager"
                decoding="sync"
              />
            ) : (
              <span
                className="text-4xl font-bold text-pink-500"
              >
                {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'ME'}
              </span>
            )}
          </div>
          {/* Edit Badge */}
          <button 
            onClick={() => handleMenuClick('Personal Details')}
            className="absolute bottom-0 right-0 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-md border border-gray-100 dark:border-white/10 text-gray-400 hover:text-pink-500 transition-colors"
          >
             <User className="w-4 h-4" />
          </button>
        </div>

        {/* Name & Email */}
        <h2 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--foreground)' }}>
          {profile?.full_name || 'Selene User'}
        </h2>
        <p className={`text-sm font-medium opacity-60 ${privacyMode ? 'blur-sm select-none' : ''}`} style={{ color: 'var(--foreground)' }}>
          {privacyMode ? 'user@hidden.com' : (profile?.email || 'user@example.com')}
        </p>

        {/* Quick Stats Row - Modern Clean Look */}
        <div 
          className="mt-8 flex items-center justify-center divide-x divide-gray-200 dark:divide-white/10 rounded-2xl p-4 shadow-sm border transition-colors duration-300"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div className="px-8 text-center">
             <span className={`block text-2xl font-bold ${privacyMode ? 'blur-sm select-none' : ''}`} style={{ color: 'var(--foreground)' }}>
              {privacyMode ? '**' : (age || '-')}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest mt-1 opacity-60" style={{ color: 'var(--foreground)' }}>Age</span>
          </div>
          <div className="px-8 text-center">
            <span className="block text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{profile?.cycle_length || 28}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest mt-1 opacity-60" style={{ color: 'var(--foreground)' }}>Cycle</span>
          </div>
          <div className="px-8 text-center">
            <span className="block text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{profile?.period_length || 5}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest mt-1 opacity-60" style={{ color: 'var(--foreground)' }}>Period</span>
          </div>
        </div>
      </div>

      {/* 2. Menu Sections */}
      <div className="space-y-4">
        <h3 className="px-4 text-xs font-semibold opacity-40 uppercase tracking-wider">Settings</h3>

        <div
          className="rounded-3xl overflow-hidden backdrop-blur-xl shadow-sm border transition-all hover:shadow-md"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleMenuClick(item.label)}
                className="w-full flex items-center gap-4 p-5 transition-all hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.99] border-b last:border-0 border-gray-100/10"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>

                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm md:text-base" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                </div>
                <ChevronRight className="w-4 h-4 opacity-20" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Appearance Section */}
      <div className="space-y-4">
        <h3 className="px-4 text-xs font-semibold opacity-40 uppercase tracking-wider">Appearance</h3>
        <div 
          className="rounded-3xl p-6 backdrop-blur-xl shadow-sm border transition-all"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <ThemeSettings />
        </div>
      </div>

      {/* 4. Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-4 rounded-2xl font-semibold text-red-500 opacity-60 hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>

      {/* MODALS */}
      <ProfileSettingsModal
        isOpen={!!activeSettingsTab}
        onClose={() => setActiveSettingsTab(null)}
        activeTab={activeSettingsTab}
        initialData={profile}
        onUpdate={handleUpdate}
      />

      <HelpSupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}