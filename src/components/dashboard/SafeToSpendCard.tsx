import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

interface SafeToSpendCardProps {
  projectedCashIn: number; // Expected income this month
  monthlyExpenses: number; // Fixed monthly expenses
  taxSetAsideRequired: number; // Tax to set aside from this income
  upcomingObligations?: number; // Known upcoming bills/obligations
}

const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
};

export function SafeToSpendCard({
  projectedCashIn,
  monthlyExpenses,
  taxSetAsideRequired,
  upcomingObligations = 0,
}: SafeToSpendCardProps) {
  const { data: settings } = useSettings();
  const taxBuffer = (settings as any)?.tax_buffer_percent || 5;

  const calculations = useMemo(() => {
    // Apply tax buffer
    const taxWithBuffer = taxSetAsideRequired * (1 + taxBuffer / 100);
    
    // Safe to spend = Cash In - Tax - Fixed Expenses - Obligations
    const safeToSpend = projectedCashIn - taxWithBuffer - monthlyExpenses - upcomingObligations;
    
    // Runway calculation (how many months can expenses be covered)
    const runwayMonths = monthlyExpenses > 0 ? Math.floor(projectedCashIn / monthlyExpenses) : 0;
    
    // Status based on safe to spend
    let status: 'healthy' | 'tight' | 'danger' = 'healthy';
    if (safeToSpend < 0) {
      status = 'danger';
    } else if (safeToSpend < monthlyExpenses * 0.5) {
      status = 'tight';
    }

    return {
      safeToSpend: Math.max(0, safeToSpend),
      taxWithBuffer,
      runwayMonths,
      status,
      isNegative: safeToSpend < 0,
      shortfall: safeToSpend < 0 ? Math.abs(safeToSpend) : 0,
    };
  }, [projectedCashIn, monthlyExpenses, taxSetAsideRequired, upcomingObligations, taxBuffer]);

  const statusConfig = {
    healthy: {
      gradient: 'icon-gradient-primary',
      textColor: 'text-success',
      icon: CheckCircle,
      label: 'Healthy',
      bgClass: 'bg-success/5',
    },
    tight: {
      gradient: 'icon-gradient-accent',
      textColor: 'text-warning',
      icon: AlertCircle,
      label: 'Tight',
      bgClass: 'bg-warning/5',
    },
    danger: {
      gradient: 'icon-gradient-accent',
      textColor: 'text-destructive',
      icon: AlertCircle,
      label: 'At Risk',
      bgClass: 'bg-destructive/5',
    },
  };

  const config = statusConfig[calculations.status];
  const StatusIcon = config.icon;

  return (
    <motion.div 
      className="landing-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      <div className={cn("p-5", config.bgClass)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("icon-gradient-sm", config.gradient)}>
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Safe to Spend</h3>
              <div className="flex items-center gap-1.5">
                <StatusIcon className={cn("h-3.5 w-3.5", config.textColor)} />
                <span className={cn("text-sm font-medium", config.textColor)}>{config.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Amount */}
        <div className="text-center mb-5">
          <p className={cn(
            "text-4xl font-bold tracking-tight",
            calculations.isNegative ? "text-destructive" : "text-foreground"
          )}>
            {calculations.isNegative ? '-' : ''}{formatCurrency(calculations.safeToSpend)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            This is what you can safely spend this month
          </p>
        </div>

        {/* Breakdown */}
        <div className="space-y-2.5 mb-5 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Projected Cash In</span>
            <span className="font-medium text-success">+{formatCurrency(projectedCashIn)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax Set-Aside</span>
            <span className="font-medium text-destructive">-{formatCurrency(calculations.taxWithBuffer)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fixed Expenses</span>
            <span className="font-medium text-destructive">-{formatCurrency(monthlyExpenses)}</span>
          </div>
          {upcomingObligations > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Upcoming Bills</span>
              <span className="font-medium text-destructive">-{formatCurrency(upcomingObligations)}</span>
            </div>
          )}
          <div className="border-t border-border/50 pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Safe to Spend</span>
              <span className={cn("font-bold", calculations.isNegative ? "text-destructive" : "text-success")}>
                {formatCurrency(calculations.safeToSpend)}
              </span>
            </div>
          </div>
        </div>

        {/* Shortfall Warning */}
        {calculations.isNegative && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Cash Flow Warning</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You're short {formatCurrency(calculations.shortfall)} this month. Consider deferring non-essential expenses.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Runway Indicator */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Expense Runway</span>
          </div>
          <span className={cn(
            "font-bold",
            calculations.runwayMonths < 2 ? "text-destructive" : 
            calculations.runwayMonths < 4 ? "text-warning" : "text-success"
          )}>
            {calculations.runwayMonths} months
          </span>
        </div>

        {/* Helpful Context */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Spending beyond this amount creates future financial stress.
        </p>
      </div>
    </motion.div>
  );
}
