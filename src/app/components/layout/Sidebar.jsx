import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, BarChart2, User, LogOut, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import logoImage from '@/assets/selene-logo.png'; 
import { useInstallPrompt } from '@/hooks/useInstallPrompt'; 

export function Sidebar({ isCollapsed, toggleSidebar }) {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: BarChart2, label: 'Insights', path: '/insights' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  return (
    <div 
      className={`hidden md:flex h-screen bg-(--card-bg) flex-col fixed left-0 top-0 transition-all duration-300 z-50 shadow-xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      
      {/* HEADER & LOGO */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-all`}>
        <img src={logoImage} alt="Selene" className="w-8 h-8 object-contain" />
        <span 
          className={`text-xl font-bold bg-linear-to-r from-(--primary) to-(--accent) bg-clip-text text-transparent whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          }`}
        >
          Selene
        </span>
      </div>

      {/* TOGGLE BUTTON */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 w-6 h-6 bg-(--card-bg) rounded-full flex items-center justify-center text-(--primary) shadow-md hover:scale-110 transition-transform z-50"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ''}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden
                ${isActive 
                  ? 'bg-(--primary) text-white shadow-lg shadow-(--primary)/20' 
                  : 'text-(--foreground) hover:bg-(--secondary)/10 hover:text-(--primary)'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''}`} />
              <span className={`whitespace-nowrap transition-all duration-300 ${
                isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* INSTALL APP BUTTON (PWA) */}
      <InstallButton isCollapsed={isCollapsed} />

      {/* LOGOUT BUTTON */}
      <div className="p-4">
        <button 
          onClick={handleLogout} 
          title="Sign Out"
          className={`
            flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors w-full rounded-xl overflow-hidden
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`whitespace-nowrap transition-all duration-300 ${
             isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
          }`}>
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}

// Separate component to keep Sidebar clean
function InstallButton({ isCollapsed }) {
  const { isInstallable, isIOS, promptInstall } = useInstallPrompt();
  // eslint-disable-next-line no-unused-vars
  const [showIOSHint, setShowIOSHint] = useState(false);

  if (!isInstallable && !isIOS) return null;

  return (
    <div className="px-4 pb-2 mt-auto">
      {isIOS ? (
        // iOS Instructions (Basic Tooltip/Hint)
        <div className={`text-xs text-center p-2 bg-(--secondary)/20 rounded-xl ${isCollapsed ? 'hidden' : 'block'}`}>
           <p className="opacity-70 mb-1">Install App</p>
           <p className="opacity-50">Tap Share <span className="inline-block px-1 bg-gray-200 dark:bg-gray-700 rounded">⎋</span> then "Add to Home Screen"</p>
        </div>
      ) : (
        // Android/Desktop Install Button
        <button
          onClick={promptInstall}
          className={`
            flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden w-full
            bg-linear-to-r from-pink-500 to-purple-500 text-white shadow-lg hover:shadow-pink-500/30
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <Download className="w-5 h-5 shrink-0" />
          <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
            Install App
          </span>
        </button>
      )}
    </div>
  );
}