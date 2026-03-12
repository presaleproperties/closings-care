import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

const navItems = [
  { label: 'Home', path: '/dashboard', short: 'H' },
  { label: 'Deals', path: '/deals', short: 'D' },
  { label: 'Inventory', path: '/inventory', short: 'Inv' },
  { label: 'Analytics', path: '/analytics', short: 'A' },
  { label: 'Settings', path: '/settings', short: 'S' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div
        className="relative backdrop-blur-2xl backdrop-saturate-150"
        style={{
          background: 'hsl(var(--background) / 0.92)',
          boxShadow: '0 -1px 0 0 hsl(var(--border) / 0.45)',
        }}
      >
        {/* Top border accent */}
        <div className="absolute inset-x-0 top-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--border) / 0.6) 20%, hsl(var(--border) / 0.6) 80%, transparent)'
        }} />

        {/* Nav items */}
        <div className="relative flex justify-around items-center h-[60px] md:h-[68px] px-2 md:px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => triggerHaptic('light')}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-1 gap-[5px] transition-all duration-200',
                  'active:scale-[0.88] active:opacity-60',
                  isActive ? 'text-primary' : 'text-muted-foreground/40'
                )}
              >
                {/* Active pill indicator */}
                <div className={cn(
                  "relative flex items-center justify-center rounded-full transition-all duration-200",
                  isActive
                    ? "bg-primary/12 w-10 md:w-14 h-[26px] md:h-[30px]"
                    : "w-10 md:w-14 h-[26px] md:h-[30px]"
                )}>
                  <div className={cn(
                    "w-5 md:w-6 h-[3px] rounded-full transition-all duration-200",
                    isActive ? "bg-primary" : "bg-transparent"
                  )} />
                </div>
                <span className={cn(
                  "text-[11px] md:text-[12px] tracking-tight transition-all duration-200",
                  isActive ? "font-semibold" : "font-normal"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Safe area */}
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
