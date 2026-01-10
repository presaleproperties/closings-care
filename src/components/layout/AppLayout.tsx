import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AIAssistant } from '@/components/AIAssistant';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Extra bottom padding for iOS home indicator + tab bar */}
      <main className="lg:ml-64 pb-[100px] lg:pb-0 min-h-screen">
        {children}
      </main>
      <MobileNav />
      <AIAssistant />
    </div>
  );
}
