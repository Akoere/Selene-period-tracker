import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, BarChart2, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function BottomNav() {
  const location = useLocation();
  const { currentTheme } = useTheme();
  
  const primaryColor = currentTheme?.colors?.primary || '#ec4899';

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: BarChart2, label: 'Insights', path: '/insights' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div 
      // REMOVED 'border-t border-[var(--secondary)]'
      className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--card-bg)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center z-50 pb-safe transition-colors duration-300"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full pb-2 transition-all duration-300 ${
              isActive ? 'scale-105' : 'opacity-50 hover:opacity-75'
            }`}
            style={{ color: isActive ? primaryColor : 'var(--foreground)' }}
          >
            <div 
              className="p-1.5 rounded-xl mb-1 transition-colors"
              style={{ backgroundColor: isActive ? `${primaryColor}15` : 'transparent' }}
            >
              <Icon 
                className="w-6 h-6" 
                strokeWidth={isActive ? 2.5 : 2} 
                style={{ fill: isActive ? primaryColor : 'none' }}
              />
            </div>
            <span 
               className="text-[10px] font-medium leading-none"
               style={{ color: isActive ? primaryColor : 'var(--foreground)' }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}