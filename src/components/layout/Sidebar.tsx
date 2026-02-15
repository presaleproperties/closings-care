import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2,
  Wallet, 
  Receipt, 
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  Network,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavSection {
  label: string;
  items: { icon: any; label: string; path: string }[];
}

const navSections: NavSection[] = [
  {
    label: 'Production',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Pipeline', path: '/pipeline' },
      { icon: Building2, label: 'Deals', path: '/deals' },
      { icon: Wallet, label: 'Payouts', path: '/payouts' },
      { icon: Receipt, label: 'Expenses', path: '/expenses' },
      { icon: TrendingUp, label: 'Forecast', path: '/forecast' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    ],
  },
  {
    label: 'Network',
    items: [
      { icon: Network, label: 'Network', path: '/network' },
    ],
  },
];

const standaloneItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
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
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem(SECTION_COLLAPSED_KEY, JSON.stringify(collapsedSections));
  }, [collapsedSections]);

  const toggleSection = (label: string) => {
    setCollapsedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Premium glass background */}
      <div 
        className="absolute inset-0 backdrop-blur-2xl backdrop-saturate-150"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--sidebar-background) / 0.95) 0%, hsl(var(--sidebar-background) / 0.88) 100%)',
        }}
      />
      {/* Right edge shadow and border */}
      <div 
        className="absolute inset-y-0 right-0 w-px"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--sidebar-border) / 0.3) 0%, hsl(var(--sidebar-border) / 0.15) 50%, hsl(var(--sidebar-border) / 0.3) 100%)',
        }}
      />
      <div 
        className="absolute inset-y-0 -right-4 w-4 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, hsl(220 25% 10% / 0.04) 0%, transparent 100%)',
        }}
      />
      {/* Premium inner glow */}
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b from-white/[0.03] to-transparent" />

      {/* Logo */}
      <div className="relative p-4 border-b border-sidebar-border/30">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <img 
            src="/favicon.png" 
            alt="Dealzflow" 
            className="w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-105 flex-shrink-0 shadow-lg shadow-emerald-500/25"
          />
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <h1 className="font-semibold text-sidebar-foreground text-base leading-tight tracking-[-0.01em] whitespace-nowrap">
              dealzflow
            </h1>
          </div>
        </Link>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground transition-all duration-200 z-10"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--sidebar-background)) 0%, hsl(var(--sidebar-accent)) 100%)',
          boxShadow: `
            inset 0 1px 0 0 rgba(255,255,255,0.1),
            0 0 0 1px hsl(var(--sidebar-border) / 0.3),
            0 2px 8px -2px hsl(220 25% 10% / 0.15)
          `,
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Navigation */}
      <nav className="relative flex-1 p-3 space-y-1 overflow-y-auto">
        {navSections.map((section) => {
          const isSectionCollapsed = collapsedSections[section.label] ?? false;
          const hasActiveItem = section.items.some(item => 
            location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          );

          return (
            <div key={section.label}>
              {/* Section header */}
              {!isCollapsed ? (
                <button
                  onClick={() => toggleSection(section.label)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200",
                    hasActiveItem ? "text-sidebar-primary" : "text-sidebar-foreground/40 hover:text-sidebar-foreground/60"
                  )}
                >
                  {section.label}
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    isSectionCollapsed && "-rotate-90"
                  )} />
                </button>
              ) : (
                <div className="border-t border-sidebar-border/20 my-1.5 mx-2" />
              )}

              {/* Section items */}
              <div className={cn(
                "space-y-0.5 overflow-hidden transition-all duration-200",
                !isCollapsed && isSectionCollapsed && "max-h-0 opacity-0",
                !isCollapsed && !isSectionCollapsed && "max-h-[500px] opacity-100",
                isCollapsed && "max-h-[500px] opacity-100"
              )}>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  
                  const linkContent = (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        isCollapsed && 'justify-center px-0',
                        isActive 
                          ? 'bg-sidebar-accent text-sidebar-foreground' 
                          : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <item.icon className={cn(
                        "w-[18px] h-[18px] transition-all duration-200 flex-shrink-0",
                        isActive && "text-sidebar-primary"
                      )} />
                      <span className={cn(
                        "transition-all duration-300 whitespace-nowrap",
                        isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                      )}>
                        {item.label}
                      </span>
                      {isActive && !isCollapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.path} delayDuration={0}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return linkContent;
                })}
              </div>
            </div>
          );
        })}

        {/* Standalone items (Settings) */}
        <div className="border-t border-sidebar-border/20 my-1.5 mx-0" />
        {standaloneItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
          const linkContent = (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isCollapsed && 'justify-center px-0',
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-foreground' 
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className={cn(
                "w-[18px] h-[18px] transition-all duration-200 flex-shrink-0",
                isActive && "text-sidebar-primary"
              )} />
              <span className={cn(
                "transition-all duration-300 whitespace-nowrap",
                isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
              )}>
                {item.label}
              </span>
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
              )}
            </Link>
          );
          if (isCollapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return linkContent;
        })}

        {/* Admin link - only show for admins */}
        {isAdmin && (
          <>
            <div className={cn(
              "border-t border-sidebar-border/30 my-2",
              isCollapsed && "mx-2"
            )} />
            {isCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to="/admin"
                    className={cn(
                      'flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      location.pathname === '/admin'
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10'
                    )}
                  >
                    <Shield className="w-[18px] h-[18px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Admin Dashboard
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                to="/admin"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  location.pathname === '/admin'
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10'
                )}
              >
                <Shield className="w-[18px] h-[18px]" />
                <span>Admin</span>
                {location.pathname === '/admin' && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            )}
          </>
        )}
      </nav>

      {/* Sign out */}
      <div className="relative p-3 border-t border-sidebar-border/30">
        {/* Top edge highlight */}
        <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className="flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Sign Out
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
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
    
    // Also listen for custom event for same-tab updates
    const handleCustomEvent = () => handleStorage();
    window.addEventListener('sidebar-toggle', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sidebar-toggle', handleCustomEvent);
    };
  }, []);

  return isCollapsed;
}
