import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Receipt, 
  TrendingUp,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Building2, label: 'Deals', path: '/deals' },
  { icon: Receipt, label: 'Expenses', path: '/expenses' },
  { icon: TrendingUp, label: 'Forecast', path: '/forecast' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[env(safe-area-inset-bottom,8px)]">
      {/* Premium liquid glass container */}
      <div className="relative mx-auto max-w-md">
        {/* Outer ambient glow */}
        <div 
          className="absolute -inset-3 rounded-[36px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, hsl(158 64% 32% / 0.12) 0%, transparent 60%)',
            filter: 'blur(24px)',
          }}
        />
        
        {/* Main premium glass container */}
        <div 
          className="relative overflow-hidden rounded-[24px]"
          style={{
            boxShadow: `
              inset 0 1px 0 0 rgba(255,255,255,0.15),
              0 0 0 1px hsl(var(--border) / 0.2),
              0 -1px 3px 0 hsl(220 25% 10% / 0.03),
              0 4px 16px -4px hsl(220 25% 10% / 0.12),
              0 12px 32px -8px hsl(220 25% 10% / 0.1),
              0 24px 48px -12px hsl(158 64% 32% / 0.06)
            `,
          }}
        >
          {/* Multi-layer glass backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-2xl backdrop-saturate-150"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--card) / 0.85) 0%, hsl(var(--card) / 0.92) 100%)',
            }}
          />
          
          {/* Premium top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          
          {/* Subtle inner glow from top */}
          <div className="absolute inset-x-0 top-0 h-8 pointer-events-none bg-gradient-to-b from-white/[0.04] to-transparent" />
          
          {/* Nav items */}
          <div className="relative flex justify-around items-center h-[72px] px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-300 ease-out',
                    'active:scale-90 active:opacity-70',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ease-out",
                    isActive && "bg-primary/10"
                  )}>
                    {/* Premium glow behind active icon */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-lg" />
                        <div className="absolute inset-1 rounded-xl bg-primary/10 blur-md" />
                      </>
                    )}
                    <item.icon 
                      className={cn(
                        "relative w-[22px] h-[22px] transition-all duration-300",
                        isActive && "drop-shadow-[0_0_6px_hsl(158_64%_32%/0.6)]"
                      )}
                      strokeWidth={isActive ? 2.25 : 1.5} 
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] tracking-wide transition-all duration-300",
                    isActive 
                      ? "font-semibold" 
                      : "font-medium opacity-80"
                  )}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}