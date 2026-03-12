import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logoMark from '@/assets/logo-mark.png';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavSection {
  label: string;
  items: { label: string; path: string; short?: string }[];
}

const navSections: NavSection[] = [
  {
    label: 'Production',
    items: [
      { label: 'Dashboard', path: '/dashboard', short: '⌂' },
      { label: 'Pipeline', path: '/pipeline', short: '◈' },
      { label: 'Deals', path: '/deals', short: '◇' },
      { label: 'Payouts', path: '/payouts', short: '$' },
      { label: 'Expenses', path: '/expenses', short: '−' },
      { label: 'Forecast', path: '/forecast', short: '↗' },
      { label: 'Analytics', path: '/analytics', short: '∿' },
      { label: 'Client Inventory', path: '/inventory', short: '⊞' },
    ],
  },
  {
    label: 'Network',
    items: [
      { label: 'Network', path: '/network', short: '⬡' },
    ],
  },
];

const standaloneItems = [
  { label: 'Settings', path: '/settings', short: '⚙' },
];

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';
const SECTION_COLLAPSED_KEY = 'sidebar-sections';

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved === 'true';
  });
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(SECTION_COLLAPSED_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    // Only persist collapse state on desktop — tablet is always collapsed by default
    if (window.innerWidth >= 1024) {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
    }
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem(SECTION_COLLAPSED_KEY, JSON.stringify(collapsedSections));
  }, [collapsedSections]);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-[56px]" : "w-56"
      )}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'hsl(var(--sidebar-background))',
          boxShadow: '1px 0 0 0 hsl(var(--sidebar-border))',
        }}
      />

      {/* Logo */}
      <div className="relative px-3.5 pt-5 pb-4 flex items-center gap-2.5">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <img
            src={logoMark}
            alt="Dealzflow"
            className="w-7 h-7 rounded-lg flex-shrink-0 transition-opacity duration-200 group-hover:opacity-80"
          />
          <span className={cn(
            "transition-all duration-300 overflow-hidden font-semibold text-[14px] tracking-[-0.02em] whitespace-nowrap",
            "text-sidebar-foreground/90",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Dealz<span style={{ color: 'hsl(var(--sidebar-primary))' }}>flow</span>
          </span>
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-[52px] w-5.5 h-5.5 w-5 h-5 rounded-full flex items-center justify-center bg-sidebar-background border border-sidebar-border text-sidebar-foreground/40 hover:text-sidebar-foreground transition-all duration-200 z-10"
        aria-label={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? <ChevronRight className="w-2.5 h-2.5" /> : <ChevronLeft className="w-2.5 h-2.5" />}
      </button>

      {/* Navigation */}
      <nav className="relative flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {navSections.map((section) => {
          return (
            <div key={section.label} className="mb-3">
              {!isCollapsed && (
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/30">
                  {section.label}
                </div>
              )}
              {isCollapsed && <div className="border-t border-sidebar-border/40 mx-2 my-2" />}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                  const linkEl = (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150',
                        isCollapsed && 'justify-center px-0',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/60'
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-sidebar-primary" />
                      )}
                      {isCollapsed ? (
                        <span className={cn(
                          "text-[16px] w-7 text-center leading-none select-none",
                          isActive ? "text-sidebar-primary" : "text-sidebar-foreground/35"
                        )}>
                          {item.short}
                        </span>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.path} delayDuration={0}>
                        <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
                      </Tooltip>
                    );
                  }
                  return linkEl;
                })}
              </div>
            </div>
          );
        })}

        {/* Separator */}
        <div className="border-t border-sidebar-border/30 mx-1 my-1" />

        {/* Standalone */}
        {standaloneItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const linkEl = (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150',
                isCollapsed && 'justify-center px-0',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/60'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-sidebar-primary" />
              )}
              {isCollapsed ? (
                <span className={cn(
                  "text-[16px] w-7 text-center leading-none select-none",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/35"
                )}>
                  {item.short}
                </span>
              ) : (
                <span>{item.label}</span>
              )}
            </Link>
          );
          if (isCollapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return linkEl;
        })}

        {/* Admin */}
        {isAdmin && (
          <>
            <div className="border-t border-sidebar-border/30 mx-1 my-1" />
            {isCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to="/admin"
                    className={cn(
                      'flex items-center justify-center py-2 rounded-lg text-[11px] font-semibold w-6 mx-auto tracking-tight transition-all duration-150',
                      location.pathname === '/admin'
                        ? 'text-warning bg-warning/10'
                        : 'text-warning/40 hover:text-warning hover:bg-warning/8'
                    )}
                  >
                    A
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">Admin</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                to="/admin"
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150',
                  location.pathname === '/admin'
                    ? 'bg-warning/10 text-warning'
                    : 'text-warning/40 hover:text-warning hover:bg-warning/8'
                )}
              >
                Admin
              </Link>
            )}
          </>
        )}
      </nav>

      {/* Sign out */}
      <div className="relative px-2 py-3 border-t border-sidebar-border/40">
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className="flex items-center justify-center w-full py-1.5 rounded-lg text-[11px] font-semibold tracking-tight text-sidebar-foreground/25 hover:text-destructive/70 hover:bg-destructive/8 transition-all duration-150"
              >
                ↑
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">Sign Out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13px] font-medium text-sidebar-foreground/30 hover:text-destructive/80 hover:bg-destructive/8 transition-all duration-150"
          >
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}

export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved === 'true';
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      setIsCollapsed(saved === 'true');
    };
    window.addEventListener('storage', handleStorage);
    const handleCustomEvent = () => handleStorage();
    window.addEventListener('sidebar-toggle', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sidebar-toggle', handleCustomEvent);
    };
  }, []);

  return isCollapsed;
}
