import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Banknote, PiggyBank, Calendar, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Deal, Payout } from '@/lib/types';

interface FinancialHealthProps {
  deals: Deal[];
  payouts: Payout[];
  monthlyExpenses: number;
  annualExpenses: number;
}

export function FinancialHealth({ deals, payouts, monthlyExpenses, annualExpenses }: FinancialHealthProps) {
  const metrics = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Money you've received this year
    const moneyReceived = payouts
      .filter(p => p.status === 'PAID' && p.paid_date && new Date(p.paid_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Money coming (pending payouts)
    const moneyComing = payouts
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // What you've spent (estimate based on monthly × months elapsed)
    const moneySpent = monthlyExpenses * currentMonth;

    // What's left after expenses
    const netProfit = moneyReceived - moneySpent;

    // How many months your pipeline covers
    const monthsCovered = monthlyExpenses > 0 ? Math.floor(moneyComing / monthlyExpenses) : 0;

    // Simple health status
    let healthStatus: 'great' | 'good' | 'needs-attention';
    if (netProfit > 0 && monthsCovered >= 3) {
      healthStatus = 'great';
    } else if (netProfit >= 0 || monthsCovered >= 2) {
      healthStatus = 'good';
    } else {
      healthStatus = 'needs-attention';
    }

    return {
      moneyReceived,
      moneyComing,
      moneySpent,
      netProfit,
      monthsCovered,
      healthStatus,
    };
  }, [payouts, monthlyExpenses]);

  const getStatusConfig = () => {
    switch (metrics.healthStatus) {
      case 'great':
        return {
          label: "You're doing great!",
          color: 'text-success',
          bg: 'bg-success/10 border-success/20',
          icon: CheckCircle2,
        };
      case 'good':
        return {
          label: "Looking good",
          color: 'text-primary',
          bg: 'bg-primary/10 border-primary/20',
          icon: TrendingUp,
        };
      case 'needs-attention':
        return {
          label: "Needs attention",
          color: 'text-warning',
          bg: 'bg-warning/10 border-warning/20',
          icon: TrendingDown,
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Header with status */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${status.bg} mb-5`}>
        <StatusIcon className={`h-5 w-5 ${status.color}`} />
        <div>
          <p className={`font-semibold ${status.color}`}>{status.label}</p>
          <p className="text-xs text-muted-foreground">Your financial snapshot</p>
        </div>
      </div>

      {/* Simple 4-metric grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Money Received */}
        <div className="p-4 rounded-xl bg-success/5 border border-success/10">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Received (YTD)</span>
          </div>
          <p className="text-xl font-bold text-success">{formatCurrency(metrics.moneyReceived)}</p>
        </div>

        {/* Money Coming */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Coming In</span>
          </div>
          <p className="text-xl font-bold text-primary">{formatCurrency(metrics.moneyComing)}</p>
        </div>

        {/* Money Spent */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Spent (YTD)</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(metrics.moneySpent)}</p>
        </div>

        {/* Months Covered */}
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground">Pipeline Covers</span>
          </div>
          <p className="text-xl font-bold text-accent">
            {metrics.monthsCovered} <span className="text-sm font-normal text-muted-foreground">months</span>
          </p>
        </div>
      </div>

      {/* Net profit highlight */}
      <div className={`mt-4 p-4 rounded-xl border ${metrics.netProfit >= 0 ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Net Profit (YTD)</span>
          <span className={`text-xl font-bold ${metrics.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {metrics.netProfit >= 0 ? '+' : ''}{formatCurrency(metrics.netProfit)}
          </span>
        </div>
      </div>
    </div>
  );
}