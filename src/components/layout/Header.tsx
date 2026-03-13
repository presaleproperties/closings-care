import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { useTheme } from 'next-themes';
import { ChevronLeft, Menu, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showAddDeal?: boolean;
  showBackButton?: boolean;
  backPath?: string;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground active:scale-90 transition-all duration-200"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-[15px] w-[15px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[15px] w-[15px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
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
    <header className="sticky top-0 z-40" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div
        className="absolute inset-0 backdrop-blur-2xl backdrop-saturate-150"
        style={{ background: 'hsl(var(--background) / 0.88)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--border) / 0.65) 15%, hsl(var(--border) / 0.65) 85%, transparent)' }}
      />

      <div className="relative flex items-center justify-between h-[52px] md:h-[60px] lg:h-[52px] px-4 sm:px-5 md:px-6 lg:px-6">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBackButton ? (
            <Link
              to={backPath}
              className="md:hidden -ml-1.5 flex items-center text-primary font-medium active:opacity-50 transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
              <span className="text-[15px] -ml-0.5 tracking-tight">Back</span>
            </Link>
          ) : (
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <button className="shrink-0 -ml-1 h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground active:scale-95 transition-transform">
                  <Menu className="h-[19px] w-[19px]" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[240px] border-r border-border/40 bg-sidebar">
                <Sidebar />
              </SheetContent>
            </Sheet>
          )}

          <div className="min-w-0">
            <h1 className="text-[16px] md:text-[18px] lg:text-[17px] font-semibold tracking-[-0.02em] truncate text-foreground leading-snug">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] md:text-[12px] text-muted-foreground/60 truncate hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          {action}
          {showAddDeal && (
            <Link to="/deals/new">
              <Button className="btn-premium h-8 md:h-9 px-3.5 md:px-4 text-[13px] font-semibold tracking-tight hidden sm:flex">
                New Deal
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
