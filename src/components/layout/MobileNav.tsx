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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Premium frosted glass background with enhanced blur and gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/80 to-card/70 backdrop-blur-3xl backdrop-saturate-200" />
      
      {/* Subtle top border glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Inner shadow for depth */}
      <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />
      
      {/* Safe area padding for iPhone home indicator */}
      <div className="relative flex justify-around items-end h-[88px] px-4 pb-[env(safe-area-inset-bottom,10px)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 pt-3 pb-2 transition-all duration-300 ease-out',
                'active:scale-90 active:opacity-70',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground/70 hover:text-muted-foreground'
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ease-out",
                isActive && "bg-primary/12 scale-105"
              )}>
                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg animate-pulse" />
                )}
                <item.icon 
                  className={cn(
                    "relative w-[22px] h-[22px] transition-all duration-300",
                    isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  )}
                  strokeWidth={isActive ? 2.25 : 1.5} 
                />
              </div>
              <span className={cn(
                "text-[10px] tracking-wide transition-all duration-300",
                isActive 
                  ? "font-semibold text-primary" 
                  : "font-medium"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}