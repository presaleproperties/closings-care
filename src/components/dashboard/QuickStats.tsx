import { useMemo, useEffect } from 'react';
import { Wallet, Receipt, Target, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Deal, Payout } from '@/lib/types';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
  deals: Deal[];
  payouts: Payout[];
  monthlyExpenses: number;
  onAutoMarkPaid?: (payoutIds: string[]) => void;
}

export function QuickStats({ deals, payouts, monthlyExpenses, onAutoMarkPaid }: QuickStatsProps) {
  const today = startOfDay(new Date());
  const thisYear = new Date().getFullYear();

  // Find payouts that should be auto-marked as paid (due date has passed)
  useEffect(() => {
    if (!onAutoMarkPaid) return;
    
    const overdueUnpaid = payouts.filter(p => {
      if (p.status === 'PAID' || !p.due_date) return false;
      const dueDate = parseISO(p.due_date);
      return isBefore(dueDate, today);
    });

    if (overdueUnpaid.length > 0) {
      onAutoMarkPaid(overdueUnpaid.map(p => p.id));
    }
  }, [payouts, onAutoMarkPaid, today]);

  const stats = useMemo(() => {
    // Total projected income (all unpaid payouts)
    const totalProjected = payouts
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Total earned (paid payouts)
    const totalEarned = payouts
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // This year's projected income (unpaid payouts due this year)
    const thisYearProjected = payouts
      .filter(p => p.status !== 'PAID' && p.due_date && new Date(p.due_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Average deal value
    const allDeals = deals.length;
    const avgDealValue = allDeals > 0
      ? deals.reduce((sum, d) => sum + Number(d.gross_commission_est || 0), 0) / allDeals
      : 0;

    // Active deals count
    const activeDeals = deals.filter(d => d.status === 'PENDING').length;

    return {
      totalProjected,
      totalEarned,
      thisYearProjected,
      avgDealValue,
      activeDeals,
      monthlyExpenses,
    };
  }, [deals, payouts, monthlyExpenses, thisYear]);

  const statCards = [
    {
      icon: Wallet,
      label: 'Projected Income',
      value: formatCurrency(stats.totalProjected),
      subtitle: `${stats.activeDeals} active deals`,
      gradient: 'from-primary to-primary/70',
      textColor: 'text-primary-foreground',
    },
    {
      icon: Calendar,
      label: `${thisYear} Projected`,
      value: formatCurrency(stats.thisYearProjected),
      subtitle: 'Expected this year',
      gradient: 'from-success to-success/70',
      textColor: 'text-success-foreground',
    },
    {
      icon: Receipt,
      label: 'Monthly Expenses',
      value: formatCurrency(stats.monthlyExpenses),
      subtitle: 'Recurring costs',
      accent: true,
      accentColor: 'text-destructive',
    },
    {
      icon: Target,
      label: 'Avg Per Deal',
      value: formatCurrency(stats.avgDealValue),
      subtitle: 'Gross commission',
      accent: true,
      accentColor: 'text-accent',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Mobile: Horizontal scroll with snap */}
      <div className="sm:hidden -mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "flex-shrink-0 w-[75vw] max-w-[280px] snap-center rounded-2xl p-4 transition-all duration-200 active:scale-[0.98]",
                stat.gradient 
                  ? `bg-gradient-to-br ${stat.gradient} ${stat.textColor} shadow-lg`
                  : "bg-card/95 backdrop-blur-xl border border-border/50 shadow-ios"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center",
                  stat.gradient ? "bg-white/20" : "bg-primary/10"
                )}>
                  <stat.icon className={cn(
                    "h-4 w-4",
                    stat.gradient ? "opacity-90" : stat.accentColor
                  )} />
                </div>
                <span className={cn(
                  "text-[11px] font-medium uppercase tracking-wide",
                  stat.gradient ? "opacity-80" : "text-muted-foreground"
                )}>{stat.label}</span>
              </div>
              <p className={cn(
                "text-[28px] font-bold tracking-tight leading-none mb-1",
                stat.accent && stat.accentColor
              )}>
                {stat.value}
              </p>
              <p className={cn(
                "text-[12px]",
                stat.gradient ? "opacity-70" : "text-muted-foreground"
              )}>{stat.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
              stat.gradient 
                ? `bg-gradient-to-br ${stat.gradient} ${stat.textColor} shadow-xl`
                : "bg-card/95 backdrop-blur-xl border border-border/50 shadow-ios hover:shadow-ios-lg"
            )}
          >
            {stat.gradient && (
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            )}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn(
                  "h-4 w-4",
                  stat.gradient ? "opacity-80" : stat.accentColor
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  stat.gradient ? "opacity-80" : "text-muted-foreground"
                )}>{stat.label}</span>
              </div>
              <p className={cn(
                "text-2xl lg:text-3xl font-bold tracking-tight",
                stat.accent && stat.accentColor
              )}>
                {stat.value}
              </p>
              <p className={cn(
                "text-xs mt-1",
                stat.gradient ? "opacity-70" : "text-muted-foreground"
              )}>{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
