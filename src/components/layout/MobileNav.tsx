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
    <nav className="lg:hidden fixed bottom-3 sm:bottom-4 left-0 right-0 z-50 px-3 sm:px-4 pb-[calc(env(safe-area-inset-bottom,12px)+4px)] sm:pb-[calc(env(safe-area-inset-bottom,12px)+8px)]">
      {/* Premium liquid glass container */}
      <div className="relative mx-auto max-w-[340px] sm:max-w-[380px]">
        {/* Outer ambient glow - enhanced */}
        <div 
          className="absolute -inset-4 rounded-[40px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 90% 70% at 50% 100%, hsl(158 64% 32% / 0.18) 0%, transparent 65%)',
            filter: 'blur(28px)',
          }}
        />
        
        {/* Secondary glow layer for depth */}
        <div 
          className="absolute -inset-2 rounded-[32px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 90%, hsl(158 64% 40% / 0.1) 0%, transparent 50%)',
            filter: 'blur(16px)',
          }}
        />
        
        {/* Main premium glass container */}
        <div 
          className="relative overflow-hidden rounded-[28px]"
          style={{
            boxShadow: `
              inset 0 1px 0 0 rgba(255,255,255,0.2),
              inset 0 -1px 0 0 rgba(0,0,0,0.05),
              0 0 0 1px hsl(var(--border) / 0.15),
              0 0 0 2px hsl(158 64% 32% / 0.08),
              0 -2px 6px 0 hsl(220 25% 10% / 0.04),
              0 8px 24px -6px hsl(220 25% 10% / 0.18),
              0 16px 40px -12px hsl(220 25% 10% / 0.14),
              0 32px 64px -16px hsl(158 64% 32% / 0.1)
            `,
          }}
        >
          {/* Multi-layer glass backdrop - enhanced blur */}
          <div 
            className="absolute inset-0 backdrop-blur-3xl backdrop-saturate-[1.8]"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--card) / 0.88) 0%, hsl(var(--card) / 0.95) 100%)',
            }}
          />
          
          {/* Gradient border overlay */}
          <div 
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.02) 100%)',
            }}
          />
          
          {/* Premium top highlight - dual layer */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {/* Animated shimmer effect */}
          <div className="absolute inset-x-0 top-0 h-12 pointer-events-none overflow-hidden rounded-t-[28px]">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
              style={{ transform: 'translateX(-100%)' }}
            />
          </div>
          
          {/* Subtle inner glow from top */}
          <div className="absolute inset-x-0 top-0 h-10 pointer-events-none bg-gradient-to-b from-white/[0.06] to-transparent" />
          
          {/* Nav items */}
          <div className="relative flex justify-around items-center h-[64px] sm:h-[72px] px-2 sm:px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 sm:gap-1.5 flex-1 py-1.5 sm:py-2 transition-all duration-300 ease-out',
                    'active:scale-90 active:opacity-70',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    "relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl transition-all duration-300 ease-out",
                    isActive && "bg-primary/12"
                  )}>
                    {/* Premium glow behind active icon - enhanced */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-primary/20 blur-xl" />
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-primary/15 blur-lg" />
                        <div className="absolute inset-1 rounded-lg sm:rounded-xl bg-primary/10 blur-md" />
                      </>
                    )}
                    <item.icon 
                      className={cn(
                        "relative w-5 h-5 sm:w-[22px] sm:h-[22px] transition-all duration-300",
                        isActive && "drop-shadow-[0_0_8px_hsl(158_64%_32%/0.7)]"
                      )}
                      strokeWidth={isActive ? 2.25 : 1.5} 
                    />
                  </div>
                  <span className={cn(
                    "text-[9px] sm:text-[10px] tracking-wide transition-all duration-300",
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
