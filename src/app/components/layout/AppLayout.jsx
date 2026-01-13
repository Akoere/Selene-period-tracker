import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { PWAPrompt } from './PWAPrompt'; // Import correctly at the top
import { MobileInstallBanner } from './MobileInstallBanner';

export function AppLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div 
      className="min-h-screen flex flex-col md:flex-row transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)' 
      }}
    >
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex z-50">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      </div>

      {/* Main Content Wrapper */}
      <main 
        className={`
          flex-1 transition-all duration-300 min-h-screen w-full
          ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
        <div className="p-4 pb-24 md:p-8 md:pb-8 h-full overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* PWA Install Prompt */}
      <PWAPrompt />
      <MobileInstallBanner />
      
    </div>
  );
}