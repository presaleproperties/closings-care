import { useMemo, useEffect } from 'react';
import { TrendingUp, Wallet, Receipt, Target, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Deal, Payout } from '@/lib/types';
import { parseISO, isBefore, startOfDay } from 'date-fns';

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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Projected Income */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-xl transition-transform hover:scale-[1.02]">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Projected Income</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold tracking-tight">
            {formatCurrency(stats.totalProjected)}
          </p>
          <p className="text-xs opacity-70 mt-1">{stats.activeDeals} active deals</p>
        </div>
      </div>

      {/* This Year Projected */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-success to-success/80 p-5 text-success-foreground shadow-xl transition-transform hover:scale-[1.02]">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">{thisYear} Projected</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold tracking-tight">
            {formatCurrency(stats.thisYearProjected)}
          </p>
          <p className="text-xs opacity-70 mt-1">Expected this year</p>
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm transition-all hover:border-accent/50 hover:shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Receipt className="h-4 w-4 text-destructive" />
          <span className="text-xs font-medium text-muted-foreground">Monthly Expenses</span>
        </div>
        <p className="text-2xl lg:text-3xl font-bold tracking-tight text-destructive">
          {formatCurrency(stats.monthlyExpenses)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Recurring costs</p>
      </div>

      {/* Avg Per Deal */}
      <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm transition-all hover:border-accent/50 hover:shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-muted-foreground">Avg Per Deal</span>
        </div>
        <p className="text-2xl lg:text-3xl font-bold tracking-tight">
          {formatCurrency(stats.avgDealValue)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Gross commission</p>
      </div>
    </div>
  );
}
