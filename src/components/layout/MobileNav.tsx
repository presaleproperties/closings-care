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
          background: 'hsl(var(--background) / 0.94)',
          boxShadow: '0 -1px 0 0 hsl(var(--border) / 0.5)',
        }}
      >
        {/* Top border gradient */}
        <div className="absolute inset-x-0 top-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--border) / 0.7) 20%, hsl(var(--border) / 0.7) 80%, transparent)'
        }} />

        {/* Nav items */}
        <div className="relative flex justify-around items-stretch h-[62px] md:h-[70px] px-1 md:px-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => triggerHaptic('light')}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 gap-[4px] transition-all duration-200',
                  'active:scale-[0.88] active:opacity-60',
                  isActive ? 'text-primary' : 'text-muted-foreground/70'
                )}
              >
                {/* Pill indicator with background */}
                <div
                  className="flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    width: '48px',
                    height: '28px',
                    background: isActive ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                  }}
                >
                  <div
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: isActive ? '22px' : '0px',
                      height: '3px',
                      background: isActive ? 'hsl(var(--primary))' : 'transparent',
                    }}
                  />
                </div>
                <span className={cn(
                  "text-[11px] md:text-[12.5px] tracking-tight leading-none transition-all duration-200",
                  isActive ? "font-semibold" : "font-normal"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* iOS safe area spacer */}
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </nav>
  );
}
