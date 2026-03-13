import { ReactNode } from 'react';
import { Sidebar, useSidebarCollapsed } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isCollapsed = useSidebarCollapsed();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={`pb-[82px] md:pb-[90px] lg:pb-6 min-h-screen transition-all duration-300 ${
          isCollapsed ? 'md:ml-[56px]' : 'md:ml-56'
        }`}
      >
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
