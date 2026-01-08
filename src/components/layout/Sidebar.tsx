import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Receipt, 
  Calendar, 
  Upload, 
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Deals', path: '/deals' },
  { icon: Wallet, label: 'Payouts', path: '/payouts' },
  { icon: Receipt, label: 'Expenses', path: '/expenses' },
  { icon: Calendar, label: 'Forecast', path: '/forecast' },
  { icon: Upload, label: 'Import', path: '/import' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-lg leading-tight">
              Commission
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Tracker</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'nav-item',
                isActive && 'active'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={signOut}
          className="nav-item w-full text-sidebar-foreground/60 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
