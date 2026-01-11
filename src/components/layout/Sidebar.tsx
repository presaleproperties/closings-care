import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Receipt, 
  TrendingUp, 
  Upload, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Deals', path: '/deals' },
  { icon: Wallet, label: 'Payouts', path: '/payouts' },
  { icon: Receipt, label: 'Expenses', path: '/expenses' },
  { icon: TrendingUp, label: 'Forecast', path: '/forecast' },
  { icon: Upload, label: 'Import', path: '/import' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col bg-sidebar h-screen fixed left-0 top-0 border-r border-sidebar-border/50 transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border/50">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <h1 className="font-semibold text-sidebar-foreground text-base leading-tight tracking-tight whitespace-nowrap">
              Commission
            </h1>
            <p className="text-xs text-sidebar-foreground/50 font-medium whitespace-nowrap">Tracker</p>
          </div>
        </Link>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-sidebar border border-sidebar-border/50 flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 shadow-sm"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
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
      <div className="p-3 border-t border-sidebar-border/50">
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
