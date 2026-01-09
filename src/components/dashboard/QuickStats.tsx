import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Receipt, PiggyBank, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Deal, Payout } from '@/lib/types';

interface QuickStatsProps {
  deals: Deal[];
  payouts: Payout[];
  monthlyExpenses: number;
}

export function QuickStats({ deals, payouts, monthlyExpenses }: QuickStatsProps) {
  const stats = useMemo(() => {
    // Total earned (paid payouts)
    const totalEarned = payouts
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Total pending (unpaid payouts)
    const totalPending = payouts
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // This year's earnings
    const thisYear = new Date().getFullYear();
    const thisYearEarned = payouts
      .filter(p => p.status === 'PAID' && p.paid_date && new Date(p.paid_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Average deal value
    const closedDeals = deals.filter(d => d.status === 'CLOSED');
    const avgDealValue = closedDeals.length > 0
      ? closedDeals.reduce((sum, d) => sum + Number(d.gross_commission_est || 0), 0) / closedDeals.length
      : 0;

    // Active deals count
    const activeDeals = deals.filter(d => d.status === 'PENDING').length;

    // Net after expenses (estimated monthly)
    const netMonthly = (totalPending / 12) - monthlyExpenses;

    return {
      totalEarned,
      totalPending,
      thisYearEarned,
      avgDealValue,
      activeDeals,
      netMonthly,
      monthlyExpenses,
    };
  }, [deals, payouts, monthlyExpenses]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Pending */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-xl transition-transform hover:scale-[1.02]">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Pipeline</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold tracking-tight">
            {formatCurrency(stats.totalPending)}
          </p>
          <p className="text-xs opacity-70 mt-1">{stats.activeDeals} active deals</p>
        </div>
      </div>

      {/* This Year Earned */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-success to-success/80 p-5 text-success-foreground shadow-xl transition-transform hover:scale-[1.02]">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">{new Date().getFullYear()} Earned</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold tracking-tight">
            {formatCurrency(stats.thisYearEarned)}
          </p>
          <p className="text-xs opacity-70 mt-1">Paid commissions</p>
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
