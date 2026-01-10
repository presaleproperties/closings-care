import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showAddDeal?: boolean;
}

export function Header({ title, subtitle, action, showAddDeal = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl backdrop-saturate-150 border-b border-border/30">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0 -ml-2 h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border/50 bg-sidebar">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action}
          {showAddDeal && (
            <Button asChild className="btn-premium hidden sm:flex h-9 px-4">
              <Link to="/deals/new">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Deal
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
