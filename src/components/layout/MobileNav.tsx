import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Receipt, 
  TrendingUp,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Premium glass container - flush with bottom edge */}
      <div 
        className="relative backdrop-blur-2xl backdrop-saturate-150"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--card) / 0.92) 0%, hsl(var(--card) / 0.98) 100%)',
          boxShadow: `
            inset 0 1px 0 0 rgba(255,255,255,0.15),
            0 -2px 12px -4px hsl(220 25% 10% / 0.12),
            0 -8px 32px -8px hsl(220 25% 10% / 0.08)
          `,
        }}
      >
        {/* Premium top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Nav items */}
        <div className="relative flex justify-around items-center h-[56px] px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => triggerHaptic('light')}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200',
                  'active:scale-90 active:opacity-70',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground/50 hover:text-muted-foreground/70'
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}>
                  {/* Glow behind active icon */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-primary/15 blur-lg" />
                  )}
                  <item.icon 
                    className={cn(
                      "relative w-[20px] h-[20px] transition-all duration-200",
                      isActive && "drop-shadow-[0_0_6px_hsl(158_64%_32%/0.5)]"
                    )}
                    strokeWidth={isActive ? 2.25 : 1.75} 
                  />
                </div>
                <span className={cn(
                  "text-[10px] transition-all duration-200",
                  isActive 
                    ? "font-semibold" 
                    : "font-medium"
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Safe area spacer - extends background to bottom edge */}
        <div 
          className="w-full"
          style={{ 
            height: 'env(safe-area-inset-bottom, 0px)',
            minHeight: '0px'
          }} 
        />
      </div>
    </nav>
  );
}
