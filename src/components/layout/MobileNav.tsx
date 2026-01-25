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
        {/* Multi-layer outer glow for luxurious depth */}
        <div className="absolute -inset-2 rounded-[32px] opacity-60"
          style={{
            background: 'radial-gradient(ellipse at bottom, hsl(158 64% 32% / 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div className="absolute -inset-1 bg-gradient-to-t from-primary/8 via-transparent to-transparent rounded-[28px] blur-xl" />
        
        {/* Main premium glass container */}
        <div 
          className="relative overflow-hidden rounded-[24px]"
          style={{
            boxShadow: `
              inset 0 1px 0 0 rgba(255,255,255,0.12),
              inset 0 -1px 0 0 rgba(0,0,0,0.05),
              0 0 0 1px hsl(var(--border) / 0.25),
              0 4px 12px -2px hsl(220 25% 10% / 0.1),
              0 12px 24px -6px hsl(220 25% 10% / 0.12),
              0 20px 40px -8px hsl(158 64% 32% / 0.08)
            `,
          }}
        >
          {/* Multi-layer glass effect for premium liquid look */}
          <div className="absolute inset-0 bg-card/50 backdrop-blur-3xl backdrop-saturate-150" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-card/40 to-card/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent" />
          
          {/* Premium inner highlight at top */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {/* Subtle bottom reflection */}
          <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          
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
                    'flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-400 ease-out',
                    'active:scale-90 active:opacity-70',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-400 ease-out",
                    isActive && "bg-primary/12"
                  )}>
                    {/* Premium glow behind active icon */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg" />
                        <div className="absolute inset-1 rounded-xl bg-primary/15 blur-md" />
                      </>
                    )}
                    <item.icon 
                      className={cn(
                        "relative w-[22px] h-[22px] transition-all duration-400",
                        isActive && "drop-shadow-[0_0_8px_hsl(158_64%_32%/0.7)]"
                      )}
                      strokeWidth={isActive ? 2.25 : 1.5} 
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] tracking-wide transition-all duration-400",
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