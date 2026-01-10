import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Receipt, 
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Building2, label: 'Deals', path: '/deals' },
  { icon: Wallet, label: 'Payouts', path: '/payouts' },
  { icon: Receipt, label: 'Expenses', path: '/expenses' },
  { icon: TrendingUp, label: 'Forecast', path: '/forecast' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* iOS-style frosted glass background */}
      <div className="absolute inset-0 bg-card/70 backdrop-blur-2xl backdrop-saturate-[1.8] border-t border-white/10" />
      
      {/* Safe area padding for iPhone home indicator */}
      <div className="relative flex justify-around items-end h-[84px] px-2 pb-[env(safe-area-inset-bottom,8px)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 pt-2 pb-1 transition-all duration-200',
                'active:scale-90 active:opacity-70',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center w-8 h-8 transition-all duration-300",
                isActive && "scale-105"
              )}>
                <item.icon 
                  className="w-[22px] h-[22px]" 
                  strokeWidth={isActive ? 2.25 : 1.75} 
                />
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary animate-scale-in" />
                )}
              </div>
              <span className={cn(
                "text-[10px] tracking-tight",
                isActive ? "font-semibold" : "font-medium opacity-80"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
