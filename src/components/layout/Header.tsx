import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Menu, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showAddDeal?: boolean;
  showBackButton?: boolean;
  backPath?: string;
}

export function Header({ 
  title, 
  subtitle, 
  action, 
  showAddDeal = true,
  showBackButton = false,
  backPath = '/dashboard'
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40">
      {/* Premium frosted glass header with depth */}
      <div 
        className="absolute inset-0 backdrop-blur-3xl backdrop-saturate-150"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--background) / 0.92) 0%, hsl(var(--background) / 0.85) 100%)',
          boxShadow: `
            inset 0 -1px 0 0 hsl(var(--border) / 0.2),
            0 1px 3px 0 hsl(220 25% 10% / 0.04),
            0 4px 12px -4px hsl(220 25% 10% / 0.06)
          `,
        }}
      />
      {/* Subtle top highlight for glass effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative flex items-center justify-between h-12 lg:h-14 px-4 lg:px-6 safe-area-inset-top">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Mobile back button - premium styling */}
          {showBackButton && (
            <Link 
              to={backPath}
              className="lg:hidden -ml-2 flex items-center text-primary font-medium active:opacity-50 transition-all duration-200"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
              <span className="text-[17px] -ml-1 tracking-tight">Back</span>
            </Link>
          )}
          
          {/* Mobile logo - only show on mobile when not showing back button */}
          {!showBackButton && (
            <Link to="/dashboard" className="lg:hidden flex items-center -ml-1 active:scale-95 transition-transform">
              <img 
                src="/favicon.png" 
                alt="Dealzflow" 
                className="w-8 h-8 rounded-lg shadow-md shadow-emerald-500/20"
              />
            </Link>
          )}

          {/* Desktop sidebar menu trigger */}
          <Sheet>
            <SheetTrigger asChild className="hidden lg:flex">
              <Button variant="ghost" size="icon" className="shrink-0 -ml-2 h-9 w-9 active:scale-95 transition-transform">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] border-r border-sidebar-border/50 bg-sidebar">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            {/* Premium typography with refined weight */}
            <h1 className="text-[17px] lg:text-lg font-semibold tracking-[-0.02em] truncate text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] lg:text-xs text-muted-foreground/80 tracking-tight truncate hidden lg:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action}
          {showAddDeal && (
            <>
              {/* Mobile: Premium icon button with glow */}
              <Link 
                to="/deals/new"
                className="sm:hidden relative group"
              >
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-active:opacity-100 transition-opacity" />
                <Plus className="relative h-6 w-6 text-primary active:scale-90 transition-transform" strokeWidth={2.5} />
              </Link>
              {/* Desktop: Premium button with enhanced styling */}
              <Button asChild className="btn-premium hidden sm:flex h-9 px-4 text-[14px] font-semibold tracking-tight">
                <Link to="/deals/new">
                  <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                  Add Deal
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
