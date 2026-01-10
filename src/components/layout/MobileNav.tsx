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
      {/* Liquid glass container with rounded edges */}
      <div className="relative mx-auto max-w-md">
        {/* Outer glow for premium depth */}
        <div className="absolute -inset-1 bg-gradient-to-t from-primary/5 via-transparent to-transparent rounded-[28px] blur-xl" />
        
        {/* Main liquid glass container */}
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08]">
          {/* Multi-layer glass effect for liquid look */}
          <div className="absolute inset-0 bg-card/40 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-card/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] to-transparent" />
          
          {/* Subtle inner highlight at top */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Bottom reflection */}
          <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
          
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
                    {/* Soft glow behind active icon */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-primary/25 blur-md" />
                    )}
                    <item.icon 
                      className={cn(
                        "relative w-[22px] h-[22px] transition-all duration-300",
                        isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]"
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