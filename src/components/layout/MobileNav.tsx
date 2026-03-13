import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import {
  LayoutDashboard, GitBranch, Handshake, BarChart2, Settings2,
} from 'lucide-react';

const navItems = [
  { label: 'Home',     path: '/dashboard', icon: LayoutDashboard },
  { label: 'Pipeline', path: '/pipeline',  icon: GitBranch },
  { label: 'Deals',    path: '/deals',     icon: Handshake },
  { label: 'Analytics',path: '/analytics', icon: BarChart2 },
  { label: 'Settings', path: '/settings',  icon: Settings2 },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Frosted glass backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-2xl backdrop-saturate-150"
        style={{ background: 'hsl(var(--background) / 0.92)' }}
      />

      {/* Top hairline border */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(var(--border) / 0.8) 15%, hsl(var(--border) / 0.8) 85%, transparent)',
        }}
      />

      {/* Items */}
      <div className="relative flex justify-around items-end px-2 md:px-8 pt-2 pb-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => triggerHaptic('light')}
              className={cn(
                'relative flex flex-col items-center justify-end gap-1 flex-1 py-1.5 transition-all duration-200 active:scale-90 active:opacity-60 select-none',
              )}
            >
              {/* Icon container with pill highlight */}
              <div
                className={cn(
                  'flex items-center justify-center rounded-2xl transition-all duration-200',
                  'w-12 h-[34px] md:w-14 md:h-9',
                  isActive
                    ? 'bg-primary/12'
                    : 'bg-transparent',
                )}
              >
                <Icon
                  className={cn(
                    'transition-all duration-200',
                    'w-[19px] h-[19px] md:w-[21px] md:h-[21px]',
                    isActive
                      ? 'text-primary stroke-[2.2px]'
                      : 'text-muted-foreground/55 stroke-[1.8px]',
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] md:text-[11.5px] tracking-tight leading-none transition-all duration-200',
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground/55 font-normal',
                )}
              >
                {item.label}
              </span>

              {/* Active dot */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* iOS safe area */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
