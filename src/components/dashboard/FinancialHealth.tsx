import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Banknote, 
  PiggyBank, 
  Calendar, 
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Shield
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Deal, Payout } from '@/lib/types';
import { springConfigs } from '@/lib/haptics';

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
          label: "You're crushing it!",
          subtitle: "Strong cashflow and healthy pipeline",
          color: 'text-emerald-600 dark:text-success',
          bg: 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border-emerald-300/50 dark:border-success/30',
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
          icon: CheckCircle2,
        };
      case 'good':
        return {
          label: "Looking good",
          subtitle: "Your finances are on track",
          color: 'text-emerald-600 dark:text-primary',
          bg: 'bg-gradient-to-r from-emerald-500/10 to-primary/5 border-primary/30',
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
          icon: TrendingUp,
        };
      case 'needs-attention':
        return {
          label: "Needs attention",
          subtitle: "Consider adding more deals to your pipeline",
          color: 'text-amber-600 dark:text-warning',
          bg: 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-300/50 dark:border-warning/30',
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
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
      color: 'text-emerald-600 dark:text-success',
      bg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-200/50 dark:border-success/20',
      iconBg: 'bg-emerald-100 dark:bg-success/20',
      iconColor: 'text-emerald-600 dark:text-success',
    },
    {
      label: 'Coming In',
      value: metrics.moneyComing,
      icon: ArrowUpRight,
      color: 'text-primary',
      bg: 'bg-gradient-to-br from-primary/10 to-primary/5',
      border: 'border-primary/20',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Spent (YTD)',
      value: metrics.moneySpent,
      icon: ArrowDownRight,
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-50 dark:bg-muted/30',
      border: 'border-slate-200/50 dark:border-border/30',
      iconBg: 'bg-slate-100 dark:bg-muted',
      iconColor: 'text-slate-500 dark:text-muted-foreground',
    },
    {
      label: 'Pipeline Covers',
      value: metrics.monthsCovered,
      isMonths: true,
      icon: Shield,
      color: 'text-accent',
      bg: 'bg-gradient-to-br from-accent/10 to-amber-500/5',
      border: 'border-accent/20',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
  ];

  return (
    <motion.div 
      className="landing-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      {/* Status Header */}
      <div className="p-5 border-b border-slate-100 dark:border-border/50">
        <motion.div 
          className={`flex items-center gap-4 p-4 rounded-2xl border ${status.bg}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springConfigs.gentle, delay: 0.1 }}
        >
          <motion.div 
            className={`w-12 h-12 rounded-xl ${status.iconBg} flex items-center justify-center shadow-lg`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <StatusIcon className="h-6 w-6 text-white" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-bold text-lg ${status.color}`}>{status.label}</p>
              {metrics.healthStatus === 'great' && (
                <Sparkles className="h-4 w-4 text-amber-400" />
              )}
            </div>
            <p className="text-[13px] text-slate-500 dark:text-muted-foreground">{status.subtitle}</p>
          </div>
        </motion.div>
      </div>

      <div className="p-5">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`relative overflow-hidden p-4 rounded-2xl ${stat.bg} border ${stat.border}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfigs.gentle, delay: 0.1 + index * 0.05 }}
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
              
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.isMonths ? (
                  <>
                    {stat.value}
                    <span className="text-sm font-normal text-slate-400 dark:text-muted-foreground ml-1">months</span>
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
          className={`relative overflow-hidden p-5 rounded-2xl border ${
            metrics.netProfit >= 0 
              ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-emerald-300/50 dark:border-success/30' 
              : 'bg-gradient-to-r from-red-500/10 via-red-500/5 to-orange-500/10 border-red-300/50 dark:border-destructive/30'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfigs.gentle, delay: 0.3 }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />
          {metrics.netProfit >= 0 && (
            <motion.div 
              className="absolute top-3 right-3"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-5 w-5 text-amber-400/60" />
            </motion.div>
          )}
          
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                metrics.netProfit >= 0 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20' 
                  : 'bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20'
              }`}>
                {metrics.netProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-white" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600 dark:text-muted-foreground">Net Profit (YTD)</span>
                <p className="text-[11px] text-slate-400 dark:text-muted-foreground">
                  {metrics.netProfit >= 0 ? 'Keep up the momentum!' : 'Incoming payouts will help'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-2xl sm:text-3xl font-bold ${
                metrics.netProfit >= 0 ? 'text-emerald-600 dark:text-success' : 'text-red-600 dark:text-destructive'
              }`}>
                {metrics.netProfit >= 0 ? '+' : ''}{formatCurrency(metrics.netProfit)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
