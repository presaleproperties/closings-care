import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { LayoutDashboard, GitBranch, BarChart2, Settings2 } from 'lucide-react';

const navItems = [
  { label: 'Home',      path: '/dashboard', icon: LayoutDashboard },
  { label: 'Pipeline',  path: '/pipeline',  icon: GitBranch },
  { label: 'Analytics', path: '/analytics', icon: BarChart2 },
  { label: 'Settings',  path: '/settings',  icon: Settings2 },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Frosted glass backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'hsl(var(--background) / 0.88)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        }}
      />

      {/* Top hairline border */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(var(--border)) 20%, hsl(var(--border)) 80%, transparent)',
        }}
      />

      {/* Items row */}
      <div className="relative flex justify-around items-end px-1 md:px-6 pt-2.5 pb-2">
        {navItems.map((item, i) => {
          // Center FAB
          if (item === null) {
            return (
              <div key="fab" className="relative flex flex-col items-center flex-1">
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    navigate('/deals/new');
                  }}
                  className="relative -translate-y-4 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-premium active:scale-90 transition-all duration-150 outline-none"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary-glow)), hsl(var(--primary)))',
                    boxShadow: '0 0 0 4px hsl(var(--background)), 0 4px 20px -4px hsl(var(--primary) / 0.55), 0 8px 32px -8px hsl(var(--primary) / 0.35)',
                  }}
                  aria-label="New Deal"
                >
                  <Plus
                    strokeWidth={2.5}
                    className="w-6 h-6 md:w-7 md:h-7"
                    style={{ color: 'hsl(var(--primary-foreground))' }}
                  />
                </button>
                {/* Label below */}
                <span
                  className="text-[10px] md:text-[11px] tracking-tight leading-none font-semibold -mt-2.5"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  New Deal
                </span>
              </div>
            );
          }

          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => triggerHaptic('light')}
              className="relative flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-150 active:scale-90 active:opacity-60 select-none outline-none"
            >
              {/* Active indicator bar */}
              <span
                className={cn(
                  'absolute -top-2.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-300',
                  isActive ? 'w-6 opacity-100' : 'w-0 opacity-0',
                )}
                style={{ background: 'hsl(var(--primary))' }}
              />

              {/* Icon pill */}
              <div
                className={cn(
                  'flex items-center justify-center rounded-2xl transition-all duration-200',
                  'w-11 h-8 md:w-14 md:h-9',
                )}
                style={isActive ? { background: 'hsl(var(--primary) / 0.12)' } : undefined}
              >
                <Icon
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className="w-[19px] h-[19px] md:w-[21px] md:h-[21px] transition-all duration-200"
                  style={{
                    color: isActive
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground) / 0.5)',
                  }}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] md:text-[11px] tracking-tight leading-none transition-all duration-200',
                  isActive ? 'font-semibold' : 'font-normal',
                )}
                style={{
                  color: isActive
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--muted-foreground) / 0.5)',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* iOS safe area spacer */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
