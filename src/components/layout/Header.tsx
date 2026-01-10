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
      {/* iOS-style frosted glass header */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl backdrop-saturate-[1.8] border-b border-border/20" />
      
      <div className="relative flex items-center justify-between h-11 lg:h-14 px-4 lg:px-6 safe-area-inset-top">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Mobile back button or menu */}
          {showBackButton ? (
            <Link 
              to={backPath}
              className="lg:hidden -ml-2 flex items-center text-primary active:opacity-50 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
              <span className="text-[17px] -ml-1">Back</span>
            </Link>
          ) : (
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="shrink-0 -ml-2 h-9 w-9 active:scale-95 transition-transform">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-r border-sidebar-border/50 bg-sidebar">
                <Sidebar />
              </SheetContent>
            </Sheet>
          )}

          <div className="min-w-0 lg:ml-0">
            {/* iOS-style large title on mobile */}
            <h1 className="text-[17px] lg:text-lg font-semibold tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] lg:text-xs text-muted-foreground truncate hidden lg:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {action}
          {showAddDeal && (
            <>
              {/* Mobile: iOS-style text button */}
              <Link 
                to="/deals/new"
                className="sm:hidden text-primary font-semibold text-[17px] active:opacity-50 transition-opacity"
              >
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </Link>
              {/* Desktop: Full button */}
              <Button asChild className="btn-premium hidden sm:flex h-9 px-4">
                <Link to="/deals/new">
                  <Plus className="w-4 h-4 mr-1.5" />
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
