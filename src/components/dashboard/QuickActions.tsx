import { Link } from 'react-router-dom';
import { Plus, Receipt, TrendingUp, Upload, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  { 
    icon: Plus, 
    label: 'New Deal', 
    path: '/deals/new', 
    primary: true,
    description: 'Add a new deal'
  },
  { 
    icon: Receipt, 
    label: 'Add Expense', 
    path: '/expenses',
    description: 'Track expenses'
  },
  { 
    icon: TrendingUp, 
    label: 'View Forecast', 
    path: '/forecast',
    description: 'See projections'
  },
  { 
    icon: Upload, 
    label: 'Import Data', 
    path: '/import',
    description: 'Import from file'
  },
];

export function QuickActions() {
  return (
    <div className="space-y-3">
      {/* Desktop: Horizontal buttons */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link key={action.path} to={action.path}>
            <button
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                "active:scale-[0.98]",
                action.primary 
                  ? "btn-premium" 
                  : "bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-border/50"
              )}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </button>
          </Link>
        ))}
      </div>

      {/* Mobile: iOS-style 2x2 Grid */}
      <div className="sm:hidden">
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action) => (
            <Link 
              key={action.path} 
              to={action.path}
              className="flex flex-col items-center gap-1.5 active:scale-[0.95] transition-transform"
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-ios",
                action.primary 
                  ? "bg-gradient-to-br from-accent to-amber-400" 
                  : "bg-card/95 backdrop-blur-xl border border-border/50"
              )}>
                <action.icon className={cn(
                  "h-6 w-6",
                  action.primary ? "text-accent-foreground" : "text-primary"
                )} />
              </div>
              <span className="text-[11px] font-medium text-center leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
