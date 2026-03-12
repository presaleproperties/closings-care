import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved === 'true';
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      setIsCollapsed(saved === 'true');
    };
    
    // Check periodically for changes (for same-tab updates)
    const interval = setInterval(handleStorage, 100);
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Bottom padding accounts for mobile nav bar + safe area; md+ uses sidebar so no bottom nav */}
      <main 
        className={`pb-[82px] md:pb-6 min-h-screen transition-all duration-300 ${
          isCollapsed ? 'md:ml-[56px]' : 'md:ml-56'
        }`}
      >
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
