import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showAddDeal?: boolean;
}

export function Header({ title, subtitle, action, showAddDeal = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {action}
          {showAddDeal && (
            <Button asChild className="btn-premium hidden sm:flex">
              <Link to="/deals/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Deal
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
