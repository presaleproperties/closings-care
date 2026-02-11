import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Banknote, 
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Deal, Payout, Expense } from '@/lib/types';
import { getTrackedExpensesForMonth, getPropertyCostsForMonth } from '@/lib/expenseCalculations';
import { Property } from '@/hooks/useProperties';

interface FinancialHealthProps {
  deals: Deal[];
  payouts: Payout[];
  expenses: Expense[];
  properties: Property[];
  revShareMonthlyAvg: number;
  monthlyExpenses: number;
  annualExpenses: number;
  receivedYTD?: number;
  comingIn?: number;
}

const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };

export function FinancialHealth({ deals, payouts, expenses, properties, revShareMonthlyAvg, monthlyExpenses, annualExpenses, receivedYTD: syncedReceived, comingIn: syncedComingIn }: FinancialHealthProps) {
  const metrics = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Use synced data if available, otherwise fall back to payouts
    let paidPayouts: number;
    let moneyComing: number;

    if (syncedReceived !== undefined) {
      paidPayouts = syncedReceived;
    } else {
      paidPayouts = payouts
        .filter(p => p.status === 'PAID' && p.paid_date && new Date(p.paid_date).getFullYear() === thisYear)
        .reduce((sum, p) => sum + Number(p.amount), 0);
    }

    if (syncedComingIn !== undefined) {
      moneyComing = syncedComingIn;
    } else {
      moneyComing = payouts
        .filter(p => p.status !== 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);
    }

    // RevShare YTD = monthly avg * months elapsed
    const revShareYTD = revShareMonthlyAvg * currentMonth;
    const moneyReceived = paidPayouts + revShareYTD;

    let moneySpent = 0;
    const propertyCosts = getPropertyCostsForMonth(properties);
    const monthlyPropertyNet = propertyCosts.personalCost - propertyCosts.rentalNet;
    
    for (let month = 1; month <= currentMonth; month++) {
      const monthStr = `${thisYear}-${month.toString().padStart(2, '0')}`;
      const monthExpenses = getTrackedExpensesForMonth(expenses, monthStr);
      moneySpent += monthExpenses + monthlyPropertyNet;
    }

    // Use synced data for total year commissions if available
    const totalYearCommissions = (syncedReceived !== undefined)
      ? paidPayouts + moneyComing
      : payouts
        .filter(p => {
          const dueDate = p.due_date ? new Date(p.due_date) : null;
          const paidDate = p.paid_date ? new Date(p.paid_date) : null;
          const paidThisYear = p.status === 'PAID' && paidDate && paidDate.getFullYear() === thisYear;
          const dueThisYear = dueDate && dueDate.getFullYear() === thisYear;
          return paidThisYear || dueThisYear;
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const annualRevShare = revShareMonthlyAvg * 12;
    const totalYearIncome = totalYearCommissions + annualRevShare;

    let annualExpensesCalc = 0;
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${thisYear}-${month.toString().padStart(2, '0')}`;
      const monthExpenses = getTrackedExpensesForMonth(expenses, monthStr);
      annualExpensesCalc += monthExpenses + monthlyPropertyNet;
    }

    const netProfit = totalYearIncome - annualExpensesCalc;
    const monthsCovered = monthlyExpenses > 0 ? Math.floor(moneyComing / monthlyExpenses) : 0;

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
      totalYearIncome,
      annualExpenses: annualExpensesCalc,
    };
  }, [payouts, expenses, properties, revShareMonthlyAvg, monthlyExpenses, syncedReceived, syncedComingIn]);

  const getStatusConfig = () => {
    switch (metrics.healthStatus) {
      case 'great':
        return {
          label: "You're crushing it!",
          subtitle: "Strong cashflow and healthy pipeline",
          color: 'text-success',
          bg: 'bg-gradient-to-r from-success/15 to-success/5',
          border: 'border-success/30',
          iconBg: 'bg-gradient-to-br from-success to-emerald-600',
          icon: CheckCircle2,
        };
      case 'good':
        return {
          label: "Looking good",
          subtitle: "Your finances are on track",
          color: 'text-primary',
          bg: 'bg-gradient-to-r from-primary/15 to-primary/5',
          border: 'border-primary/30',
          iconBg: 'bg-gradient-to-br from-primary to-primary/70',
          icon: TrendingUp,
        };
      case 'needs-attention':
        return {
          label: "Needs attention",
          subtitle: "Consider adding more deals",
          color: 'text-warning',
          bg: 'bg-gradient-to-r from-warning/15 to-warning/5',
          border: 'border-warning/30',
          iconBg: 'bg-gradient-to-br from-warning to-orange-500',
          icon: TrendingDown,
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const statCards = [
    {
      label: 'Received (YTD)',
      value: metrics.moneyReceived,
      icon: Banknote,
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
      iconBg: 'bg-success/20',
    },
    {
      label: 'Coming In',
      value: metrics.moneyComing,
      icon: ArrowUpRight,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      iconBg: 'bg-primary/20',
    },
    {
      label: 'Spent (YTD)',
      value: metrics.moneySpent,
      icon: ArrowDownRight,
      color: 'text-muted-foreground',
      bg: 'bg-muted/50',
      border: 'border-border/50',
      iconBg: 'bg-muted',
    },
    {
      label: 'Pipeline Covers',
      value: metrics.monthsCovered,
      isMonths: true,
      icon: Shield,
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/20',
      iconBg: 'bg-accent/20',
    },
  ];

  return (
    <motion.div 
      className="rounded-3xl bg-card/95 backdrop-blur-xl border border-border/40 overflow-hidden shadow-lg h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
      {/* Status Header */}
      <div className="p-4 border-b border-border/40">
        <motion.div 
          className={`flex items-center gap-3 p-3 rounded-xl border ${status.bg} ${status.border}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springConfig, delay: 0.1 }}
        >
          <motion.div 
            className={`w-10 h-10 rounded-xl ${status.iconBg} flex items-center justify-center shadow-lg`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <StatusIcon className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-bold text-[15px] ${status.color}`}>{status.label}</p>
              {metrics.healthStatus === 'great' && (
                <Sparkles className="h-4 w-4 text-warning" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{status.subtitle}</p>
          </div>
        </motion.div>
      </div>

      <div className="p-4 space-y-3 flex-1">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`relative overflow-hidden p-3 rounded-xl ${stat.bg} border ${stat.border}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfig, delay: 0.1 + index * 0.05 }}
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />
              
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-6 h-6 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`h-3 w-3 ${stat.color}`} />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className={`text-lg font-bold ${stat.color}`}>
                {stat.isMonths ? (
                  <>
                    {stat.value}
                    <span className="text-xs font-medium text-muted-foreground ml-1">mo</span>
                  </>
                ) : (
                  formatCurrency(stat.value)
                )}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Net Profit Highlight */}
        <motion.div 
          className={`relative overflow-hidden p-3 rounded-xl border ${
            metrics.netProfit >= 0 
              ? 'bg-gradient-to-r from-success/15 via-success/10 to-success/5 border-success/30' 
              : 'bg-gradient-to-r from-destructive/15 via-destructive/10 to-destructive/5 border-destructive/30'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.3 }}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />
          {metrics.netProfit >= 0 && (
            <motion.div 
              className="absolute top-2 right-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4 text-warning/60" />
            </motion.div>
          )}
          
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                metrics.netProfit >= 0
                  ? 'bg-gradient-to-br from-success to-emerald-600' 
                  : 'bg-gradient-to-br from-destructive to-red-600'
              }`}>
                {metrics.netProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-white" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-white" />
                )}
              </div>
              <div>
                <span className="text-[13px] font-semibold">Net Cashflow ({new Date().getFullYear()})</span>
                <p className="text-[10px] text-muted-foreground">
                  {metrics.netProfit >= 0 ? 'Positive cashflow!' : 'Expenses exceed income'}
                </p>
              </div>
            </div>
            <span className={`text-xl font-bold ${
              metrics.netProfit >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {metrics.netProfit >= 0 ? '+' : ''}{formatCurrency(metrics.netProfit)}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
