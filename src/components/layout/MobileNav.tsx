import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3,
  Network,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Building2, label: 'Deals', path: '/deals' },
  { icon: Network, label: 'Network', path: '/network' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div 
        className="relative backdrop-blur-2xl backdrop-saturate-200"
        style={{
          background: 'hsl(var(--background) / 0.82)',
          boxShadow: '0 -1px 0 0 hsl(var(--border) / 0.5), 0 -8px 32px -8px hsl(220 25% 10% / 0.08)',
        }}
      >
        {/* Top border — gradient highlight */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--border) / 0.7) 20%, hsl(var(--border) / 0.7) 80%, transparent)' }} />
        
        <div className="relative flex justify-around items-center h-[52px] px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => triggerHaptic('light')}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-all duration-200',
                  'active:scale-[0.88] active:opacity-60',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground/45'
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center",
                  isActive && "after:absolute after:inset-0 after:rounded-full after:blur-md after:bg-primary/20 after:-z-10 after:scale-150"
                )}>
                  <item.icon 
                    className="w-[22px] h-[22px]"
                    strokeWidth={isActive ? 2.25 : 1.5} 
                  />
                </div>
                <span className={cn(
                  "text-[10px]",
                  isActive ? "font-semibold" : "font-normal"
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>
        
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
