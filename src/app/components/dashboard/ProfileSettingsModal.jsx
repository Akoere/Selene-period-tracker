import { useState, useEffect } from 'react';
import { X, Save, User, Calendar, Bell, Shield, HelpCircle, Loader2, Trash2, Camera, EyeOff, Lock as LockIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { updateProfile, uploadAvatar } from '@/lib/api';
import { useTheme } from '../../context/ThemeContext';
import { useSecurity } from '../../context/SecurityContext';
import { PinPad } from '../security/PinPad'; // Import PinPad

export function ProfileSettingsModal({ isOpen, onClose, activeTab, initialData, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const { currentTheme } = useTheme();
    const { 
        isPinEnabled, setAppPin, disablePin, // New PIN stuff
        notificationsEnabled, toggleNotifications,
        privacyMode, togglePrivacyMode
    } = useSecurity();

    const [showPinSetup, setShowPinSetup] = useState(false); // Local state for overlay

    // Form State
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [cycleLength, setCycleLength] = useState(28);
    const [periodLength, setPeriodLength] = useState(5);

    const primaryColor = currentTheme?.colors?.primary || '#ec4899';

    useEffect(() => {
        if (initialData) {
            setFullName(initialData.full_name || '');
            setDob(initialData.date_of_birth || '');
            setAvatarUrl(initialData.avatar_url || '');
            setCycleLength(initialData.cycle_length || 28);
            setPeriodLength(initialData.period_length || 5);
        }
    }, [initialData, isOpen]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const { publicUrl, error } = await uploadAvatar(file);
            if (error) throw error;
            setAvatarUrl(publicUrl);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload image. Make sure your "avatars" bucket allows public uploads.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const updates = {};
            if (activeTab === 'Personal Details') {
                updates.full_name = fullName;
                updates.date_of_birth = dob === '' ? null : dob;
                updates.avatar_url = avatarUrl;
            } else if (activeTab === 'Cycle Settings') {
                updates.cycle_length = parseInt(cycleLength);
                updates.period_length = parseInt(periodLength);
            }

            const { error } = await updateProfile(user.id, updates);
            if (error) throw error;

            if (onUpdate) onUpdate(updates);
            onClose();
        } catch (error) {

            console.error('Error updating profile:', error);
            alert(`Failed to update profile: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        if (!window.confirm("ARE YOU SURE? This will delete ALL your daily logs permanently. This action cannot be undone.")) return;
        
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error } = await import('@/lib/api').then(mod => mod.clearAllLogs(user.id));
            if (error) throw error;

            alert("All data cleared successfully.");
            // Ideally trigger a refresh of dashboard data here, but for now just close
            onClose();
            window.location.reload(); // Reload to refresh all data context
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('Failed to clear data.');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Personal Details':
                return (
                    <div className="space-y-5">
                        {/* Profile Photo */}
                        <div>
                            <label className="block text-sm font-medium mb-3 opacity-70">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--card-border)' }}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <User className="w-6 h-6 opacity-40" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label 
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        style={{ borderColor: 'var(--card-border)' }}
                                    >
                                        <Camera className="w-4 h-4" />
                                        Upload New Photo
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden" 
                                        />
                                    </label>
                                    <p className="text-[10px] opacity-40 mt-1.5 ">Supports JPG, PNG (Max 2MB)</p>
                                </div>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all font-light"
                                    style={{ borderColor: 'var(--card-border)', '--tw-ring-color': primaryColor }}
                                />
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">Date of Birth</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all font-light"
                                style={{ borderColor: 'var(--card-border)', '--tw-ring-color': primaryColor }}
                            />
                        </div>
                    </div>
                );
            case 'Cycle Settings':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">Cycle Length (Days)</label>
                            <p className="text-xs opacity-50 mb-3">Average number of days between periods</p>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                                <input
                                    type="number"
                                    value={cycleLength}
                                    onChange={(e) => setCycleLength(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{ borderColor: 'var(--card-border)', '--tw-ring-color': primaryColor }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">Period Length (Days)</label>
                            <p className="text-xs opacity-50 mb-3">Average number of days your period lasts</p>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                                <input
                                    type="number"
                                    value={periodLength}
                                    onChange={(e) => setPeriodLength(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{ borderColor: 'var(--card-border)', '--tw-ring-color': primaryColor }}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'Notifications':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--card-border)' }}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: `${primaryColor}15` }}>
                                    <Bell className="w-5 h-5" style={{ color: primaryColor }} />
                                </div>
                                <div>
                                    <p className="font-medium">Push Notifications</p>
                                    <p className="text-xs opacity-50">Receive alerts for your next cycle</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleNotifications(!notificationsEnabled)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'opacity-100' : 'bg-gray-200 dark:bg-gray-700'}`}
                                style={{ backgroundColor: notificationsEnabled ? primaryColor : undefined }}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                );
            case 'Privacy & Security':
                return (
                    <div className="space-y-6">
                            {/* PIN Code Toggle */}
                            <div 
                                className="flex items-center justify-between p-5 rounded-2xl shadow-sm transition-shadow hover:shadow-md border"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-pink-50 text-pink-500 dark:bg-pink-900/20">
                                        <LockIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>App Lock</h3>
                                        <p className="text-sm opacity-60" style={{ color: 'var(--foreground)' }}>Secure with PIN Code</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (isPinEnabled) {
                                            if (confirm("Disable App Lock?")) disablePin();
                                        } else {
                                            setShowPinSetup(true);
                                        }
                                    }}
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                                        isPinEnabled ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                >
                                    <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                        isPinEnabled ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                                </button>
                            </div>

                            {/* Privacy Mode Toggle */}
                            <div 
                                className="flex items-center justify-between p-5 rounded-2xl shadow-sm transition-shadow hover:shadow-md border"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-purple-50 text-purple-500 dark:bg-purple-900/20">
                                        <EyeOff className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Privacy Mode</h3>
                                        <p className="text-sm opacity-60" style={{ color: 'var(--foreground)' }}>Hide sensitive numbers</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => togglePrivacyMode(!privacyMode)}
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                                        privacyMode ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                >
                                    <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                        privacyMode ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                                </button>
                            </div>

                {showPinSetup && (
                    <div 
                        className="absolute inset-0 z-50 flex flex-col"
                        style={{ backgroundColor: 'var(--card-bg)' }}
                    >
                        <div className="p-4">
                            <button onClick={() => setShowPinSetup(false)} className="text-sm">Cancel</button>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <PinPad 
                                isSettingUp={true} 
                                onPinSet={(pin) => {
                                    setAppPin(pin);
                                    setShowPinSetup(false);
                                }} 
                            />
                        </div>
                    </div>
                )}
                            <div className="pt-6 border-t md:pt-4" style={{ borderColor: 'var(--card-border)' }}>
                                <h3 className="text-sm font-bold opacity-60 mb-3 uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Data Management</h3>
                                <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900/40">
                                            <Trash2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-red-600 dark:text-red-400">Reset App Data</p>
                                            <p className="text-xs opacity-60 text-red-600/70 dark:text-red-400/70">Permanently delete your history</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClearData}
                                        className="px-4 py-2 text-sm font-bold text-red-500 bg-white dark:bg-black/20 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                    </div>
                );
            case 'Help & Support':
                return (
                    <div className="text-center py-10 opacity-60">
                        <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>This feature is coming soon!</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-70 flex items-end md:items-center justify-center p-0 md:p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />
            <div
                className="relative w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', border: '1px solid var(--card-border)' }}
            >
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
                    <h2 className="text-xl font-bold">{activeTab}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100/10 active:scale-95 transition-transform">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {renderContent()}
                </div>

                {['Personal Details', 'Cycle Settings'].includes(activeTab) && (
                    <div className="p-4 border-t pb-8 md:pb-4" style={{ borderColor: 'var(--card-border)' }}>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95 transition-transform"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
