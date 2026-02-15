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
      <div 
        className="absolute inset-0 backdrop-blur-2xl backdrop-saturate-150"
        style={{
          background: 'hsl(var(--background) / 0.8)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-px bg-border/50" />
      
      <div className="relative flex items-center justify-between h-11 sm:h-12 lg:h-14 px-3 sm:px-4 lg:px-6 safe-area-inset-top">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {showBackButton && (
            <Link 
              to={backPath}
              className="lg:hidden -ml-1.5 sm:-ml-2 flex items-center text-primary font-medium active:opacity-50 transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
              <span className="text-[15px] sm:text-[17px] -ml-0.5 sm:-ml-1 tracking-tight">Back</span>
            </Link>
          )}
          
          <Sheet>
            <SheetTrigger asChild className="hidden lg:flex">
              <Button variant="ghost" size="icon" className="shrink-0 -ml-2 h-9 w-9 active:scale-95 transition-transform">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] border-r border-border/40 bg-sidebar">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <h1 className="text-[17px] sm:text-[17px] lg:text-lg font-semibold tracking-[-0.02em] truncate text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] lg:text-xs text-muted-foreground tracking-tight truncate hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {action}
          {showAddDeal && (
            <>
              <Link 
                to="/deals/new"
                className="sm:hidden relative group"
              >
                <Plus className="relative h-5 w-5 sm:h-6 sm:w-6 text-primary active:scale-90 transition-transform" strokeWidth={2.5} />
              </Link>
              <Button asChild className="btn-premium hidden sm:flex h-8 sm:h-9 px-3 sm:px-4 text-[13px] sm:text-[14px] font-semibold tracking-tight">
                <Link to="/deals/new">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" strokeWidth={2.5} />
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
