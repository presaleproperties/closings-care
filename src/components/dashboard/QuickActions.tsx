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

      {/* Mobile: iOS-style list */}
      <div className="sm:hidden">
        <div className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 overflow-hidden shadow-ios divide-y divide-border/50">
          {actions.map((action, index) => (
            <Link 
              key={action.path} 
              to={action.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 transition-colors",
                "active:bg-muted/80"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                action.primary 
                  ? "bg-gradient-to-br from-accent to-amber-400 shadow-lg shadow-accent/25" 
                  : "bg-primary/10"
              )}>
                <action.icon className={cn(
                  "h-[18px] w-[18px]",
                  action.primary ? "text-accent-foreground" : "text-primary"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[15px]">{action.label}</p>
                <p className="text-[13px] text-muted-foreground">{action.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
