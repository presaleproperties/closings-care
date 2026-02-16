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
      {/* Extra bottom padding for iOS home indicator + tab bar */}
      <main 
        className={`pb-24 md:pb-24 lg:pb-0 min-h-screen transition-all duration-300 ${
          isCollapsed ? 'lg:ml-[68px]' : 'lg:ml-60'
        }`}
      >
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
